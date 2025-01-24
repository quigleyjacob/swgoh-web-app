import { defaultGetRosterForGuildMemberProjection, getGuildMemberDatacronProjection } from "../utils/projections"

export async function getGuild(guildId, session, setGuild, displayMessage, refresh = false, detailed=false, datacronProjection=false) {
  let projection = datacronProjection ? getGuildMemberDatacronProjection : defaultGetRosterForGuildMemberProjection
    let body = {
        guildId: guildId,
        detailed: detailed,
        refresh: refresh,
        projection,
        session: session
      }
      let guild = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(guild.ok) {
        let guildData = await guild.json()
        setGuild(guildData)
        if(refresh) {
          displayMessage('Guild data refresh successful.', true)
        } else if(detailed) {
          displayMessage('Guild data pulled.', true)
        }
      } else {
        let error = await guild.text()
        displayMessage(error, false)
      }
  }

export async function getIsGuildBuild(session, guildId, displayMessage, setIsGuildBuild, setDisplayNotGuildBuildMessage) {
  let body = {
    session,
    guildId
  }
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/build`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
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

export async function getActiveRaid(session, allyCode, guildId, displayMessage, setActiveRaid) {
  let body = {
    session,
    allyCode,
    guildId
  }
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/activeraid`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  })
  if(response.ok) {
    let activeRaid = await response.json()
    activeRaid.raidMemberMap = activeRaid.raidMember.reduce((obj, member) => {
      obj[member.playerId] = member
      return obj
    }, {})
    setActiveRaid(activeRaid)
  } else {
    if(response.status !== 401) {
      let error = await response.text()
      displayMessage(error, false)
    }
  }
}