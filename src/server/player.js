import { getKeyByInventoryType } from "../utils/inventory"

export async function getPlayerData(session, allyCode, displayMessage, setAccount) {
  if(allyCode) {
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
      setAccount(account)
    } else {
      let error = await player.text()
      displayMessage(error, false)
    }
  }
}

export async function getPlayerNameAndGuildId(session, allyCode, displayMessage, setName, setGuildId) {
  let body = {
    session: session,
    payload: {
      allyCode: allyCode
    },
    projection: {
      guildId: 1,
      name: 1,
    }
  }
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  })
  if(response.ok) {
    let player = await response.json()
    setName(player.name)
    setGuildId(player.guildId)
  } else {
    displayMessage('Unable to retrieve player info.', false)
  }
}

export async function refreshPlayerData(session, allyCode, displayMessage) {
  let body = {
    payload: {
      allyCode: allyCode
    },
    session: session
  }
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/refresh/player`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  })
  if(response.ok) {
    let body = await response.text()
    displayMessage(body, true)
    return {success: true}
  } else {
    let error = await response.text()
    displayMessage(error, false)
    return {success: false}
  }
}

export async function getPlayerGACHistory(session, allyCode, displayMessage, setGacHistory) {
    if(session !== '' && allyCode !== '' && allyCode !== undefined) {
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
            setGacHistory(gacList)
            return gacList
        } else {
          if(response.status !== 401) {
            let error = await response.text()
            displayMessage(error, false)
          }
        }
    }
}

export async function getGameConnectionCount(session, allyCode) {
  if(session !== '' && allyCode !== '' && allyCode !== undefined) {
    let body = {
        session: session,
        allyCode: allyCode
    }
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/gameConnection`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    if(response.ok) {
        let count = await response.json()
        return count
    } else {
        let error = await response.text()
        console.log(error)
        return {}
    }
}
}

export async function getCurrentGACBoard(session, allyCode) {
  if(session !== '' && allyCode !== '' && allyCode !== undefined) {
    let body = {
        session: session,
        allyCode: allyCode
    }
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/gac/board`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    if(response.ok) {
        let board = await response.json()
        return board
    } else {
        let error = await response.text()
        console.log(error)
        return {}
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

export async function getLatestBracketResults(session, allyCode, displayMessage) {
  let body = {
    session: session,
    allyCode: allyCode
  }
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/gac/review`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  })
  if(response.ok) {
    let results = response.json()
    return results
  } else {
    let error = await response.text()
    console.log(error)
    displayMessage('Unable to retrieve latest bracket results.', false)
    return {}
  }
}

export async function getAuthStatus(session, allyCode, setAuthStatus, displayMessage) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/authStatus`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session, allyCode}
  })
  if(response.ok) {
    setAuthStatus(true)
  } else {
    let error = await response.text()
    displayMessage(error)
    setAuthStatus(false)
  }
}

export async function getInventory(session, allyCode, displayMessage, setInventory) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/inventory`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session, allyCode}
  })
  if(response.ok) {
    let inventory = await response.json();

    convertInventoryResponseBody(inventory)

    setInventory(inventory)
  } else {
    let error = await response.text()
    displayMessage(error)
  }
}

export async function refreshInventory(session, allyCode, displayMessage, setInventory) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/inventory`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', session, allyCode}
  })
  if(response.ok) {
    let inventory = await response.json()
    convertInventoryResponseBody(inventory)
    setInventory(inventory)
  } else {
    let error = await response.text()
    displayMessage(error)
  }
}

function convertInventoryResponseBody(reponseBody) {
  ['currencyItem', 'equipment', 'material'].forEach(type => {
    // eslint-disable-next-line
    reponseBody[type] = reponseBody[type].reduce((map, obj) => (map[obj[getKeyByInventoryType(type)]] = obj, map), {})
  })
}