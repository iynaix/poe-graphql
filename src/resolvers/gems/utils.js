import fs from "fs"

import cheerio from "cheerio"
import isString from "lodash"
import fetch from "node-fetch"

import { POEDB_URL } from "../../constants"

export const fetchPOEDb = async (url) => {
    /*
    // handle relative url
    if (isString(url) && url.startsWith("/")) {
        url = new URL(url, POEDB_URL)
    }

    const content = await fetch(url).then((resp) => resp.text())
    */

    const content = fs.readFileSync("./poedb.html")
    return cheerio.load(content)
}

export const fetchPOEWiki = async (url) => {
    // handle relative url
    /*
    if (isString(url) && url.startsWith("/")) {
        url = new URL(url, POEWIKI_URL)
    }

    const content = await fetch(url).then((resp) => resp.text())
    */

    const content = fs.readFileSync("./poewiki.html")
    return cheerio.load(content)
}

export const tableToCells = ($, tbl, { cellText = false, hasHeader = false } = {}) => {
    const ret = []
    $(tbl)
        .find("tbody tr")
        .each((i, row) =>
            ret.push(
                $(row)
                    .find("td,th")
                    .toArray()
                    .map(cellText ? (cell) => $(cell).text() : $)
            )
        )
    return hasHeader ? ret.slice(1) : ret
}

export const gemColor = (className) => {
    if (!className) {
        return "white"
    }

    if (className.includes("gem_red")) {
        return "red"
    }

    if (className.includes("gem_blue")) {
        return "blue"
    }

    if (className.includes("gem_green")) {
        return "green"
    }

    return "white"
}
