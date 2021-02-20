import { AuthenticationError, IResolvers } from 'apollo-server-azure-functions';
import {
  DateTimeResolver,
  EmailAddressResolver,
  UnsignedIntResolver,
} from 'graphql-scalars';
import { FilterQuery, ObjectID } from 'mongodb';

import {
  AccountDbObject,
  OrderDirection,
  Post,
  PostDbObject,
  PublishPostInput,
  QueryPostsArgs,
  SignUpInput,
  User,
  UserDbObject,
} from './graphql-codegen-typings';
import { mongoDbProvider } from './mongodb.provider';

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const getToken = ({ _id, email, socialType, user }: AccountDbObject) =>
  jwt.sign(
    {
      _id,
      socialType,
      email,
      user
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

const getAccount = (auth: string): Promise<AccountDbObject> => {
  if (!auth) throw new AuthenticationError('you must be logged in!');

  const token = auth.split('Bearer ')[1];
  if (!token) throw new AuthenticationError('you should provide a token!');

  const account = new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(new AuthenticationError('invalid token!'));
      else resolve(decoded);
    });
  });

  return account as Promise<AccountDbObject>;
};

export const resolvers: IResolvers | Array<IResolvers> = {
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  UnsignedInt: UnsignedIntResolver,
  Query: {
    user: (obj: any, { id }: { id: string }): Promise<UserDbObject> => mongoDbProvider.usersCollection.findOne({ _id: new ObjectID(id) }),
    post: (obj: any, { id }: { id: string }): Promise<PostDbObject> => mongoDbProvider.postsCollection.findOne({ _id: new ObjectID(id) }),
    posts: (obj: any, args: QueryPostsArgs): Promise<Array<PostDbObject>> => {
      const query: FilterQuery<PostDbObject> = {};
      if (args.q) {
        query.$or = [
          {
            title: {
              $regex: args.q || ""
            }
          },
          {
            content: {
              $regex: args.q || ""
            }
          }
        ]
      }
      return mongoDbProvider.postsCollection.find(query, { skip: args.offset, limit: args.limit }).sort({
        [args.orderBy?.field]: args.orderBy?.direction === OrderDirection.Desc ? 1 : -1
      }).toArray()
    },
    account: (obj: any, { id }: { id: string }): Promise<AccountDbObject> => mongoDbProvider.accountsCollection.findOne({ _id: new ObjectID(id) }),
    my: async (obj: any, _: any, context: any) => {
      const account = await getAccount(context.authorization);
      if (!account) throw new AuthenticationError("login required!");
      return mongoDbProvider.accountsCollection.findOne({ _id: new ObjectID(account._id) });
    }
  },
  Mutation: {
    publishPost: async (
      obj: any,
      { input }: { input: PublishPostInput },
      context: { authorization: string }
    ): Promise<PostDbObject> => {
      const account = await getAccount(context.authorization);
      if (!account) throw new AuthenticationError("login required!");

      const result = await mongoDbProvider.postsCollection.insertOne({
        title: input.title,
        content: input.content,
        publishedAt: new Date(),
        author: new ObjectID(account.user)
      });

      return result.ops[0] as PostDbObject;
    },
    signUp: async (obj, { input }: { input: SignUpInput }, context): Promise<UserDbObject> => {
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
    },
    likePost: async (obj, { postId }: { postId: ObjectID }, context) => {
      const account = await getAccount(context.authorization);
      if (!account) throw new AuthenticationError("login required!");
      const userId = new ObjectID(account.user);
      postId = typeof postId === "string" ? new ObjectID(postId) : postId;
      const post = await mongoDbProvider.postsCollection.findOne({
        _id: postId,
        likedBy: userId
      });
      const result = await mongoDbProvider.postsCollection.updateOne({
        _id: postId
      }, {
        [post ? '$pull' : '$addToSet']: {
          likedBy: new ObjectID(account.user)
        }
      })
      return result.result.nModified > 0 && !post;
    }
  },
  Post: {
    id: (obj: PostDbObject): ObjectID => obj._id,
    author: (obj: PostDbObject): Promise<User | UserDbObject> => mongoDbProvider.usersCollection.findOne({ _id: obj.author }),
    publishedAt: (obj) => new Date(obj.publishedAt).getTime(),
    likedBy: (obj: PostDbObject) => mongoDbProvider.usersCollection.find({ _id: { $in: ((obj?.likedBy || []) as Array<ObjectID>)?.map?.(item => new ObjectID(item)) } }).toArray()
  },
  User: {
    id: (obj: ObjectID | UserDbObject) => obj instanceof ObjectID ? obj : obj._id,
    posts: (obj: UserDbObject): Promise<PostDbObject[]> => mongoDbProvider.postsCollection.find({ author: obj._id }).toArray(),
    accounts: (obj: UserDbObject): Promise<AccountDbObject[]> => mongoDbProvider.accountsCollection.find({ user: obj._id }).toArray(),
  },
  Account: {
    id: (obj: ObjectID | AccountDbObject): string => {
      console.log(obj);
      return obj instanceof ObjectID ? obj.toString() : (obj as AccountDbObject)._id.toString();
    },
    user: (obj: AccountDbObject) => mongoDbProvider.usersCollection.findOne({ _id: obj.user }),
  }
};