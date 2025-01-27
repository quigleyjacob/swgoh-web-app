export async function getSquads(session, allyCode, displayMessage, setSquads) {
    if(session && allyCode) {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/squad`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json', session}
        })
        if(response.ok) {
            let squadList = await response.json()
            setSquads(squadList)
        } else {
            if(response.status !== 401) {
                let error = await response.text()
                displayMessage(error)
            }
        }
    }
}

export async function addNewSquad(selectedOptions, tags, session, allyCode, toon, squads, setSelectedOptions, setSquads, displayMessage) {
    // cannot submit if no toons are selected or if both options for 3s and 5s are not selected
    if(selectedOptions.length === 0 || tags.length === 0) {
        return
    }
    if(session) {
        let body = {
            allyCode,
            combatType: toon ? 1 : 2,
            tags,
            squad: selectedOptions
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/squad`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', session},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let squad = await response.json()
            let newSquadList = [...squads, squad]
            setSquads(newSquadList)
            setSelectedOptions([])
        } else {
            displayMessage(await response.text())
        }

    }
}

export async function deleteSquad(id, allyCode, session, displayMessage, squads, setSquads) {
    if(session) {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/squad/${id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json', session}
        })
        if(response.ok) {
            let newSquadList = squads.filter(({_id}) => _id !== id)
            setSquads(newSquadList)
        } else {
            displayMessage(await response.text())
        }
    }
}