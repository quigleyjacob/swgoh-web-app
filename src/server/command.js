export async function getCommands(guildId, session, type = undefined, displayMessage, setCommandsList) {
    let query = type ? `?type=${type}` : ''
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/command${query}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'session': session}
    })
    if(response.ok) {
        let commands = await response.json()
        setCommandsList(commands)
    } else {
        displayMessage(await response.text())
    }
}

export async function getCommand(id, guildId, session, displayMessage, setCommand, setCommandId = () => {}) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/command/${id}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'session': session}
    })
    if(response.ok) {
        let command = await response.json()
        setCommand(command)
        setCommandId(id)
    } else {
        displayMessage(await response.text())
    }
}

export async function addCommand(guildId, session, body, displayMessage, commandList, setCommandList, setCurrentCommand) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/command`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'session': session},
        body: JSON.stringify(body)
    })
    if(response.ok) {
        let command = await response.json()
        let id = command._id
        setCommandList([...commandList, command].sort((a,b) => (a.public || 0) - (b.public || 0)))
        setCurrentCommand(id)
        displayMessage(`Command successfully created`, true)
    } else {
        displayMessage(await response.text())
    }
}

export async function updateCommand(id, guildId, session, body, displayMessage) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/command/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json', 'session': session},
        body: JSON.stringify(body)
    })
    if(response.ok) {
        displayMessage(`Command [${id}] successfully updated`, true)
    } else {
        displayMessage(await response.text())
    }
}

export async function deleteCommand(id, guildId, session, displayMessage, commandList, setCommandList) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/command/${id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json', 'session': session}
    })
    if(response.ok) {
        setCommandList(commandList.filter(({_id}) => _id !== id))
        displayMessage(`Command [${id}] successfully deleted`, true)
    } else {
        displayMessage(await response.text())
    }
}

export async function pushCommandsToGame(body, guildId, session, displayMessage) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/command/execute`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'session': session},
        body: JSON.stringify(body)
    })
    if(response.ok) {
        displayMessage(`Command successfully pushed to game`, true)
    } else {
        displayMessage(await response.text())
    }
}

export async function pushCommendsToGameById(id, guildId, session, displayMessage) {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/command/${id}/execute`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'session': session},
    })
    if(response.ok) {
        displayMessage(`Command successfully pushed to game`, true)
    } else {
        displayMessage(await response.text())
    }
}