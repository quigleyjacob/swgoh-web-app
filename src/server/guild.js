export async function getGuild(guildId, session, setGuild, displayMessage, refresh = false, detailed=false, setLoaderVisible = () => {}, setLoaderMessage = () => {}) {
    if(refresh) {
      setLoaderMessage('Refreshing guild data. This process takes time.')
    } else {
      setLoaderMessage('Retrieving guild data.')
    }
    setLoaderVisible(true)
    let body = {
        guildId: guildId,
        detailed: detailed,
        refresh: refresh,
        projection: {
          name: 1,
          allyCode: 1,
          datacron: 1,
          rosterUnit: {
            definitionId: 1,
            currentRarity: 1,
            currentLevel: 1,
            currentTier: 1,
            zetaCount: 1,
            omicronCount: 1,
            relic: 1
          }
        },
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
      setLoaderVisible(false)
  }

export async function getIsGuildBuild(session, guildId, displayMessage, setIsGuildBuild) {
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
    let isGuildBuild = await response.text()
    setIsGuildBuild(Boolean(isGuildBuild === 'true'))
  } else {
    if(response.status !== 401) {
      let error = await response.text()
      displayMessage(error, false)
    }
  }
}