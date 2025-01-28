export function pivotSimulation(simulation, operation, unitsMap) {
    let pivot = operation.zones.reduce((map, zoneId) => {
        map[zoneId] = Array.from({length: 6}, e => Array.from({length: 3}, e => Array(5).fill({})))
        return map
    }, {})
    simulation.optimalPlacement.forEach(player => {
        operation.zones.forEach(type => {
            player.placements[type].forEach(placement => {
                placement.playerName = player.name
                placement.allyCode = player.allyCode
                pivot[type][placement.operation-1][placement.row-1][placement.slot-1] = placement
            })
        })
    })
    simulation.skippedPlatoons.forEach(platoon => {
        platoon.thumbnail = unitsMap[platoon.defId].thumbnailName
        platoon.nameKey = unitsMap[platoon.defId].nameKey
        platoon.combatType = unitsMap[platoon.defId].combatType
        platoon.currentRarity = 7
        platoon.currentLevel = 85
        platoon.disabled = true
        pivot[`${platoon.alignment}:${platoon.phase}`][platoon.operation-1][platoon.row-1][platoon.slot-1] = platoon
    })
    simulation.remainingPlatoons.forEach(platoon => {
        platoon.thumbnail = unitsMap[platoon.defId].thumbnailName
        platoon.nameKey = unitsMap[platoon.defId].nameKey
        platoon.combatType = unitsMap[platoon.defId].combatType
        platoon.currentRarity = 7
        platoon.currentLevel = 85
        pivot[`${platoon.alignment}:${platoon.phase}`][platoon.operation-1][platoon.row-1][platoon.slot-1] = platoon
    })
    simulation.unableToFill.forEach(platoon => {
        platoon.thumbnail = unitsMap[platoon.defId].thumbnailName
        platoon.nameKey = unitsMap[platoon.defId].nameKey
        platoon.combatType = unitsMap[platoon.defId].combatType
        platoon.currentRarity = 7
        platoon.currentLevel = 85
        platoon.disabled = true
        pivot[`${platoon.alignment}:${platoon.phase}`][platoon.operation-1][platoon.row-1][platoon.slot-1] = platoon
    })
    return pivot
}