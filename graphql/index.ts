require('dotenv').config()
import {
  ApolloServer
} from 'apollo-server-azure-functions';
import {
  DateTimeMock,
  EmailAddressMock,
  UnsignedIntMock,
  typeDefs as scalarTypeDefs,
} from 'graphql-scalars';
import { resolvers } from "./resolvers";

import environment from './environment';
import { addMockUsersAsync, mongoDbProvider } from './mongodb.provider';
import typeDefs from "./typeDefs";
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';

mongoDbProvider.connectAsync(environment.mongoDb.databaseName).then(() => {
  addMockUsersAsync(); // TODO: Remove in Production.
});

const server = new ApolloServer({
  resolvers,
  context ({ request }) {
    const authorization = request.headers.authorization || '';
    return {
      authorization
    }
  },
  typeDefs: [DIRECTIVES, typeDefs],
  introspection: environment.apollo.introspection,
  mocks: {
    DateTime: DateTimeMock,
    EmailAddress: EmailAddressMock,
    UnsignedInt: UnsignedIntMock,
  }, // TODO: Remove in PROD.
  mockEntireSchema: false, // TODO: Remove in PROD.
  playground: environment.apollo.playground,
});

exports.graphqlHandler = server.createHandler();