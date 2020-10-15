import gql from "graphql-tag"

import { LEAGUES } from "../../constants"
import { createModel, createModelSDL, enumType } from "../../graphql_models"
import { currency, item, mod } from "./models"

/*
type Sparkline {
    data: [Float]!
    totalChange: Float!
}
*/

export default gql`
    ${enumType("League", Object.keys(LEAGUES))}

    type Transaction {
        id: Int!
        league_id: Int!
        pay_currency_id: Int!
        get_currency_id: Int!
        sample_time_utc: String!
        count: Int!
        value: Int!
        data_point_count: Int!
        includes_secondary: Boolean!
    }

    ${createModelSDL("ItemModifier", mod)}

    ${createModel("Item", "ninjaItems", item, { queryParameters: { league: "League" } })}
    ${createModel("Currency", "ninjaCurrencies", currency, {
        queryParameters: { league: "League" },
    })}
`
