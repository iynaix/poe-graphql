import gql from "graphql-tag"

// inserts the global typedefs before user defined SDL
export const createTypedefs = (s) => {
    const globalTypedefs = gql`
        type Query {
            # implementation detail, ignore
            _empty: String
        }

        enum OrderBy {
            asc
            desc
        }

        # filters for graphql
        input BooleanFilter {
            _eq: Boolean
            _ne: Boolean
        }

        # only allow for equality and list checks
        input IntMembershipFilter {
            _eq: Int
            _ne: Int
            _in: [Int!]
            _nin: [Int!]
        }

        input IntFilter {
            _eq: Int
            _ne: Int
            _lt: Int
            _lte: Int
            _gt: Int
            _gte: Int
            _in: [Int!]
            _nin: [Int!]
        }

        input FloatFilter {
            _eq: Float
            _ne: Float
            _lt: Float
            _lte: Float
            _gt: Float
            _gte: Float
        }

        input StringFilter {
            _eq: String
            _ieq: String
            _ne: String
            _ine: String
            _contains: String
            _icontains: String
            _startswith: String
            _istartswith: String
            _endswith: String
            _iendswith: String
            _regex: String
            _iregex: String
            _in: [String!]
            _nin: [String!]
        }

        # only allow for equality and list checks
        input StringMembershipFilter {
            _eq: String
            _ne: String
            _in: [String!]
            _nin: [String!]
        }
    `

    return gql`
        ${globalTypedefs}
        ${s}
    `
}

// merges fragments of mongo search params to prevent overriding of $and
export const mergeMongoQueries = (...queries) => {
    const ands = []
    const rests = []

    queries.forEach(({ $and: andCond, ...rest } = {}) => {
        if (andCond) {
            ands.push(andCond)
        }

        rests.push(rest)
    })

    const ret = Object.assign({}, ...rests)
    if (ands.length) {
        ret["$and"] = [].concat(...ands)
    }

    return ret
}
