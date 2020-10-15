import gql from "graphql-tag"

import { CHARACTERS } from "../../constants"

export default gql`
    enum Character {
        ${CHARACTERS.join("\n")}
        All
    }

    type QuestReward {
        act: Int!
        character: Character!
        quest: String!
    }

    type QuestVendor {
        character: Character!
        quest: String!
    }

    type Gem {
        name: String!
        # image: String!,
        # # color: String!,
        # req: Int!,
        # tages: [String]!,

        # individual skill
        # questReward: [QuestReward]
        # questVendor: [QuestVendor]
    }

    extend type Query {
        gems: [Gem]
    }
`
