import { model, Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string;
    email: string;
    createdAt: string;
}

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String
});

export default model<IUser>('User', userSchema);