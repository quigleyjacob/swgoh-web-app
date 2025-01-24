import { pivotSimulation } from "../utils/operation"

export async function getOperations(guildId, session, displayMessage, setOperationsList) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/operation`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', session}
    })
    if(response.ok) {
        let operations = await response.json()
        setOperationsList(operations)
    } else {
        if(response.status !== 401) {
            displayMessage(`Unable to get operations for guild [${await response.text()}]`)
        }
    }
}

export async function getOperation(id, guildId, session, displayMessage, setOperation, setOperationId) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/operation/${id}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json', session}
    })
    if(response.ok) {
        let operation = await response.json()
        setOperation(operation)
        setOperationId(id)
    } else {
        displayMessage(`Unable to get operation for guild [${await response.text()}]`)
    }
}

export async function addOperation(guildId, session, payload, displayMessage, operationsList, setOperationsList, setOperationId) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/operation`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', session},
        body: JSON.stringify(payload)
    })
    if(response.ok) {
        let operation = await response.json()
        setOperationsList([...operationsList, {_id: operation._id, title: operation.title}])
        setOperationId(operation._id)
    } else {
        displayMessage(`Unable to save operation [${await response.text()}].`)
    }
}

export async function updateOperation(id, guildId, session, payload, displayMessage) {
    let body = JSON.parse(JSON.stringify(payload))
    delete body._id
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/operation/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json', session},
        body: JSON.stringify(body)
    })
    if(response.ok) {
        displayMessage(`Operation [${id}] successfully saved.`, true)
    } else {
        displayMessage(`Unable to save operation [${await response.text()}].`)
    }
}

export async function deleteOperation(id, guildId, session, displayMessage, operationsList, setOperationsList) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/operation/${id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json', session}
    })
    if(response.ok) {
        setOperationsList(operationsList.filter(({_id}) => _id !== id))
        displayMessage(`Operation [${id}] successfully saved.`, true)
    } else {
        displayMessage(`Unable to delete operation [${await response.text()}].`)
    }
}

export async function getIdealPlatoons(guildId, session, tb, operation, unitsMap, displayMessage, setSimulation) {
    let body = {
        guildId,
        tb,
        zones: operation.zones,
        excludedPlatoons: operation.excludedPlatoons,
        excludedPlayers: operation.excludedPlayers,
        previousOperation: operation.previousOperation
    }
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/${guildId}/operation/ideal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'session': session },
        body: JSON.stringify(body)
    })
    if (response.ok) {
        let simulation = await response.json()
        simulation.pivot = pivotSimulation(simulation, operation, unitsMap)
        setSimulation(simulation)
    } else {
        let error = await response.text()
        displayMessage(error, false)
    }
}