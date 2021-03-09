import { model, Schema, Document } from 'mongoose';
import { IUser } from './User';
export interface IComment extends Document {
    id: Schema.Types.ObjectId;
    content: string;
    user: IUser;
    createdAt: string;
}

const commentSchema = new Schema({
    content: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    createdAt: String
});

export default model<IComment>('Comment', commentSchema);