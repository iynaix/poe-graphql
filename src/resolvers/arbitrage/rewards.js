import { keyBy, map } from "lodash"

const processRewards = (
    items,
    rewards,
    { getRewardValue = ({ chaosValue }) => chaosValue, debug = false } = {}
) => {
    const ret = []
    const byName = {
        ...keyBy(items, "name"),
        "Chaos Orb": { name: "Chaos Orb", chaosValue: 1 },
    }

    rewards.forEach(({ rewardName, cardName, cardCost, ...other }) => {
        if (rewardName in byName) {
            if (!debug) {
                const rewardValue = getRewardValue({ ...other, ...byName[rewardName] })

                if (rewardValue > cardCost) {
                    const profit = rewardValue - cardCost

                    ret.push({
                        cardName,
                        rewardValue,
                        cardCost,
                        profit,
                        profitPercent: (profit / cardCost) * 100,
                    })
                }
            }
        } else {
            if (debug) {
                console.warn(`NOT FOUND: "${cardName}" for "${rewardName}"`)
            }
        }
    })

    return ret
}

export const gemRewards = async (coll, rewards) => {
    // TODO: match reward names

    const gems = await Promise.all([
        coll.findOne({
            endpoint: { $in: ["SkillGem"] },
            name: "Summon Raging Spirit",
            gemLevel: 1,
            gemQuality: 20,
        }),

        coll.findOne({
            endpoint: { $in: ["SkillGem"] },
            name: "Enlighten Support",
            gemLevel: 3,
            corrupted: false,
        }),
    ])

    return processRewards(gems, rewards)
}

export const currencyRewards = async (coll, rewards) => {
    rewards = rewards.map(({ cardName, cardCost, rewardName }) => {
        const res = rewardName.split("x ")
        rewardName = res.length === 2 ? res[1] : res[0]
        let currencyStackSize = res.length === 2 ? res[0] | 0 : 1

        return {
            cardName,
            cardCost,
            rewardName,
            currencyStackSize,
        }
    })

    const rewardNames = map(rewards, "rewardName")

    const currencies = await coll
        .aggregate([
            {
                $match: {
                    name: { $in: rewardNames },
                },
            },
        ])
        .toArray()

    return processRewards(currencies, rewards, {
        getRewardValue: ({ chaosValue, currencyStackSize }) => chaosValue * currencyStackSize,
    })
}

export const prophecyRewards = async (coll, rewards) => {
    const fixedRewards = {
        "A Master Seeks Help (Niko)": "A Master Seeks Help, Niko",
        "Queen's Sacrifice": "The Queen's Sacrifice",
    }

    const rewardNames = map(rewards, ({ rewardName }) =>
        rewardName in fixedRewards ? fixedRewards[rewardName] : rewardName
    )

    const prophecies = await coll
        .aggregate([
            {
                $match: {
                    endpoint: { $in: ["Prophecy"] },
                    name: { $in: rewardNames },
                },
            },
        ])
        .toArray()

    return processRewards(prophecies, rewards)
}

export const divinationRewards = async (coll, rewards) => {
    const divCards = await coll
        .aggregate([
            {
                $match: {
                    endpoint: { $in: ["DivinationCard"] },
                },
            },
        ])
        .toArray()

    return processRewards(divCards, rewards)
}

export const uniqueRewards = async (coll, rewards) => {
    const rewardNames = map(rewards, "rewardName")

    const uniques = await coll
        .aggregate([
            {
                $match: {
                    links: { $lt: 5 },
                    endpoint: {
                        $in: [
                            "UniqueMap",
                            "UniqueJewel",
                            "UniqueFlask",
                            "UniqueWeapon",
                            "UniqueArmour",
                            "UniqueAccessory",
                        ],
                    },
                    name: { $in: rewardNames },
                    // tabula cant be less than 6L
                    $nor: [{ name: { $in: ["Tabula Rasa"] } }],
                },
            },
        ])
        .toArray()

    return processRewards(uniques, rewards)
}
