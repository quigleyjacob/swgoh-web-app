export const getImagePath = (inventoryType, iconKey) => {
    return `https://swgoh-images.s3.us-east-2.amazonaws.com/${inventoryType}/${iconKey}.png`
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
            id: 41, // Micro attenuators
            type: 'currency'
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
            id: 1, // credits
            type: 'currency'
        },
        {
            id: 19, // ship credits
            type: 'currency'
        },
        {
            id: 2, // crystals
            type: 'currency'
        },
        {
            id: 4, // ally points
            type: 'currency'
        },
        {
            id: 48, // episode
            type: 'currency'
        },
        {
            id: 11, // cantina
            type: 'currency'
        },
        {
            id: 17, // guild
            type: 'currency'
        },
        {
            id: 43, // raid 1
            type: 'currency'
        },
        {
            id: 44, // raid 2
            type: 'currency'
        },
        {
            id: 45, // raid 3
            type: 'currency'
        },
        {
            id: 10, // squad arena
            type: 'currency'
        },
        {
            id: 14, // galactic war
            type: 'currency'
        },
        {
            id: 12, // fleet arena
            type: 'currency'
        },
        {
            id: 32, // GET 1
            type: 'currency'
        },
        {
            id: 34, // GET 2
            type: 'currency'
        },
        {
            id: 42, // GET 3
            type: 'currency'
        },
        {
            id: 33, // GAC
            type: 'currency'
        },
        {
            id: 16, // shard shop
            type: 'currency'
        },
        {
            id: 39, // conquest
            type: 'currency'
        },
        {
            id: 47, // GL event
            type: 'currency'
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