import { URL } from "url"

import { MTX_ENDPOINTS, MTX_OWNED_URL, MTX_WATCHLIST_URL } from "../../constants"
import { fetchPOEApi, fetchPOEHtml, normalize, truncateTimestampToDailyUTC } from "../../utils"

const processVideoUrl = (url) => {
    if (!url) {
        return null
    }

    if (url.startsWith("//")) {
        url = `https:${url}`
    }
    url = new URL(url)
    url.search = ""
    return url.toString().replace("embed/", "watch?v=")
}

export const fetchOwnedMtxNames = async (poeSessionUrl) => {
    const mtx = []
    const allMtx = await fetchPOEApi(MTX_OWNED_URL, poeSessionUrl)
    allMtx.groups.forEach((grp) => {
        grp.MTXItems.forEach(({ name }) => {
            mtx.push(name)
        })
    })
    return mtx
}

export const fetchMtxWatchlistIds = async (poeSessionUrl) => {
    const $ = await fetchPOEHtml(MTX_WATCHLIST_URL, poeSessionUrl)
    return $("div.shopItemBase")
        .map((i, elem) => $(elem).data("item-id"))
        .toArray()
}

export const fetchMtxPage = async (url, category) => {
    const $ = await fetchPOEHtml(url)

    return $("div.shopItemBase")
        .map((i, elem) => {
            elem = $(elem)
            const name = elem.find("a.name").text().trim()
            const modal = elem.find("div.shopBuyItemModal")
            const discounted = !!elem.find("div.onSaleIcon").length
            const price = elem.find("div.price").text().trim() | 0

            return {
                id: elem.data("item-id"),
                name,
                normalizedName: normalize(name),
                category: [category],
                image: elem.find("a.itemImage").data("href"),
                discountedPrice: discounted ? price : null,
                price: discounted ? modal.find("div.savings div.value").text() | 0 : price,
                description: elem.find("div.description").first().text().trim(),
                video: processVideoUrl(modal.find("div.videoEmbed iframe").data("src")),
            }
        })
        .toArray()
}

export const insertMtx = async (collection, fetchTime) => {
    const ALL = {}

    await Promise.all(
        Object.keys(MTX_ENDPOINTS).map((cat) =>
            fetchMtxPage(MTX_ENDPOINTS[cat], cat).then((items) => {
                // dedupe the items by id
                items.forEach((item) => {
                    if (item.id in ALL) {
                        const existing = ALL[item.id]
                        ALL[item.id] = {
                            ...existing,
                            // item belongs in multiple categories
                            category: existing.category.concat(item.category),
                            fetchTime,
                        }
                    } else {
                        ALL[item.id] = item
                    }
                })
            })
        )
    )

    // remove all outdated items
    await collection.deleteMany({
        fetchTime: { $lt: fetchTime },
    })

    // finally insert the mtx into the database
    await collection.insertMany(Object.values(ALL))
}

export const fetchMtx = async (collection) => {
    // mtx refreshes at 3 am UTC daily, add 5 minutes for safety
    const fetchTime = truncateTimestampToDailyUTC(undefined, 3 * 60 * 60 + 5 * 60)

    let result = await collection.findOne({ fetchTime })
    if (!result) {
        await insertMtx(collection, fetchTime)
    }
}
