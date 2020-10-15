import isEmpty from "lodash/isEmpty"
import mapKeys from "lodash/mapKeys"

import { mergeMongoQueries } from "./utils"

export const searchNumeric = (fieldName, fieldValue) => {
    return { [fieldName]: mapKeys(fieldValue, (_, k) => k.replace("_", "$")) }
}

// searchNumeric is just a superset of searchBoolean!
export const searchBoolean = searchNumeric

// utility function for handling search operations
const _stringOperator = ([op, val]) => {
    switch (op) {
        case "_eq":
            return { $eq: val }
        case "_ne":
            return { $ne: val }
        case "_ieq":
            return { $regex: val, $options: "i" }
        case "_regex":
            return { $regex: val }
        case "_iregex":
            return { $regex: val, $options: "i" }
        case "_contains":
            return { $regex: val }
        case "_icontains":
            return { $regex: val, $options: "i" }
        case "_startswith":
            return { $regex: `^${val}` }
        case "_istartswith":
            return { $regex: `^${val}`, $options: "i" }
        case "_endswith":
            return { $regex: `${val}$` }
        case "_iendswith":
            return { $regex: `${val}$`, $options: "i" }
        case "_in":
            return { $in: val }
        case "_nin":
            return { $nin: val }
        default:
            throw Error(`Invalid string operation: ${op}`)
    }
}

export const searchString = (fieldName, fieldValue) => {
    const mongoParams = Object.entries(fieldValue).map(_stringOperator)

    return {
        $and: mongoParams.map((v) => ({
            [fieldName]: v,
        })),
    }
}

export const searchWhereRecursive = (searchParams, searchFunc) => {
    if (!searchParams) {
        return {}
    }

    const queries = [searchFunc(searchParams)]

    // handle special mongodb operators
    const logicalOps = { _or: "$or", _and: "$and", _not: "$nor" }
    Object.entries(logicalOps).forEach(([op, mongoOp]) => {
        if (op in searchParams) {
            queries.push({
                [mongoOp]: searchParams[op].map((v) => searchWhereRecursive(v, searchFunc)),
            })
        }
    })

    return mergeMongoQueries(...queries)
}
