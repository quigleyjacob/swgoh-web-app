export const defaultGetRosterForGuildMemberProjection = {
    name: 1,
    allyCode: 1,
    datacron: 1,
    playerId: 1,
    rosterUnit: {
      definitionId: 1,
      currentRarity: 1,
      currentLevel: 1,
      currentTier: 1,
      zetaCount: 1,
      omicronCount: 1,
      relic: 1,
      stats: 1
    }
  }

export const getGuildMemberDatacronProjection = {
    allyCode: 1,
    datacron: 1,
    playerId: 1,
    name: 1
}