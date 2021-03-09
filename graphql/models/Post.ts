import { model, Schema, Document } from 'mongoose';
export interface IPost extends Document {
    id: Schema.Types.ObjectId,
    body: string,
    username: string,
    createdAt: string,
    comments: Array<{
        id: Schema.Types.ObjectId,
        body: string,
        username: string,
        createdAt: string
    }>,
    likes: Array<{
        username: string,
        createdAt: string
    }>,
    user: Schema.Types.ObjectId
}

const postSchema = new Schema({
    content: String,
    title: String,
    publishedAt: String,
    comments: [
        {
            body: String,
            username: String,
            createdAt: String
        }
    ],
    likedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

export default model<IPost>('Post', postSchema);