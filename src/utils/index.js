export function getCharacterData(unitList, units) {
    return getUnitData(unitList, 1, units)
}
export function getShipData(unitList, units) {
    return getUnitData(unitList, 2, units)
}

const getUnitData = (unitList, combatType, units) => {
    // console.log(unitList, units)
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
                    return unit
                }
            }
            return null
        }).filter(unit => unit !== null)
        return playerUnits
    }
    return []
}