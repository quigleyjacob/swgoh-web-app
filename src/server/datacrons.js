export async function getDatacronNames(session, allyCode, displayMessage, setDatacronNames) {
if(session && allyCode) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/datacron`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json', session}
    })
    if(response.ok) {
      try {
        let datacronNames = await response.json()
        setDatacronNames(datacronNames)
      } catch(e) {
        setDatacronNames({allyCode: allyCode, datacronNames: {}})
      }
    } else {
      if(response.status !== 401) {
        let error = await response.text()
        displayMessage(error, false)
      }
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

export async function getDatacronTests(session, guildId, displayMessage, setGuildDatacronTest) {
			let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/datacron`, {
				method: 'GET',
				headers: {'Content-Type': 'application/json', session}
			})
			if(response.ok) {
				let body = await response.json()
        setGuildDatacronTest(body.list)
			} else {
        displayMessage(`Unable to get datacron tests for guild [${guildId}]`)
        return defaultGuildChecklistState
      }
}

export async function updateDatacronTests(session, guildId, tests, displayMessage) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/datacron`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json', session},
      body: JSON.stringify(tests)
  })
  if(response.ok) {
      displayMessage("Datacron Tests saved.", true)
  } else {
      let error = await response.text()
      displayMessage(error, false)
  }
}