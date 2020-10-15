import { URL } from "url"
import { inspect } from "util"

import cheerio from "cheerio"
import isString from "lodash/isString"
import fetch from "node-fetch"

export const pprint = (obj) => console.log(inspect(obj, { colors: true, depth: null }))

export const truncateFloat = (n, places) => +(Math.round(n + "e+" + places) + "e-" + places)

// quotient of n / divisor
export const quot = (n, divisor) => n - (n % divisor)

// unix timestamp in seconds
export const timestamp = (dt = new Date()) => (dt.getTime() / 1000) | 0

// truncate timestamp to the nearest n seconds
export const truncateTimestamp = (dt = new Date(), n) => quot(timestamp(dt), n)

// truncate timestamp to the nearest n seconds
export const truncateTimestampToDailyUTC = (dt = new Date(), utcOffsetInSeconds) => {
    const now = timestamp(dt)
    const rem = (now - utcOffsetInSeconds) % (24 * 60 * 60)
    return now - rem
}

export const normalize = (s) =>
    s.trim().toLowerCase().replace("ö", "o").replace("'", "").replace(",", "").replace("-", " ")

// generate graphql schema boilerplate for recursive query
export const whereInput = (name) => `_and: [${name}]\n_not: [${name}]\n_or: [${name}]`

export const fetchPOE = async (url, poeSessionId) => {
    // handle relative url
    if (isString(url) && url.startsWith("/")) {
        url = new URL(url, "https://pathofexile.com")
    }

    return fetch(
        url,
        poeSessionId ? { headers: { cookie: `POESESSID=${poeSessionId}` } } : undefined
    )
}

export const fetchPOEHtml = async (url, poeSessionId) => {
    const content = await fetchPOE(url, poeSessionId).then((resp) => resp.text())
    return cheerio.load(content)
}

export const fetchPOEApi = async (url, poeSessionId) =>
    fetchPOE(url, poeSessionId).then((resp) => resp.json())

export { default as getDb, closeDb } from "./db"
