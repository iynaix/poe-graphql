import get from "lodash/get"
import isEmpty from "lodash/isEmpty"
import mapValues from "lodash/mapValues"

import { searchBoolean, searchNumeric, searchString, searchWhereRecursive } from "./search"
import { filters } from "./types"
import { mergeMongoQueries } from "./utils"

// generates graphql schema boilerplate for enum
export const enumType = (name, values) => `enum ${name} {
    ${values.join("\n")}
}`

const enumFilterType = (name, type) => `input ${name} {
    _eq: ${type}
    _ne: ${type}
    _in: [${type}!]
    _nin: [${type}!]
}`

// generates graphql schema boilerplate for recursive query
export const whereInput = (name) => `_and: [${name}]\n_not: [${name}]\n_or: [${name}]`

const getFilterType = ({ type, enumValues, filterType }) => {
    if (filterType) {
        return filterType
    }

    if (enumValues && enumValues.length) {
        return `${type}EnumFilter`
    }

    return `${type}Filter`
}

const processFields = (fieldDefinitions) =>
    mapValues(fieldDefinitions, ({ createFilter, ...field }, fieldName) => {
        if (!field.type) {
            throw `"${fieldName}" has no type specified.`
        }

        if (!createFilter) {
            return { createFilter, ...field }
        }

        return {
            ...field,
            createFilter,
            filterType: getFilterType(field),
        }
    })

export const createModelSDL = (modelName, fieldDefinitions) => {
    const enums = []

    const modelFields = Object.entries(fieldDefinitions).map(
        ([fieldName, { type, required, schemaDoc, enumValues }]) => {
            // create enumValues as needed
            if (enumValues && enumValues.length) {
                enums.push(enumType(type, enumValues))
            }

            schemaDoc = `${schemaDoc ? `# ${schemaDoc}\n` : ""}`
            return `${schemaDoc}${fieldName}: ${type}${required ? "!" : ""}`
        }
    )

    return `${enums.join("\n")}\ntype ${modelName} {
        ${modelFields.join("\n")}
    }`
}

const createWhereSDL = (queryName, fieldDefinitions) => {
    const enums = []
    const queryWhere = []

    Object.entries(fieldDefinitions).forEach(
        ([fieldName, { type, schemaDoc, createFilter, filterType }]) => {
            if (createFilter) {
                schemaDoc = `${schemaDoc ? `# ${schemaDoc}\n` : ""}`

                // special case enums, need to create the enum filter definition
                if (filterType.endsWith("EnumFilter")) {
                    enums.push(enumFilterType(filterType, type))
                }

                queryWhere.push(`${schemaDoc}${fieldName}: ${filterType}`)
            }
        }
    )

    const whereInputName = `${queryName}Where`
    return `${enums.join("\n")}\n\ninput ${whereInputName} {
        ${whereInput(whereInputName)}
        ${queryWhere.join("\n")}
    }`
}

const createOrderBySDL = (queryName, fieldDefinitions) => {
    const queryOrderBy = []
    Object.entries(fieldDefinitions).forEach(([fieldName, { schemaDoc, createOrderBy }]) => {
        if (createOrderBy) {
            schemaDoc = `${schemaDoc ? `# ${schemaDoc}\n` : ""}`
            queryOrderBy.push(`${schemaDoc}${fieldName}: OrderBy`)
        }
    })

    const orderByInputName = `${queryName}OrderBy`
    return `input ${orderByInputName} {
        ${queryOrderBy.join("\n")}
    }`
}

export const createQuerySDL = (modelName, queryName, queryParameters) => {
    const orderByInputName = `${queryName}OrderBy`
    const whereInputName = `${queryName}Where`

    let extraParams = ""
    if (queryParameters) {
        // _debug parameter for easier debugging
        if (process.env.NODE_ENV !== "production") {
            queryParameters["_debug"] = "Boolean"
        }

        extraParams = Object.entries(queryParameters)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
    }

    return `extend type Query {
        ${queryName}(
            ${extraParams}
            orderBy: [${orderByInputName}!]
            where: ${whereInputName}
        ): [${modelName}]!,
    }`
}

const _getSearchFunc = ({ type, filterType }) => {
    if (
        filterType === filters.IntFilter ||
        filterType === filters.FloatFilter ||
        filterType === filters.IntMembershipFilter
    ) {
        return searchNumeric
    } else if (filterType === filters.BooleanFilter) {
        return searchBoolean
    } else if (
        filterType === filters.StringFilter ||
        filterType.endsWith("EnumFilter") ||
        filterType === filters.StringMembershipFilter
    ) {
        return searchString
    } else {
        console.warn("UNHANDLED FILTER: ", { type, filterType })
        return () => undefined
    }
}

// returns a function that creates the mongodb parameters for filtering
export const createMongoFilter = (fieldDefinitions = {}) => (whereParams) => {
    const searchResults = Object.entries(fieldDefinitions).map(
        ([fieldName, { createFilter, filterFunc, ...field }]) => {
            const fieldValue = whereParams[fieldName]
            if (isEmpty(fieldValue)) {
                return
            }

            if (filterFunc) {
                return filterFunc(fieldName, fieldValue)
            }

            return createFilter ? _getSearchFunc(field)(fieldName, fieldValue) : undefined
        }
    )

    return mergeMongoQueries(...searchResults)
}

// creates the mongodb parameters for sorting
const createMongoSort = (orderByParams = [], fieldDefinitions = {}) => {
    const ret = {}

    // merge all the searchParams into a single object
    const mergedOrderBy = Object.assign({}, ...orderByParams)
    Object.entries(mergedOrderBy).forEach(([fieldName, order]) => {
        if (get(fieldDefinitions, `${fieldName}.createOrderBy`, true)) {
            ret[fieldName] = order === "asc" ? 1 : -1
        }
    })

    return ret
}

/*
produces SDL for a model, including both the model and the query
a field has shape: {
    type,
    required = true,
    schemaDoc,
    filterType,
    createFilter = true,
    createOrderBy = true,
}
*/
export const createModel = (
    modelName,
    queryName,
    fieldDefinitions,
    // global options
    { queryParameters } = {}
) => {
    fieldDefinitions = processFields(fieldDefinitions)

    const modelSDL = createModelSDL(modelName, fieldDefinitions)
    const whereSDL = createWhereSDL(queryName, fieldDefinitions)
    const orderBySDL = createOrderBySDL(queryName, fieldDefinitions)
    const querySDL = createQuerySDL(modelName, queryName, queryParameters)

    return `${modelSDL}\n${whereSDL}\n${orderBySDL}\n${querySDL}`
}

// creates the search parameters to be passed into mongo's aggregate()
export const createMongoResolver = (
    {
        // eslint-disable-next-line
        _debug = false,
        ...searchParams
    },
    fieldDefinitions,
    defaultSort = {}
) => {
    fieldDefinitions = processFields(fieldDefinitions)

    const mongoSort = createMongoSort(searchParams["orderBy"], fieldDefinitions)

    const ret = [
        searchWhereRecursive(searchParams["where"], createMongoFilter(fieldDefinitions)),
        isEmpty(mongoSort) ? defaultSort : mongoSort,
    ]

    return ret
}
