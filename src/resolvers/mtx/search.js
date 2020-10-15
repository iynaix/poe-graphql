export const searchWatchlist = (search, watchlistIds = []) => {
    if (search.watchlist !== undefined && watchlistIds.length) {
        return { id: { [search.watchlist ? "$in" : "$nin"]: watchlistIds } }
    }
}

export const searchOwned = (search, ownedNames = []) => {
    if (search.owned !== undefined && ownedNames.length) {
        return { name: { [search.owned ? "$in" : "$nin"]: ownedNames } }
    }
}
