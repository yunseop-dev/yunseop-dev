import postsResolvers from './posts';
import usersResolvers from './users';
import commentsResolvers from './comments';
import { IPost } from '../models/Post';
import User, { IUser } from '../models/User';
import Account, { IAccount } from '../models/Account';

export default {
    Post: {
        likedBy: (parent: IPost) => User.find({
            _id: {
                $in: parent.likedBy
            }
        }),
        author: (parent: IPost) => User.findById(parent.author),
    },
    User: {
        id: (parent: IUser) => parent._id,
        following: (parent: IUser) => User.find({
            _id: {
                $in: parent.following
            }
        }),
        accounts: (parent: IUser) => Account.find({ user: parent._id })
    },
    Account: {
        id: (parent: IAccount) => parent._id,
        user: (parent: IAccount) => User.findById(parent.user)
    },
    Query: {
        ...postsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation
    }
}
