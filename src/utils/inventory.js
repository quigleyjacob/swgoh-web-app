export const getImagePath = (inventoryType, iconKey) => {
    return `https://swgoh-images.s3.us-east-2.amazonaws.com/${getPathByInventoryType(inventoryType)}/${iconKey}.png`
}

export const getPathByInventoryType = (inventoryType) => {
    if(inventoryType === 'currencyItem') {
        return 'currency'
    }
    return inventoryType
}

export const getKeyByInventoryType = (inventoryType) => {
    if(inventoryType === 'currencyItem') {
        return 'currency'
    } 
    return 'id'
}

export const inventoryOptions = [
    {
        key: 'shipments',
        value: 'shipments',
        text: "Shipments"
    },
    {
        key: 'modMaterials',
        value: 'modMaterials',
        text: 'Mod Materials'
    },
    {
        key: 'relicMaterials',
        value: 'relicMaterials',
        text: 'Relic Materials'
    },
    {
        key: 'abilityMaterials',
        value: 'abilityMaterials',
        text: 'Ability Materials'
    },
    {
        key: 'g12gear-left',
        value: 'g12gear-left',
        text: 'G12 Gear (Left Side Gold Pieces)'
    },
    {
        key: 'g12gear-right',
        value: 'g12gear-right',
        text: 'G12 Gear (Right Side Gold Pieces)'
    },
    {
        key: 'g12gear-pruple',
        value: 'g12gear-purple',
        text: 'G12 Gear (Purple Pieces)'
    },
    {
        key: 'core-gear',
        value: 'core-gear',
        text: 'Core Gear'
    }
]

