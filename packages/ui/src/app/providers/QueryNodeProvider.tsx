import {
  ApolloClient,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import React, { ReactNode, useEffect, useState } from 'react'

import { Loading } from '@/common/components/Loading'
import { useNetwork } from '@/common/hooks/useNetwork'
import { useNetworkEndpoints } from '@/common/hooks/useNetworkEndpoints'
import { error } from '@/common/logger'
import { ServerContextProvider } from '@/common/providers/server/provider'
import { makeServer } from '@/mocks/server'

interface Props {
  children: ReactNode
}

export const QueryNodeProvider = ({ children }: Props) => {
  const { network } = useNetwork()
  const [endpoints] = useNetworkEndpoints()
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>()

  useEffect(() => {
    setApolloClient(getApolloClient(endpoints.queryNodeEndpoint, endpoints.queryNodeEndpointSubscription))
  }, [endpoints.queryNodeEndpointSubscription, endpoints.queryNodeEndpoint])

  if (!apolloClient) {
    return <Loading text={'Loading query nodes'} />
  }

  if (network === 'local-mocks') {
    return (
      <ServerContextProvider value={makeServer('development', endpoints)}>
        <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
      </ServerContextProvider>
    )
  }

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

const getApolloClient = (queryNodeEndpoint: string, queryNodeEndpointSubscription: string) => {
  const httpLink = new HttpLink({
    uri: queryNodeEndpoint,
  })

  const errorLink = onError((errorResponse) => {
    if (errorResponse.networkError) {
      error('Error connecting to query node')
    }

    if (errorResponse.graphQLErrors) {
      error('GraphQL error', errorResponse.graphQLErrors)
    }
  })

  const queryLink = from([errorLink, httpLink])
  const subscriptionLink = new WebSocketLink({
    uri: queryNodeEndpointSubscription,
    options: {
      reconnect: true,
      reconnectionAttempts: 5,
    },
  })

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    subscriptionLink,
    queryLink
  )

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    connectToDevTools: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'standby',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  })
}
