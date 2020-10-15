import gql from "graphql-tag"

import { createModel } from "../../graphql_models"
import { arbitrageItem } from "./models"

export default gql`
    ${createModel("Arbitrage", "arbitrage", arbitrageItem, {
        queryParameters: { league: "League" },
    })}
`
