import { AuthenticationError } from 'apollo-server-azure-functions';

import jwt from 'jsonwebtoken';
import { IAccount } from '../models/Account';

export default (context) => {
    // context = { ... headers }
    const authHeader = context.request.headers.authorization;
    if (authHeader) {
        // Bearer ....
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            try {
                const account: IAccount = jwt.verify(token, process.env.JWT_SECRET) as IAccount;
                return account;
            } catch (err) {
                throw new AuthenticationError('Invalid/Expired token');
            }
        }
        throw new Error("Authentication token must be 'Bearer [token]");
    }
    throw new Error('Authorization header must be provided');
};
