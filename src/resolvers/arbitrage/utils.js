const CARD_RE = /^<(.*?)>{(.*?)}/

export const groupDivCardsByType = async (itemColl) => {
    // mongodb search for div cards
    const divCards = await itemColl
        .aggregate([
            {
                $match: {
                    // search for div cards
                    $nor: [
                        {
                            $and: [
                                {
                                    "explicitModifiers.text": {
                                        $regex: "<corrupted>",
                                        $options: "i",
                                    },
                                },
                            ],
                        },
                    ],
                    $and: [{ endpoint: { $eq: "DivinationCard" } }],
                },
            },
        ])
        .toArray()

    const rewardNamesByType = {}
    const rewardsByType = {}

    divCards.forEach(({ name, explicitModifiers, stackSize, chaosValue }) => {
        explicitModifiers.forEach(({ text }) => {
            const res = CARD_RE.exec(text)
            if (res) {
                const [, rewardType, rewardName] = res

                // stackSize can be 0? e.g. chaotic disposition
                stackSize = stackSize === 0 ? 1 : stackSize

                const reward = {
                    cardName: name,
                    cardCost: stackSize * chaosValue,
                    rewardName,
                    explicitModifiers,
                }

                if (rewardType in rewardNamesByType) {
                    rewardNamesByType[rewardType].push(rewardName)
                    rewardsByType[rewardType].push(reward)
                } else {
                    rewardNamesByType[rewardType] = [rewardName]
                    rewardsByType[rewardType] = [reward]
                }
            }
        })
    })

    return rewardsByType
}
