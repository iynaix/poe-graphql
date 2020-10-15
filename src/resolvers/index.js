import arbitrageResolver from "./arbitrage"
import ninjaResolver from "./ninja"
// import challengeResolver, { Challenge } from "./challenges"
// import mtxResolver from "./mtx"
// import gemsResolver from "./gems"

export default {
    Query: {
        ...ninjaResolver,
        ...arbitrageResolver,
        // ...challengeResolver,
        // ...mtxResolver,
        // ...gemsResolver,
    },
    // Challenge,
}
