import { MongoClient } from "mongodb"

import { MONGO_URL } from "../constants"

let _db

const getDb = async () => {
    if (_db) {
        return _db
    }

    return MongoClient.connect(MONGO_URL)
        .then((client) => {
            _db = client.db()
            return _db
        })
        .catch((err) => {
            console.error(err)
        })
}

export const closeDb = async () => {
    const client = await getDb()
    client.close()
}

export default getDb
