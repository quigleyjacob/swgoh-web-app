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

export async function getActiveRaid(session, allyCode, guildId, displayMessage, setActiveRaid) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/raid?allyCode=${allyCode}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
  })
  if(response.ok) {
    let activeRaid = await response.json()
    activeRaid.raidMemberMap = activeRaid.raidMember.reduce((obj, member) => {
      obj[member.playerId] = member
      return obj
    }, {})
    setActiveRaid({ ...activeRaid })
  } else {
    if(response.status !== 401) {
      let error = await response.text()
      displayMessage(error, false)
    }
  }
}

export async function getRaidData(raidId, session, displayMessage, setRaidData) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/raid/${raidId}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
  })
  if(response.ok) {
    let raidData = await response.json()
    setRaidData({ ...raidData })
  } else {
    if(response.status !== 401) {
      let error = await response.text()
      displayMessage(error, false)
    }
  }
}

export async function getRaidCampaignData(campaignId, campaignMapId, campaignNodeId, session, displayMessage, setRaidCampaignData) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/campaign?campaignId=${campaignId}&campaignMapId=${campaignMapId}&campaignNodeId=${campaignNodeId}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
  })
  if(response.ok) {
    let raidCampaignData = await response.json()
    setRaidCampaignData({ ...raidCampaignData })
  } else {
    if(response.status !== 401) {
      let error = await response.text()
      displayMessage(error, false)
    }
  }
}

export async function getGuildMemberDiscordRegistration(guildId, session, displayMessage, setDiscordRegistrationMap) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/guild/${guildId}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
  })
  if(response.ok) {
    let guildMemberDiscordRegistration = await response.json()
    setDiscordRegistrationMap(guildMemberDiscordRegistration.reduce((map, registration) => {
      map[registration.allyCode] = registration
      return map
    }, {}))
  } else {
    if(response.status !== 401) {
      let error = await response.text()
      displayMessage(error, false)
    }
  }
}