import { model, Schema, Document } from 'mongoose';
import { IAccount } from './Account';

export interface IUser extends Document {
    id: Schema.Types.ObjectId;
    firstName: string;
    lastName: string;
    following: Array<IUser['id']>;
    accounts: Array<IAccount['id']>;
}

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    createdAt: [
        {
            type: Schema.Types.ObjectId,
            ref: 'accounts'
        }
    ]
});

export default model<IUser>('User', userSchema);