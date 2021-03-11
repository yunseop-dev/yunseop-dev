import { AuthenticationError, UserInputError } from 'apollo-server-azure-functions';

import Post from '../models/Post';
import checkAuth from '../util/check-auth';

export default {
    Query: {
        async posts () {
            try {
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            } catch (err) {
                throw new Error(err);
            }
        },
        async post (_, { postId }) {
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post;
                } else {
                    throw new Error('Post not found');
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createPost (_, { content, title }, context) {
            const account = checkAuth(context);

            if (content.trim() === '') {
                throw new Error('Post body must not be empty');
            }

            const newPost = new Post();
            newPost.title = title;
            newPost.content = content;
            newPost.author = account.user;
            newPost.publishedAt = new Date().toISOString();

            const post = await newPost.save();

            return post;
        },
        async deletePost (_, { postId }, context) {
            const account = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                if (account.user === post.author) {
                    await post.delete();
                    return 'Post deleted successfully';
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } catch (err) {
                throw new Error(err);
            }
        },
        async likePost (_, { postId }, context) {
            const account = checkAuth(context);
            const userId = account.user;

            const post = await Post.findById(postId);
            if (post) {
                if (post.likedBy.find((like) => like.toString() == userId.toString())) {
                    // Post already likes, unlike it
                    post.likedBy = post.likedBy.filter((like) => like.toString() != userId.toString());
                } else {
                    // Not liked, like post
                    post.likedBy.push(userId);
                }
                return post.save();
            } else throw new UserInputError('Post not found');
        }
    }
};