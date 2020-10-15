import { searchNumeric, searchString, searchWhereRecursive } from "./search"
import { createMongoFilter } from "."

describe("searchNumeric", () => {
    test("single condition", () => {
        expect(searchNumeric("a", { _eq: 1 })).toMatchSnapshot()
    })

    test("multiple conditions", () => {
        expect(searchNumeric("a", { _eq: 1, _lt: 2 })).toMatchSnapshot()
    })
})

describe("searchString", () => {
    test("single condition", () => {
        expect(searchString("a", { _eq: "1" })).toMatchSnapshot()
    })

    test("multiple conditions", () => {
        expect(searchString("a", { _eq: "1", _iregex: "2" })).toMatchSnapshot()
    })
})

const multiFields = {
    a: { type: "String" },
    b: { type: "String" },
}

describe("complex queries", () => {
    test("empty field searches should do nothing", () => {
        const fields = { a: { type: "String" } }
        const where = { a: {} }

        expect(createMongoFilter(fields)(where)).toStrictEqual({})
    })

    test("multiple string searches should not override $and", () => {
        const where = { a: { _eq: "1" }, b: { _eq: "2" } }

        expect(createMongoFilter(multiFields)(where)).toMatchSnapshot()
    })

    test("non-recursive _or search", () => {
        const where = {
            _or: [{ a: { _eq: "1" } }, { b: { _eq: "2" } }],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })

    test("nested _or search", () => {
        const where = {
            _or: [{ a: { _eq: "1" }, _or: [{ b: { _eq: "2" } }] }],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })

    test("recursive _or search", () => {
        const where = {
            _or: [
                { a: { _eq: "1" } },
                { b: { _eq: "2" } },
                { _or: [{ a: { _eq: "1" } }, { b: { _eq: "2" } }] },
            ],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })

    test("non-recursive _and search", () => {
        const where = {
            _and: [{ a: { _eq: "1" } }, { b: { _eq: "2" } }],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })

    test("nested _and search", () => {
        const where = {
            _and: [{ a: { _eq: "1" }, _and: [{ b: { _eq: "2" } }] }],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })

    test("recursive _and search", () => {
        const where = {
            _and: [
                { a: { _eq: "1" } },
                { b: { _eq: "2" } },
                { _and: [{ a: { _eq: "1" } }, { b: { _eq: "2" } }] },
            ],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })

    test("non-recursive _not search", () => {
        const where = {
            _not: [{ a: { _eq: "1" } }, { b: { _eq: "2" } }],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })

    test("nested _not search", () => {
        const where = {
            _not: [{ a: { _eq: "1" }, _not: [{ b: { _eq: "2" } }] }],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })

    test("recursive _not search", () => {
        const where = {
            _not: [
                { a: { _eq: "1" } },
                { b: { _eq: "2" } },
                { _not: [{ a: { _eq: "1" } }, { b: { _eq: "2" } }] },
            ],
        }
        const searchFunc = createMongoFilter(multiFields)

        expect(searchWhereRecursive(where, searchFunc)).toMatchSnapshot()
    })
})
