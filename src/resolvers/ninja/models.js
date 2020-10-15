import mapKeys from "lodash/mapKeys"

import { CURRENCY_ENDPOINTS, ITEM_ENDPOINTS } from "../../constants"
import { filters, searchString, types } from "../../graphql_models"

const searchModifier = (fieldName, fieldValue) => {
    // append .text to the end of the field name for searchString
    const origMongoParams = searchString(fieldName, fieldValue)
    return {
        ...origMongoParams,
        $and: origMongoParams["$and"].map((strOp) => mapKeys(strOp, (_, k) => `${k}.text`)),
    }
}

export const currency = {
    id: types.Int({ filterType: filters.IDFilter }),
    poeTradeId: types.Int({ filterType: filters.IDFilter }),
    endpoint: types.Enum("CurrencyEndpoint", CURRENCY_ENDPOINTS),
    name: types.String(),
    icon: types.String({ required: false, createFilter: false, createOrderBy: false }),
    chaosValue: types.Float(),
    exaltedValue: types.Float(),

    // TODO: pay, receive

    // other fields in original poe.ninja source:
    // paySparkline, receiveSparkline, lowConfidencePaySparkline, lowConfidenceReceiveSparkline
    // count?
}

export const mod = {
    text: types.String(),
    optional: types.Boolean(),
}

export const item = {
    id: types.Int({ filterType: filters.IDFilter }),
    endpoint: types.Enum("ItemEndpoint", ITEM_ENDPOINTS),
    name: types.String(),
    icon: types.String({ required: false, createFilter: false, createOrderBy: false }),
    mapTier: types.Int({ required: false, schemaDoc: "Applicable to Maps / Essences" }),
    stackSize: types.Int({
        required: false,
        schemaDoc: "Applicable to Divination Cards / Essences",
    }),
    levelRequired: types.Int({ required: false }),
    links: types.Int({ required: false }),
    itemClass: types.Int({ required: false, createOrderBy: false }),
    gemLevel: types.Int({ required: false }),
    gemQuality: types.Int({ required: false }),
    itemType: types.String({ required: false }),
    variant: types.String({ required: false }),
    baseType: types.String({ required: false }),
    artFilename: types.String({ required: false, createFilter: false, createOrderBy: false }),
    flavourText: types.String({ required: false, createOrderBy: false }),
    prophecyText: types.String({ required: false, createOrderBy: false }),
    corrupted: types.Boolean(),
    relic: types.Boolean(),
    chaosValue: types.Float(),
    exaltedValue: types.Float(),

    implicitModifiers: types.List("ItemModifier", {
        required: false,
        filterType: filters.StringFilter,
        filterFunc: searchModifier,
        createOrderBy: false,
    }),
    explicitModifiers: types.List("ItemModifier", {
        required: false,
        filterType: filters.StringFilter,
        filterFunc: searchModifier,
        createOrderBy: false,
    }),

    // other fields in original poe.ninja source:
    // sparkline, lowConfidenceSparkline ?
    // count?
}
