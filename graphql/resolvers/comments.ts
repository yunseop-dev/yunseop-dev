import { AuthenticationError, UserInputError } from 'apollo-server-azure-functions';

import checkAuth from '../util/check-auth';
import Post from '../models/Post';
import Comment from '../models/Comment';

export default {
    Mutation: {
        createComment: async (_, { postId, body }, context) => {
            const { username } = checkAuth(context);
            if (body.trim() === '') {
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment body must not empty'
                    }
                });
            }

            const post = await Post.findById(postId);

            if (post) {
                const newComment = new Comment({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                });
                post.comments.unshift(newComment);
                await post.save();
                return post;
            } else throw new UserInputError('Post not found');
        },
        async deleteComment (_, { postId, commentId }, context) {
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if (post) {
                const commentIndex = post.comments.findIndex((c) => c.id === commentId);

                if (post.comments[commentIndex].username === username) {
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } else {
                throw new UserInputError('Post not found');
            }
        }
    }
};