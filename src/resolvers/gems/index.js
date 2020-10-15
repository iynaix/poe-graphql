import { URL } from "url"

import { CHARACTERS } from "../../constants"
import { fetchPOEDb, fetchPOEWiki, gemColor, tableToCells } from "./utils"

const SKILLS_URL = "https://poedb.tw/us/gem.php?cn=Active+Skill+Gem"
const REWARDS_URL = "https://pathofexile.gamepedia.com/List_of_skill_gems_rewarded_from_quests"
const REWARD_RE = /Act (\d+) after (.*) with (.*)\./
const VENDOR_RE = /Act (\d+) after (.*) from (.*) with (.*)/

const charObj = () => CHARACTERS.reduce((acc, v) => ({ ...acc, [v]: undefined }), {})

const parseReward = (reward) => {
    if (!reward || reward === "N/A") {
        return null
    }

    const ret = charObj()
    const [act, quest, chars] = reward.match(REWARD_RE).slice(1)
    chars.split(", ").forEach((v) => {
        ret[v] = {
            act: act | 0,
            quest,
        }
    })
    return ret
}

const parseVendor = (s) => {
    const ret = charObj()

    s.split(".").forEach((reward) => {
        if (reward) {
            const [act, quest, , chars] = reward.match(VENDOR_RE).slice(1)
            if (chars === "any character") {
                CHARACTERS.forEach((char) => {
                    // only add the info if there isnt an earlier quest
                    if (!ret[char]) {
                        ret[char] = { act: act | 0, quest }
                    }
                })
            } else {
                chars.split(", ").forEach((char) => {
                    ret[char] = { act: act | 0, quest }
                })
            }
        }
    })

    return ret
}

const parseGems = async () => {
    const ret = {}
    const url = new URL(SKILLS_URL)
    const $ = await fetchPOEDb(url)

    $("table.table").each((i, tbl) => {
        tableToCells($, tbl).forEach(([img, info]) => {
            const link = info.find("a")

            const [name, req, , tags] = info
                .contents()
                .map((i, x) => $(x).text())
                .toArray()

            const gem = {
                name,
                image: img.find("img").attr("src"),
                details: link.attr("href"),
                color: gemColor(link.attr("class")),
                req: req.replace(/[^0-9]+/g, "") | 0,
                tags: tags.split(","),
                // TODO: type: active, support, drop only
            }
            ret[name] = gem
        })
    })
    return ret
}

const parseRewards = async () => {
    const url = new URL(REWARDS_URL)
    const $ = await fetchPOEWiki(url)
    const ret = {}

    const tbl = $("table.wikitable").first()
    tableToCells($, tbl, { hasHeader: true }).forEach(([gem, reward, vendor]) => {
        const name = gem.find("span.header").text()

        ret[name] = {
            reward: parseReward(reward.text()),
            vendor: parseVendor(vendor.text()),
        }
    })
    return ret
}

export default {
    gems: async (_) => {
        const gems = await parseGems()
        const rewards = await parseRewards()
        const ret = []

        Object.keys(gems).forEach((name) => {
            ret.push({ ...gems[name], reward: null, vendor: null, ...rewards[name] })
        })

        return ret
    },
}
