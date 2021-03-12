import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserInputError } from 'apollo-server-azure-functions';

import {
    validateLoginInput
} from '../util/validators';
import Account, { IAccount } from '../models/Account';
import checkAuth from '../util/check-auth';

function generateToken (account: IAccount) {
    return jwt.sign(
        {
            id: account.id,
            email: account.email,
            socialType: account.socialType,
            user: account.user
        },
        process.env.JWT_SECRET,
        { expiresIn: '30 days' }
    );
}

export default {
    Query: {
        my (_, _params, context) {
            const account = checkAuth(context);
            return account;
        }
    },
    Mutation: {
        async login (_, { email, password }) {
            const { errors, valid } = validateLoginInput(email, password);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const account = await Account.findOne({
                email
            });

            if (!account) {
                errors.general = 'Account not found';
                throw new UserInputError('Account not found', { errors });
            }

            const match = await bcrypt.compare(password, account.password);
            if (!match) {
                errors.general = 'Wrong crendetials';
                throw new UserInputError('Wrong crendetials', { errors });
            }

            const token = generateToken(account);
            return {
                account,
                token
            };
        },
        // async register (
        //     _,
        //     {
        //         registerInput: { username, email, password, confirmPassword }
        //     }
        // ) {
        //     // Validate user data
        //     const { valid, errors } = validateRegisterInput(
        //         username,
        //         email,
        //         password,
        //         confirmPassword
        //     );
        //     if (!valid) {
        //         throw new UserInputError('Errors', { errors });
        //     }
        //     // TODO: Make sure user doesnt already exist
        //     const user = await User.findOne({ username });
        //     if (user) {
        //         throw new UserInputError('Username is taken', {
        //             errors: {
        //                 username: 'This username is taken'
        //             }
        //         });
        //     }
        //     // hash password and create an auth token
        //     password = await bcrypt.hash(password, 12);

        //     const newUser = new User({
        //         email,
        //         username,
        //         password,
        //         createdAt: new Date().toISOString()
        //     });

        //     const res = await newUser.save();

        //     const token = generateToken(res);

        //     return {
        //         ...res,
        //         id: res._id,
        //         token
        //     };
        // }
    }
};