import graphqlFields from "graphql-fields"

import { getDb } from "../../utils"
import { searchIn, searchNumeric, searchString } from "../graphql_models"
import { searchOwned, searchWatchlist } from "./search"
import { fetchMtx, fetchMtxWatchlistIds, fetchOwnedMtxNames } from "./utils"

export default {
    mtx: async (_, { poeSessionId, ...search }, ctx, info) => {
        const infoFields = graphqlFields(info)

        let watchlistIds = [],
            ownedNames = []

        const hasWatchlistField = "watchlist" in infoFields
        const hasOwnedField = "owned" in infoFields

        // fetch watchlist ids if required
        if (hasWatchlistField || search.watchlist !== undefined) {
            if (poeSessionId) {
                watchlistIds = await fetchMtxWatchlistIds(poeSessionId)
            } else {
                throw new Error("Fetching watchlist items requires a poeSessionId.")
            }
        }

        // fetch owned names if required
        if (hasOwnedField && !poeSessionId && search.owned !== undefined) {
            if (poeSessionId) {
                ownedNames = await fetchOwnedMtxNames(poeSessionId)
            } else {
                throw new Error("Fetching owned items requires a poeSessionId.")
            }
        }

        const params = {
            ...searchIn(search, "ids", "id"),
            ...searchIn(search, "categories", "category"),
            ...searchString(search, "name", "normalizedName"),
            ...searchString(search, "description"),
            ...searchNumeric(search, "price"),
            ...searchNumeric(search, "discountedPrice"),
            ...searchWatchlist(search, watchlistIds),
            ...searchOwned(search, ownedNames),
        }

        if ("discounted" in search) {
            params.discountedPrice = { [search.discounted ? "$ne" : "$eq"]: null }
        }

        // fetch data if it is out of date
        const client = await getDb()
        const collection = client.db().collection("mtx")
        await fetchMtx(collection)

        return await collection
            .aggregate([
                { $match: params },
                {
                    $addFields: {
                        // add watchlist and owned fields if requested
                        watchlist: hasWatchlistField ? { $in: ["$id", watchlistIds] } : false,
                        owned: hasOwnedField ? { $in: ["$name", ownedNames] } : false,
                    },
                },
                { $sort: { id: 1 } },
            ])
            .toArray()
    },
}
