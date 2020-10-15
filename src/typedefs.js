import gql from "graphql-tag"

import { createTypedefs } from "./graphql_models"
import arbitrageTypedefs from "./resolvers/arbitrage/typedefs"
import ninjaTypedefs from "./resolvers/ninja/typedefs"

// import gemTypedefs from "./resolvers/gems/typedefs"
// import mtxTypedefs from "./resolvers/mtx/typedefs"
// import challengeTypedefs from "./resolvers/challenges/typedefs"

export default createTypedefs(
    gql`
        # ninja currencies and items
        ${ninjaTypedefs}

        # arbitrage
        ${arbitrageTypedefs}
    `
)

/*
    # challenges
    ${challengeTypedefs}

    # mtx
    ${mtxTypedefs}

    # gems
    ${gemTypedefs}
*/
