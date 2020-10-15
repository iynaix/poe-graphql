import mingo from "mingo"

import { createMongoResolver } from "../../graphql_models"
import { getDb } from "../../utils/"
import { fetchCurrencies, fetchItems } from "../ninja/utils"
import { arbitrageItem } from "./models"
import { currencyRewards, divinationRewards, prophecyRewards, uniqueRewards } from "./rewards"
import { groupDivCardsByType } from "./utils"

export default {
    arbitrage: async (_, { league = "tmpstandard", ...searchParams }) => {
        // fetch data if it is out of date
        const db = await getDb()
        await fetchItems(db, league)
        await fetchCurrencies(db, league)

        const itemColl = db.collection("ninjaItems")
        const currencyColl = db.collection("ninjaCurrencies")
        const rewardsByType = await groupDivCardsByType(itemColl)

        const results = await Promise.all([
            uniqueRewards(itemColl, rewardsByType["uniqueitem"]),
            divinationRewards(itemColl, rewardsByType["divination"]),
            prophecyRewards(itemColl, rewardsByType["prophecy"]),
            currencyRewards(currencyColl, rewardsByType["currencyitem"]),
        ]).then((res) => [].concat.apply([], res))

        const [mongoMatch, mongoSort] = createMongoResolver(searchParams, arbitrageItem)
        return new mingo.Query(mongoMatch).find(results).sort(mongoSort).all()
    },
}
