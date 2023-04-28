export async function getPlayerData(session, allyCode, displayMessage) {
  if(session && allyCode) {
    let body = {
      payload: {
        allyCode: allyCode
      },
      session: session
    }
    let player = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    })
    if(player.ok) {
      let account = await player.json()
      // define the baseId for each unit
      account.rosterUnit.forEach(unit => {
        let baseId = unit.definitionId.split(':')[0]
        unit.baseId = baseId
      })
      return account
    } else {
      let error = await player.text()
      displayMessage(error, false)
      return {}
    }
  }
}

export async function getPlayerGACHistory(session, allyCode, displayMessage) {
    if(session !== '' && allyCode !== '') {
        let body = {
            session: session,
            allyCode: allyCode
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/gac`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let gacList = await response.json()
            return gacList
        } else {
            let error = await response.text()
            displayMessage(error, false)
            return []
        }
    }
}

export async function saveGac(session, activeGac, activeGacId, displayMessage, displaySuccess = true) {
  if(activeGacId !== '' && session !== '' && activeGac?.player?.allyCode) {
    let gacToPost = JSON.parse(JSON.stringify(activeGac))
    gacToPost.time = Date.now()
    let body = {
        session: session,
        id: activeGacId,
        gac: gacToPost
    }
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/gac/add`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    if(response.ok) {
        let gacId = await response.text()
        if(displaySuccess) displayMessage('Successfully saved GAC data.', true)
        return gacId
    } else {
        let error = await response.text()
        console.log(error)
        displayMessage('Unable to save GAC data.', false)
        return ''
    }
  }
}