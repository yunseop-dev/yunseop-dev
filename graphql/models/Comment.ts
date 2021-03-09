import { model, Schema, Document } from 'mongoose';
export interface IComment extends Document {
    id: Schema.Types.ObjectId;
    body: string;
    username: string;
    createdAt: string;
}

const commentSchema = new Schema({
    body: String,
    username: String,
    createdAt: String
});

export default model<IComment>('Comment', commentSchema);