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

export async function getCommand(id, guildId, session, displayMessage, setCommand, setCommandId) {
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

export async function addCommand(guildId, session, title, description, type, displayMessage, commandList, setCommandList, setCurrentCommand) {
    let body = {
        title,
        description,
        type
    }
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/command`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'session': session},
        body: JSON.stringify(body)
    })
    if(response.ok) {
        let command = await response.json()
        let id = command._id
        setCommandList([...commandList, command])
        setCurrentCommand(id)
    } else {
        displayMessage(await response.text())
    }
}

export async function updateCommand(id, guildId, session, title, description, type, displayMessage) {
    let body = {
        title,
        description,
        type
    }
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