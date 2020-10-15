import gql from "graphql-tag"

export default gql`
    type SubChallenge {
        name: String!
        detail: String
        completed: Boolean!
    }

    type Challenge {
        name: String!
        detail: String
        completed: Boolean!
        subChallenges(completed: Boolean): [SubChallenge]
    }

    extend type Query {
        challenges(poeSessionId: String, completed: Boolean): [Challenge]!
    }
`
