import { ApolloServer } from "apollo-server-lambda"

import resolvers from "../resolvers"
import typeDefs from "../typedefs"

const server = new ApolloServer({
    typeDefs,
    resolvers,
    debug: false,
    // enable graphql-playground in production
    introspection: true,
    playground: true,
})

export const handler = server.createHandler({
    cors: {
        origin: "*",
        credentials: true,
    },
})
