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

export async function getInventory(session, allyCode, displayMessage, setInventory, refresh = false) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/inventory?refresh=${refresh}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
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

function convertInventoryResponseBody(responseBody) {
  ['currency', 'equipment', 'material'].forEach(type => {
    // eslint-disable-next-line
    responseBody[type] = responseBody[type].reduce((map, obj) => (map[obj.id] = obj, map), {})
  })
}