require('dotenv').config()
import { ApolloServer } from 'apollo-server-azure-functions';
import mongoose from 'mongoose';

import typeDefs from './typeDefs';
import resolvers from './resolvers/index';
import environment from './environment';
import { DateTimeMock, EmailAddressMock, UnsignedIntMock } from 'graphql-scalars';

mongoose
  .connect(environment.mongoDb.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
      user: environment.mongoDb.user,
      password: environment.mongoDb.password
    }
  })
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error(err)
  })

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context ({ request }) {
    return {
      request
    }
  },
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