import { fetchPOEHtml } from "../../utils"

const getChallengesUrl = async (poeSessionId) => {
    let $ = await fetchPOEHtml("/my-account", poeSessionId)

    let ret = ""
    $("a.tab").each((i, tab) => {
        tab = $(tab)
        if (tab.find("span").text().trim() === "Achievements") {
            ret = tab.attr("href")
        }
    })
    return ret
}

export const fetchChallenges = async (poeSessionId) => {
    const challengeUrl = await getChallengesUrl(poeSessionId)
    if (!challengeUrl) {
        throw new Error("Invalid poeSessionId.")
    }

    const $ = await fetchPOEHtml(challengeUrl)

    return $("div.achievement-list div.achievement")
        .map((i, elem) => {
            elem = $(elem)

            const name = elem.find("h2").first().text()
            const detail = elem.find("div.detail > span.text").text().trim()
            const completed = elem.hasClass("incomplete")

            const subChallenges = elem
                .find("div.detail > span.items li")
                .map((i, sub) => {
                    sub = $(sub)

                    return {
                        detail: sub.text().trim(),
                        completed: sub.hasClass("finished"),
                    }
                })
                .toArray()

            return {
                name,
                detail,
                completed,
                subChallenges: subChallenges.length ? subChallenges : null,
            }
        })
        .toArray()
}

export const Challenge = {
    subChallenges(challenge, { completed }) {
        const { subChallenges } = challenge

        if (completed === undefined || subChallenges === null) {
            return subChallenges
        }

        return subChallenges.filter((item) => item.completed === completed)
    },
}

export default {
    challenges: async (_, { poeSessionId, completed }) => {
        let results = await fetchChallenges(poeSessionId)

        if (completed !== undefined) {
            results = results.filter((item) => item.completed === completed)
        }

        return results
    },
}
