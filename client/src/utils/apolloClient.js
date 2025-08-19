import { ApolloClient, InMemoryCache, split, HttpLink, ApolloLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// HTTP link
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_HTTP,
});

// Authorization middleware for HTTP
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('nhostAccessToken'); // Or use Nhost SDK
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }));
  return forward(operation);
});

const httpAuthLink = authLink.concat(httpLink);

// WebSocket link for subscriptions (graphql-ws)
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WS.replace('https', 'wss'),
    connectionParams: async () => {
      const token = localStorage.getItem('nhostAccessToken');
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
    },
  })
);

// Split link so subscriptions go to ws, queries/mutations go to http
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpAuthLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
