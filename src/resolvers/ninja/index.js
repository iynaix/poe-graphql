import { createMongoResolver } from "../../graphql_models"
import { getDb } from "../../utils/"
import { currency, item } from "./models"
import { fetchCurrencies, fetchItems } from "./utils"

export default {
    ninjaCurrencies: async (_, { league = "tmpstandard", ...searchParams }) => {
        // fetch data if it is out of date
        const db = await getDb()
        await fetchCurrencies(db, league)

        const [$match, $sort] = createMongoResolver(searchParams, currency, {
            chaosValue: 1,
        })

        return db
            .collection(`ninjaCurrencies_${league}`)
            .aggregate([{ $match }, { $sort }])
            .toArray()
    },
    ninjaItems: async (_, { league = "tmpstandard", ...searchParams }) => {
        // fetch data if it is out of date
        const db = await getDb()
        await fetchItems(db, league)

        const [$match, $sort] = createMongoResolver(searchParams, item, { chaosValue: 1 })

        return db.collection(`ninjaItems_${league}`).aggregate([{ $match }, { $sort }]).toArray()
    },
}
