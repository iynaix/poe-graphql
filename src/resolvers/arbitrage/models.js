import { types } from "../../graphql_models"

export const arbitrageItem = {
    cardName: types.String(),
    rewardValue: types.Float(),
    cardCost: types.Float(),
    profit: types.Float(),
    profitPercent: types.Float(),
}
