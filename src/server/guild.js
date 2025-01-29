import { defaultGetRosterForGuildMemberProjection, getGuildMemberDatacronProjection } from "../utils/projections"

export async function getGuild(guildId, session, setGuild, displayMessage, guild, refresh = false, detailed=false, datacronProjection=false) {
  let projection = datacronProjection ? getGuildMemberDatacronProjection : defaultGetRosterForGuildMemberProjection
    let body = {
        guildId: guildId,
        detailed: detailed,
        refresh: refresh,
        projection
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', session},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let guildData = await response.json()
        setGuild({...guild, ...guildData})
        if(refresh) {
          displayMessage('Guild data refresh successful.', true)
        } else if(detailed) {
          displayMessage('Guild data pulled.', true)
        }
      } else {
        let error = await response.text()
        displayMessage(error, false)
      }
  }

export async function getIsGuildBuild(session, guildId, displayMessage, setIsGuildBuild, setDisplayNotGuildBuildMessage) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/build`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
  })
  if(response.ok) {
    let isGuildBuildResponse = await response.text()
    let isGuildBuild = Boolean(isGuildBuildResponse === 'true')
    if(isGuildBuild) {
      setIsGuildBuild(true)
    } else {
      setDisplayNotGuildBuildMessage(true)
    }
  } else {
    if(response.status !== 401) {
      let error = await response.text()
      displayMessage(error, false)
    }
  }
}