import {
  DateTimeResolver,
  EmailAddressResolver,
  UnsignedIntResolver,
} from 'graphql-scalars';
import { ObjectID } from 'mongodb';

import {
  Post,
  PostDbObject,
  PublishPostInput,
  SignUpInput,
  User,
  UserDbObject,
} from './graphql-codegen-typings';
import { mongoDbProvider } from './mongodb.provider';

const mockCurrentUserId = '0123456789abcdef01234567';

export const resolvers = {
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  UnsignedInt: UnsignedIntResolver,
  Query: {
    user: (obj: any, { id }: { id: string }): Promise<UserDbObject | null> =>
      mongoDbProvider.usersCollection.findOne({ _id: new ObjectID(id) }),
    post: (obj: any, { id }: { id: string }): Promise<PostDbObject | null> =>
      mongoDbProvider.postsCollection.findOne({ _id: new ObjectID(id) }),
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
      console.log(obj);
      const user = await mongoDbProvider.usersCollection.insertOne({
        firstName: input.firstName,
        lastName: input.lastName,
        accounts: []
      });
      console.log("user");
      const account = await mongoDbProvider.accountsCollection.insertOne({
        email: input.email,
        password: input.password,
        socialType: input.socialType,
        user: user.insertedId
      });
      console.log("account");
      user.ops[0].accounts.push(account.insertedId);

      await mongoDbProvider.usersCollection.updateOne({
        _id: user.insertedId,
      }, {
        $set: {
          accounts: [account.insertedId]
        }
      })
      return user.ops[0];
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
  },
};