import { ApolloClient, InMemoryCache, split, HttpLink, ApolloLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_HTTP,
});

// Authorization middleware for HTTP requests
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('nhostAccessToken');
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }));
  return forward(operation);
});

const httpAuthLink = authLink.concat(httpLink);

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WS.replace('https', 'wss'),
    connectionParams: async () => {
      const token = localStorage.getItem('nhostAccessToken');
      return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
    },
  })
);

// Split link directs subscriptions to wsLink, others to httpAuthLink
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpAuthLink
);

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
