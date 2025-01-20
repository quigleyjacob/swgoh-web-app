import { squadsPerZone } from "./constants"

export function generateSquadId(zoneId, index) {
    return `Auto-${zoneId}_duel01_squad${index}`
}

export function upgradeGacData(gac) {
    let oldZones = ['top', 'bottom', 'back', 'fleet']
    let newZones = [ '4zone_phase01_conflict01', '4zone_phase01_conflict02', '4zone_phase02_conflict02', '4zone_phase02_conflict01']

    let mode = gac.mode
    let league = gac.league
    let player = gac.player
    let opponent = gac.opponent
    let time = gac.time
    let _id = gac._id
    let battleLog = gac.battleLog

    let homeStatus = {}
    let awayStatus = {}
    let planStatus = {}

    for(const [index, oldZoneId] of oldZones.entries()) {
        let newZoneId = newZones[index]
        let numSquads = squadsPerZone[mode][league][newZoneId]
        let array = Array.from({ length: numSquads }, (_, i) => i)
        for(const index of array) {
            let squadId = generateSquadId(newZoneId, index)

            // set home status
            let homeSquad = gac.playerMap[oldZoneId][index].map(baseId => {
                return { baseId }
            })
            let homeDatacron = gac.playerDatacronMap[oldZoneId][index].id
            homeStatus[squadId] = {squad: homeSquad, datacron: homeDatacron}

            // set away status
            let awaySquad = gac.opponentMap[oldZoneId][index].map((baseId, unitIndex) => {
                let isAlive = !gac.killMap[oldZoneId][index][unitIndex]
                return { baseId, isAlive }
            })
            let awayDatacron = gac.opponentDatacronMap[oldZoneId][index].id
            awayStatus[squadId] = {squad: awaySquad, datacron: awayDatacron}

            // set plan status
            let planSquad = gac.planMap[oldZoneId][index].map(baseId => {
                return { baseId }
            })
            let planDatacron = gac.planDatacronMap[oldZoneId][index].id
            planStatus[squadId] = {squad: planSquad, datacron: planDatacron}
        }
    }

    return {
        _id,
        player,
        opponent,
        mode,
        league,
        battleLog,
        homeStatus,
        awayStatus,
        planStatus,
        time
    }

}