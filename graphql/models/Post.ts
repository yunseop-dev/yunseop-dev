import { model, Schema, Document } from 'mongoose';
import { IComment } from './Comment';
import { IUser } from './User';
export interface IPost extends Document {
    id: Schema.Types.ObjectId,
    content: string,
    title: string,
    publishedAt: string,
    comments: Array<IComment>,
    likedBy: Array<IUser['id']>,
    author: IUser['id']
}

const postSchema = new Schema({
    content: String,
    title: String,
    publishedAt: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'comments'
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