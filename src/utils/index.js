export function getCharacterData(unitList, units) {
    return getUnitData(unitList, 1, units)
}
export function getShipData(unitList, units) {
    return getUnitData(unitList, 2, units)
}

export function getCreatedSquadData(account, units, toon, squadList) {
    let squadMap = account.rosterUnit
        .filter(unit =>squadList.includes(unit.baseId))
        // eslint-disable-next-line
        .reduce((map, obj) => (map[obj.baseId] = obj, map), {})
    let squad = squadList.map(baseId => squadMap[baseId])
    return toon ? getCharacterData(squad, units) : getShipData(squad, units)
}

const getUnitData = (unitList, combatType, units) => {
    if(unitList && unitList.length > 0) {
        // eslint-disable-next-line
        let unitsMap = units.filter(unit => unit.combatType === combatType).reduce((map, obj) => (map[obj.baseId] = obj, map), {})
        let playerUnits = unitList.map(unit => {
            if(unit) {
                let unitData = unitsMap[unit.baseId]
                if(unitData) {
                    unit.baseId = unitData.baseId
                    unit.combatType = unitData.combatType
                    unit.forceAlignment = unitData.forceAlignment
                    unit.nameKey = unitData.nameKey
                    unit.categoryId = unitData.categoryId
                    unit.thumbnail = unitData.thumbnailName
                    return unit
                }
            }
            return null
        }).filter(unit => unit !== null)
        return playerUnits
    }
    return []
}

export function arrayEquals(a,b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}