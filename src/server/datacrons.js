export async function getDatacronNames(session, allyCode, displayMessage, setDatacronNames) {
    if(session && allyCode) {
        let body = {
          session: session,
          allyCode: allyCode
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/datacron`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(body)
        })
        if(response.ok) {
          try {
            let datacronNames = await response.json()
            setDatacronNames(datacronNames)
          } catch(e) {
            setDatacronNames({allyCode: allyCode, datacronNames: {}})
          }
        } else {
            let error = await response.text()
            displayMessage(error, false)
            setDatacronNames({allyCode: allyCode, datacronNames: {}})
        }
      }
}

export const defaultGuildChecklistState = {
  active: {
      title: 'Active Datacrons',
      list: []
  },
  archived: {
      title: 'Archived Datacrons',
      list: []
  }
}

export async function getDatacronTests(session, guildId, displayMessage) {
  let body = {session: session, guildId: guildId}
			let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/datacronTest`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(body)
			})
			if(response.ok) {
				let body = await response.json()
        return body.list
			} else {
        return defaultGuildChecklistState
      }
}

export async function updateDatacronTests(session, guildId, tests, displayMessage) {
  let body = {
      session: session,
      tests: {
          guildId: guildId,
          list: tests
      }
  }
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/datacronTest`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
  })
  if(response.ok) {
      displayMessage("Datacron Tests saved.", true)
  } else {
      let error = await response.text()
      displayMessage(error, false)
  }
}

export async function getActiveDatacrons(session, displayMessage, setDatacrons) {
  let body = {
    session: session
  }
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/datacron/active`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  })
  if(response.ok) {
    let datacrons = await response.json()
    setDatacrons(datacrons)
  } else {
    displayMessage('Unable to retrieve datacrons data.', false)
  }
}