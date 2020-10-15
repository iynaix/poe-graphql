import gql from "graphql-tag"

import { MTX_ENDPOINTS } from "../../constants"

export default gql`
    enum MtxCategory {
        ${Object.keys(MTX_ENDPOINTS).join("\n")}
    }

    type Mtx {
        id: String!
        name: String!
        description: String!
        image: String!
        discountedPrice: Int,
        price: Int!
        video: String
        category: [String]!
        watchlist: Boolean!
        owned: Boolean!
    }

    extend type Query {
        mtx(
            poeSessionId: String,
            ids: [String],
            name: StringFilter,
            description: StringFilter,
            discounted: Boolean,
            categories: [MtxCategory],
            price: IntFilter
            discountedPrice: IntFilter
            watchlist: Boolean,
            owned: Boolean,
        ): [Mtx]!
     }
`
