import { AuthenticationError } from 'apollo-server-azure-functions';
import {
  DateTimeResolver,
  EmailAddressResolver,
  UnsignedIntResolver,
} from 'graphql-scalars';
import { ObjectID } from 'mongodb';

import {
  AccountDbObject,
  Post,
  PostDbObject,
  PublishPostInput,
  SignUpInput,
  User,
  UserDbObject,
} from './graphql-codegen-typings';
import { mongoDbProvider } from './mongodb.provider';

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const getToken = ({ _id: id, email, socialType }: AccountDbObject) =>
  jwt.sign(
    {
      id,
      socialType,
      email
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

const mockCurrentUserId = '0123456789abcdef01234567';

export const resolvers = {
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  UnsignedInt: UnsignedIntResolver,
  Query: {
    user: (obj: any, { id }: { id: string }): Promise<UserDbObject | null> => mongoDbProvider.usersCollection.findOne({ _id: new ObjectID(id) }),
    post: (obj: any, { id }: { id: string }): Promise<PostDbObject | null> => mongoDbProvider.postsCollection.findOne({ _id: new ObjectID(id) }),
    account: (obj: any, { id }: { id: string }): Promise<AccountDbObject | null> => mongoDbProvider.accountsCollection.findOne({ _id: new ObjectID(id) }),
  },
  Mutation: {
    publishPost: async (
      obj: any,
      { input }: { input: PublishPostInput }
    ): Promise<PostDbObject> => {
      const result = await mongoDbProvider.postsCollection.insertOne({
        title: input.title,
        content: input.content,
        publishedAt: new Date(),
        author: new ObjectID(mockCurrentUserId),
      });

      return result.ops[0] as PostDbObject;
    },
    signUp: async (obj, { input }: { input: SignUpInput }): Promise<UserDbObject> => {
      const accounts = await mongoDbProvider.accountsCollection.find({
        email: input.email
      }).toArray();

      if (accounts.length > 0) {
        throw new Error("Already email exists");
      }

      const user = await mongoDbProvider.usersCollection.insertOne({
        firstName: input.firstName,
        lastName: input.lastName,
        accounts: []
      });
      const account = await mongoDbProvider.accountsCollection.insertOne({
        email: input.email,
        password: await bcrypt.hash(input.password, 10),
        socialType: input.socialType,
        user: user.insertedId
      });

      user.ops[0].accounts.push(account.insertedId);

      await mongoDbProvider.usersCollection.updateOne({
        _id: user.insertedId,
      }, {
        $set: {
          accounts: [account.insertedId]
        }
      });
      return user.ops[0];
    },
    signIn: async (obj, { email, password }: { email: string, password: string }): Promise<string> => {
      const account = await mongoDbProvider.accountsCollection.findOne({
        email
      });
      if (!account) {
        throw new AuthenticationError("user not found");
      }

      const match = await bcrypt.compare(password, account.password);
      if (!match) throw new AuthenticationError('wrong password!');

      return getToken(account);
    }
  },
  Post: {
    id: (obj: Post | PostDbObject): string =>
      (obj as PostDbObject)._id
        ? (obj as PostDbObject)._id.toString()
        : (obj as Post).id,
    author: async (obj: Post | PostDbObject): Promise<User | UserDbObject> =>
      obj.author instanceof ObjectID
        ? (mongoDbProvider.usersCollection.findOne({
          _id: obj.author,
        }) as Promise<UserDbObject>)
        : obj.author,
  },
  User: {
    id: (obj: User | UserDbObject): string =>
      (obj as UserDbObject)._id
        ? (obj as UserDbObject)._id.toString()
        : (obj as User).id,
    posts: (obj: User | UserDbObject): Promise<Post | PostDbObject[]> =>
      mongoDbProvider.postsCollection
        .find({
          author: (obj as User).id
            ? new ObjectID((obj as User).id)
            : (obj as UserDbObject)._id,
        })
        .toArray(),
    accounts: (obj: User | UserDbObject): Promise<AccountDbObject[]> => mongoDbProvider.accountsCollection.find({
      user: (obj as User).id
        ? new ObjectID((obj as User).id)
        : (obj as UserDbObject)._id,
    }).toArray(),
  },
  Account: {
    id: (obj: ObjectID | AccountDbObject): string => {
      return obj instanceof ObjectID ? obj.toString() : (obj as AccountDbObject)._id.toString();
    }
  }
};