export const inventoryPartitions = {
    'modMaterials': [
        {
            id: 'MOD_SLICING_SALVAGE_TIER05_01',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER05_02',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER05_03',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER05_04',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER05_05',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER05_06',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_PROMOTION_MATERIAL_T5_TO_T6',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER06_01',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER06_02',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER06_03',
            type: 'material'
        },
        {
            id: 'MOD_SLICING_SALVAGE_TIER06_04',
            type: 'material'
        },
        {
            id: 'MOD_REROLL_CURRENCY',
            type: 'currencyItem'
        }
    ],
    'relicMaterials': [
        {
            id: 'SCV_001',
            type: 'material',
            notes: 'Farm Light Side Normal Battle 1-C and scrap gear'
        },
        {
            id: 'SCV_002',
            type: 'material',
            notes: 'Farm Light Side Normal Battle 7-B or Fleet Normal Battle 1-D and scrap Mk 5 Fabritech Data Pad'
        },
        {
            id: 'SCV_003',
            type: 'material',
            notes: 'Buy Mk 7 BlasTech Weapon Mod using Guild Tokens and scrap'
        },
        {
            id: 'SCV_004',
            type: 'material',
            notes: 'Buy Mk 3 Sienar Holo Projecter Salvage using Mk 1 Raid Tokens, craft Mk3 Sienar Holo Projectors, and scrap'
        },
        {
            id: 'SCV_005',
            type: 'material',
            notes: 'Buy with Mk 3 Raid Tokens'
        },
        {
            id: 'SCV_006',
            type: 'material',
            notes: 'Buy Mk 12 Prototype Salvage (Thermals, Key Pads, and Holo Lens) using Mk 2 Raid Tokens, and scrap'
        },
        {
            id: 'SCV_007',
            type: 'material',
            notes: 'Buy with Mk 3 Raid Tokens'
        },
        {
            id: 'SCV_008',
            type: 'material',
            notes: 'Buy with Mk 3 Raid Tokens'
        },
        {
            id: 'SCV_009',
            type: 'material',
            notes: 'Buy Mk 12 Prototype Salvage (Data Pads and Stun Guns, NOT Furnaces) using Mk 2 Raid Tokens, and scrap'
        },
        {
            id: 'SCV_010',
            type: 'material',
            notes: 'Play TW'
        },
        {
            id: 'RM_001',
            type: 'material',
            notes: 'Farm on Cantina Battles 8-C'
        },
        {
            id: 'RM_002',
            type: 'material',
             notes: 'Farm on Cantina Battles 8-F'
        },
        {
            id: 'RM_003',
            type: 'material',
             notes: 'Farm on Cantina Battles 8-G'
        }
    ],
    'abilityMaterials': [
        {
            id: 'ability_mat_A',
            type: 'material'
        },
        {
            id: 'ability_mat_B',
            type: 'material'
        },
        {
            id: 'ability_mat_C',
            type: 'material'
        },
        {
            id: 'ability_mat_D',
            type: 'material'
        },
        {
            id: 'ability_mat_E',
            type: 'material'
        },
        {
            id: 'ability_mat_F',
            type: 'material'
        },
        {
            id: 'shipability_mat_A',
            type: 'material'
        },
        {
            id: 'shipability_mat_B',
            type: 'material'
        },
        {
            id: 'shipability_mat_C',
            type: 'material'
        },
        {
            id: 'shipability_mat_D',
            type: 'material'
        },
        {
            id: 'shipability_mat_hardware_systems',
            type: 'material'
        },
        {
            id: 'shipability_mat_prestige',
            type: 'material'
        }
    ],
    'shipments': [
        {
            id: 'GRIND',
            type: 'currencyItem'
        },
        {
            id: 'SHIP_GRIND',
            type: 'currencyItem'
        },
        {
            id: 'PREMIUM',
            type: 'currencyItem'
        },
        {
            id: 'SOCIAL',
            type: 'currencyItem'
        },
        {
            id: '48',
            type: 'currencyItem'
        },
        {
            id: 'FORCE_POINT',
            type: 'currencyItem'
        },
        {
            id: 'GUILD_CURRENCY',
            type: 'currencyItem'
        },
        {
            id: 'RAID_REWARD_CURRENCY_01',
            type: 'currencyItem'
        },
        {
            id: 'RAID_REWARD_CURRENCY_02',
            type: 'currencyItem'
        },
        {
            id: 'RAID_REWARD_CURRENCY_03',
            type: 'currencyItem'
        },
        {
            id: 'PVP_CURRENCY',
            type: 'currencyItem'
        },
        {
            id: 'WAR_SHIP_CURRENCY',
            type: 'currencyItem'
        },
        {
            id: 'PVP_SHIP_CURRENCY',
            type: 'currencyItem'
        },
        {
            id: 'TERRITORY_BATTLE_CURRENCY',
            type: 'currencyItem'
        },
        {
            id: 'TERRITORY_BATTLE_CURRENCY_02',
            type: 'currencyItem'
        },
        {
            id: 'TERRITORY_BATTLE_CURRENCY_03',
            type: 'currencyItem'
        },
        {
            id: 'SEASONS_CURRENCY',
            type: 'currencyItem'
        },
        {
            id: 'SHARD_CURRENCY',
            type: 'currencyItem'
        },
        {
            id: 'CONQUEST_CURRENCY',
            type: 'currencyItem'
        },
        {
            id: 'GL_EVENT_CURRENCY',
            type: 'currencyItem'
        },
    ],
    'g12gear-left': [
        {
            id: '158PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '159PrototypeSalvage',
            type: 'equipment',
            notes: 'Do not scrap for relic materials, save for gearing toons'
        },
        {
            id: '160PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '161PrototypeSalvage',
            type: 'equipment',
            notes: 'Cannot be scrapped'
        },
        {
            id: '162PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '163PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '164PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '165PrototypeSalvage',
            type: 'equipment'
        }
    ],
    'g12gear-right': [
        {
            id: '166PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '167PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '168PrototypeSalvage',
            type: 'equipment',
            notes: 'Do not scrap for relic materials, save for gearing toons'
        },
        {
            id: '169PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '170PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '171PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '166PrototypeSalvage_V2',
            type: 'equipment',
            notes: 'Cannot be scrapped'
        },
        {
            id: '167PrototypeSalvage_V2',
            type: 'equipment',
            notes: 'Cannot be scrapped'
        },
        {
            id: '168PrototypeSalvage_V2',
            type: 'equipment',
            notes: 'Cannot be scrapped'
        },
        {
            id: '169PrototypeSalvage_V2',
            type: 'equipment',
            notes: 'Cannot be scrapped'
        },
        {
            id: '170PrototypeSalvage_V2',
            type: 'equipment',
            notes: 'Cannot be scrapped'
        },
        {
            id: '171PrototypeSalvage_V2',
            type: 'equipment',
            notes: 'Cannot be scrapped'
        }
    ],
    'g12gear-purple': [
        {
            id: '147Salvage',
            type: 'equipment'
        },
        {
            id: '148Salvage',
            type: 'equipment'
        },
        {
            id: '151Salvage',
            type: 'equipment'
        },
        {
            id: '152Salvage',
            type: 'equipment',
            notes: 'This piece is used a lot in gearing toons (one G12 left side piece and 3 G12 right side pieces), so prioritize farming and buying with GET1'
        },
        {
            id: '154Salvage',
            type: 'equipment'
        },
        {
            id: '155Salvage',
            type: 'equipment'
        },
        {
            id: '156Salvage',
            type: 'equipment'
        },
        {
            id: '157Salvage',
            type: 'equipment'
        }
    ],
    'core-gear': [
        {
            id: '172Salvage',
            type: 'equipment'
        },
        {
            id: '173Salvage',
            type: 'equipment'
        },
        {
            id: '108Salvage',
            type: 'equipment'
        },
        {
            id: '117PrototypeSalvage',
            type: 'equipment'
        },
        {
            id: '112Salvage',
            type: 'equipment'
        },
        {
            id: '136Salvage',
            type: 'equipment'
        },
        {
            id: '145Salvage',
            type: 'equipment'
        },
        {
            id: '129Component',
            type: 'equipment'
        }
    ]
}