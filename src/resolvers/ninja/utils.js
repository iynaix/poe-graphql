import { URL, URLSearchParams } from "url"

import fetch from "node-fetch"

import { CURRENCY_ENDPOINTS, ITEM_ENDPOINTS, LEAGUES, NINJA_API_URL } from "../../constants"
import { normalize, truncateFloat, truncateTimestamp } from "../../utils"

const CACHE_THRESHOLD = process.env.NODE_ENV === "production" ? 10 * 60 : 60 * 60

export const getNinjaUrl = (endpoint, league = "tmpstandard") => {
    const url = new URL(NINJA_API_URL)
    const now = new Date()

    url.pathname = `/api/data/${
        CURRENCY_ENDPOINTS.includes(endpoint) ? "currencyoverview" : "itemoverview"
    }`
    url.search = new URLSearchParams({
        league: LEAGUES[league] || LEAGUES.tmpstandard,
        type: endpoint,
        date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
    })
    return url.toString()
}

export const fetchNinja = async (endpoint, league = "tmpstandard") =>
    fetch(getNinjaUrl(endpoint, league)).then((resp) => resp.json())

// fetches and inserts currencies into mongodb
const insertCurrencies = async (collection, league = "tmpstandard") => {
    let ALL = []
    let exaltedInChaos = undefined

    await Promise.all(
        CURRENCY_ENDPOINTS.map(async (endpoint) => {
            const { currencyDetails, lines } = await fetchNinja(endpoint, league)

            const linesByType = {}
            lines.forEach(({ currencyTypeName, chaosEquivalent: chaosValue, ...line }) => {
                linesByType[currencyTypeName] = { ...line, chaosValue }
                if (currencyTypeName === "Exalted Orb") {
                    exaltedInChaos = chaosValue
                }
            })

            const allCurrencies = currencyDetails
                .filter(({ name }) => name in linesByType)
                .map((item) => ({
                    ...item,
                    ...linesByType[item.name],
                    normalizedName: normalize(item.name),
                    endpoint,
                }))

            ALL = ALL.concat(allCurrencies)
        })
    )

    ALL = ALL.map((item) => ({
        ...item,
        exaltedValue: truncateFloat(item.chaosValue / exaltedInChaos, 3),
    }))

    // insert currencies into the database
    await collection.insertMany(ALL)
}

// fetches and inserts items into mongodb
const insertItems = async (collection, league = "tmpstandard") => {
    let ALL = []

    await Promise.all(
        ITEM_ENDPOINTS.map(async (endpoint) => {
            const items = await fetchNinja(endpoint, league)
            ALL = ALL.concat(
                items["lines"].map((item) => ({
                    ...item,
                    relic: item.icon ? item.icon.includes("relic=1") : false,
                    endpoint,
                    normalizedName: normalize(item.name),
                }))
            )
        })
    )

    // finally insert items into the database
    await collection.insertMany(ALL)
}

// fetches and inserts the currencies if needed
export const fetchCurrencies = async (db, league) => {
    const collName = `ninjaCurrencies_${league}`
    const fetchTime = truncateTimestamp(undefined, CACHE_THRESHOLD)

    const fetchInfo = db.collection("fetchInfo")
    let result = await fetchInfo.findOne({ collection: collName, fetchTime })

    if (!result) {
        // update metadata
        fetchInfo.update(
            { collection: collName, fetchTime: { $lt: fetchTime } },
            { collection: collName, fetchTime },
            { upsert: true }
        )
        const currencyColl = db.collection(collName)
        await currencyColl.deleteMany({})
        await insertCurrencies(currencyColl, league)
    }
}

// fetches and inserts the items if needed
export const fetchItems = async (db, league) => {
    const collName = `ninjaItems_${league}`
    const fetchTime = truncateTimestamp(undefined, CACHE_THRESHOLD)

    const fetchInfo = db.collection("fetchInfo")
    let result = await fetchInfo.findOne({ collection: collName, fetchTime })

    if (!result) {
        // update metadata
        fetchInfo.update(
            { collection: collName, fetchTime: { $lt: fetchTime } },
            { collection: collName, fetchTime },
            { upsert: true }
        )

        const itemColl = db.collection(collName)
        await itemColl.deleteMany({})
        await insertItems(itemColl, league)
    }
}
