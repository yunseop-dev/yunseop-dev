import { AuthenticationError } from 'apollo-server-azure-functions';

import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export default (context) => {
    // context = { ... headers }
    const authHeader = context.req.headers.authorization;
    if (authHeader) {
        // Bearer ....
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            try {
                const user: IUser = jwt.verify(token, process.env.JWT_SECRET) as IUser;
                return user;
            } catch (err) {
                throw new AuthenticationError('Invalid/Expired token');
            }
        }
        throw new Error("Authentication token must be 'Bearer [token]");
    }
    throw new Error('Authorization header must be provided');
};
