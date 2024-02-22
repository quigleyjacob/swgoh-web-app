export async function getGuildData(guildId, session, detailed, refresh, setGuild, setLoaderVisible, setLoaderMessage, displayMessage) {
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
          displayMessage("Guild data successfully refreshed.", true)
        }
      } else {
        let error = await guild.text()
        displayMessage(error, false)
      }
      setLoaderVisible(false)
  }