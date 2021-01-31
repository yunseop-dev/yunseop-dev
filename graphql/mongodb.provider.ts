import { Collection, Db, MongoClient, ObjectID } from 'mongodb';

import environment from './environment';
import { AccountDbObject, PostDbObject, SocialType, UserDbObject } from './graphql-codegen-typings';

export class MongoDbProvider {
    private database?: Db;
    private mongoClient: MongoClient;

    constructor(url: string) {
        this.mongoClient = new MongoClient(url, {
            useUnifiedTopology: true, auth: {
                user: environment.mongoDb.user,
                password: environment.mongoDb.password
            }
        });
    }

    get postsCollection (): Collection<PostDbObject> {
        const postsCollection = this.getCollection('posts');

        if (!postsCollection) {
            throw new Error('Posts collection is undefined');
        }

        return postsCollection;
    }

    get usersCollection (): Collection<UserDbObject> {
        const usersCollection = this.getCollection('users');

        if (!usersCollection) {
            throw new Error('Users collection is undefined');
        }

        return usersCollection;
    }

    get accountsCollection (): Collection<AccountDbObject> {
        const accountsCollection = this.getCollection('accounts');

        if (!accountsCollection) {
            throw new Error('Accounts collection is undefined');
        }

        return accountsCollection;
    }

    /**
     * Connect to MongoDB.
     * @async
     * @param databaseName - Database name.
     */
    async connectAsync (databaseName: string): Promise<void> {
        await this.mongoClient.connect();
        this.database = this.mongoClient.db(databaseName);
    }

    /**
     * Close the database and its underlying connections.
     */
    async closeAsync (): Promise<void> {
        await this.mongoClient.close();
    }

    /**
     * Fetch a specific collection.
     * @private
     * @param collectionName - Collection name.
     * @returns The collection instance.
     */
    private getCollection (collectionName: string): Collection {
        if (!this.database) {
            throw new Error('Database is undefined.');
        }

        return this.database.collection(collectionName);
    }
}

export const mongoDbProvider = new MongoDbProvider(environment.mongoDb.url);

/**
 * Add mock users if `users` collection is empty.
 * TODO: Remove in Production.
 */
export async function addMockUsersAsync (): Promise<void> {
    try {

        const accountsCount = await mongoDbProvider.accountsCollection.countDocuments();
        if (accountsCount === 0) {
            await mongoDbProvider.usersCollection.insertMany([
                {
                    _id: new ObjectID('4567890123abcdef45670123'),
                    firstName: 'Test',
                    lastName: 'User 1',
                    following: [new ObjectID('fedcba987654321098765432')],
                    accounts: [new ObjectID('0123456789abcdef01234567')]
                },
                {
                    _id: new ObjectID('fedcba987654321098765432'),
                    firstName: 'Test',
                    lastName: 'User 2',
                    following: [new ObjectID('4567890123abcdef45670123')],
                    accounts: [new ObjectID('abc0123456789def01234567')]
                }
            ])
            console.log("🐛");
            await mongoDbProvider.accountsCollection.insertMany([
                {
                    _id: new ObjectID('0123456789abcdef01234567'),
                    email: 'test.user1@test.com',
                    socialType: SocialType.Email,
                    password: "1234",
                    user: new ObjectID('4567890123abcdef45670123')
                },
                {
                    _id: new ObjectID('abc0123456789def01234567'),
                    email: 'test.user2@test.com',
                    socialType: SocialType.Email,
                    password: "1234",
                    user: new ObjectID('fedcba987654321098765432')
                },
            ]);
            console.log("🐛  mock users added.");
        }
    } catch (error) {
        console.log("🐛", error.message);
    }
}