import { ApolloClient, InMemoryCache, split, HttpLink, ApolloLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { nhost } from './nhost'; // IMPORT SINGLETON NHOST

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_HTTP,
});

const authLink = new ApolloLink((operation, forward) => {
  const token = nhost.auth.getAccessToken();
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }));
  return forward(operation);
});

const httpAuthLink = authLink.concat(httpLink);

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WS.replace('https', 'wss'),
    connectionParams: async () => {
      const token = nhost.auth.getAccessToken();
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  httpAuthLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
