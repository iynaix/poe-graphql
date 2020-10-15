export const NINJA_API_URL = "https://poe.ninja"

export const MONGO_URL =
    process.env.NODE_ENV === "production"
        ? process.env.MONGO_URL
        : "mongodb://127.0.0.1:27017/poeapi"

// const TMPSTANDARD = Date.now() >= Date.parse("18 Sep 2020 20:00:00 GMT") ? "Heist" : "Harvest"
const TMPSTANDARD = "Heist"

export const LEAGUES = {
    tmpstandard: TMPSTANDARD,
    tmphardcore: `Hardcore ${TMPSTANDARD}`,
    standard: "Standard",
    hardcore: "Hardcore",
}

export const CURRENCY_ENDPOINTS = ["Currency", "Fragment"]

export const ITEM_ENDPOINTS = [
    "DeliriumOrb",
    "Watchstone",
    "Oil",
    "Incubator",
    "Scarab",
    "Fossil",
    "Resonator",
    "Essence",
    "DivinationCard",
    "Prophecy",
    "SkillGem",
    "BaseType",
    "HelmetEnchant",
    "UniqueMap",
    "Map",
    "UniqueJewel",
    "UniqueFlask",
    "UniqueWeapon",
    "UniqueArmour",
    "UniqueAccessory",
    "Beast",
    "Vial",
]

export const POEDB_URL = "https://poedb.tw/us/"

export const POEWIKI_URL = "https://pathofexile.gamepedia.com/"

export const MTX_ENDPOINTS = {
    // Specials: "/shop/category/daily-deals",
    // New: "/shop/category/new-items",
    StashTabs: "/shop/category/stash-tabs",
    Bundles: "/shop/category/bundles",
    Armour: "/shop/category/armour-effects",
    BackAttachments: "/shop/category/back-attachments",
    Weapon: "/shop/category/weapon-effects",
    Portals: "/shop/category/portals",
    SkillEffects: "/shop/category/alternate-skill-effects",
    Character: "/shop/category/character-effects",
    Footprints: "/shop/category/footprint-effects",
    Guild: "/shop/category/guild",
    Pets: "/shop/category/pets",
    Hideout: "/shop/category/hideout-decorations",
}

export const MTX_WATCHLIST_URL = "/shop/watchlist"
export const MTX_OWNED_URL = "/character-window/get-mtx-stash-items"
