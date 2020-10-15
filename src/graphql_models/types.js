// types

const fieldDefaults = {
    required: true,
    createFilter: true,
    createOrderBy: true,
}

export const types = {
    Int: (opts) => ({ ...fieldDefaults, type: "Int", ...opts }),
    Float: (opts) => ({ ...fieldDefaults, type: "Float", ...opts }),
    String: (opts) => ({ ...fieldDefaults, type: "String", ...opts }),
    Boolean: (opts) => ({ ...fieldDefaults, type: "Boolean", ...opts }),
    Enum: (elementType, enumValues = [], opts) => {
        if (!enumValues.length) {
            throw Error(`enum values must be provided for ${elementType}`)
        }
        return { ...fieldDefaults, type: elementType, enumValues, ...opts }
    },
    List: (elementType, { createFilter = true, createOrderBy = false, ...opts }) => ({
        ...fieldDefaults,
        type: `[${elementType}]`,
        createFilter,
        createOrderBy,
        ...opts,
    }),
}

// filters

export const filters = {
    IntFilter: "IntFilter",
    IntMembershipFilter: "IntMembershipFilter",
    EnumFilter: "EnumFilter",
    FloatFilter: "FloatFilter",
    StringFilter: "StringFilter",
    StringMembershipFilter: "StringMembershipFilter",
    BooleanFilter: "BooleanFilter",
}
