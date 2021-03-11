import { model, Schema, Document } from 'mongoose';
import { IUser } from './User';

enum SocialType {
    GITHUB,
    FACEBOOK,
    TWITTER,
    GOOGLE,
    EMAIL
}

export interface IAccount extends Document {
    email: string;
    socialType: SocialType;
    password: string;
    user: IUser['id'];
}

const accountSchema = new Schema({
    email: String,
    socialType: {
        type: String,
        enum: [SocialType.EMAIL, SocialType.FACEBOOK, SocialType.TWITTER, SocialType.GOOGLE],
        default: SocialType.EMAIL
    },
    password: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

export default model<IAccount>('Account', accountSchema);
