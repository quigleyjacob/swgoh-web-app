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
        let unitsMap = units.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
        return populateUnitData(unitList, unitsMap, combatType)
    }
    return []
}

export function populateUnitData(unitList, unitsMap, combatType = undefined) {
    let playerUnits = unitList
      .filter(unit => {
        let unitCombatType = (unitsMap[unit.baseId] || unitsMap[unit.defId]).combatType
        return combatType === undefined || unitCombatType === combatType
      })
      .map(unit => {
        if(unit) {
            let unitData = unitsMap[unit.baseId] || unitsMap[unit.defId]
            if(unitData) {
                unit.baseId = unitData.baseId
                unit.combatType = unitData.combatType
                unit.forceAlignment = unitData.forceAlignment
                unit.nameKey = unitData.nameKey
                unit.categoryId = unitData.categoryId
                unit.thumbnail = unitData.thumbnailName
                unit.crew = unitData.crew
                unit.crew.forEach(member => {
                  member.nameKey = unitsMap[member.unitId].nameKey
                })
                return unit
            }
        }
        return null
    }).filter(unit => unit !== null)
    return playerUnits
}

export function arrayEquals(a,b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}

export function validateAllyCode(allyCode) {
    let trimmed = String(allyCode).trim()
    return /^[1-9]{3}-?[1-9]{3}-?[1-9]{3}$/g.test(trimmed)
}

export function normalizeAllyCode(allyCode) {
    return String(allyCode).trim().replace('-', '')
}

export function timeSince(date) {

    var seconds = Math.floor((Date.now() - date) / 1000);
    var intervalType;
  
    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      intervalType = 'year';
    } else {
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) {
        intervalType = 'month';
      } else {
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
          intervalType = 'day';
        } else {
          interval = Math.floor(seconds / 3600);
          if (interval >= 1) {
            intervalType = "hour";
          } else {
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
              intervalType = "minute";
            } else {
              interval = seconds;
              intervalType = "second";
            }
          }
        }
      }
    }
    if(interval < 30 && intervalType === 'second') {
        return 'Just now'
    }
  
    if (interval > 1 || interval === 0) {
      intervalType += 's';
    }
  
    return interval + ' ' + intervalType + ' ago';
  }