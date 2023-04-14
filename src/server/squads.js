
export async function getSquads(session, account, setSquads) {
    if(session) {
        let body = {
            session: session,
            allyCode: account.allyCode
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/squad`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let squadList = await response.json()
            setSquads(squadList)
        } else {
            console.log(await response.text())
            //TODO: display error message
        }
    }
}

export async function addNewSquad(selectedOptions, isFor3, isFor5, session, account, toon, squads, setSelectedOptions, setSquads) {
    // cannot submit if no toons are selected or if both options for 3s and 5s are not selected
    if(selectedOptions.length === 0 || (!isFor3 && !isFor5)) {
        return
    }
    if(session) {
        let body = {
            session: session,
            payload: {
                allyCode: account.allyCode,
                combatType: toon ? 1 : 2,
                isFor3: isFor3,
                isFor5: isFor5,
                squad: selectedOptions
            }
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/squad/add`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let squad = await response.json()
            let newSquadList = [...squads, squad]
            setSquads(newSquadList)
            setSelectedOptions([])
        } else {
            console.log(await response.text())
            //TODO: display error message
        }

    }
}

export async function deleteSquad(e, session, account, squads, setSquads) {
    if(session) {
        let squadToDeleteId = e.target.id
        let body = {
            session: session,
            allyCode: account.allyCode,
            squadId: squadToDeleteId
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/squad/delete`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let newSquadList = squads.filter(squad => {
                return squad._id !== squadToDeleteId
            })
            setSquads(newSquadList)
        } else {
            console.log(await response.text())
            // TODO: display error message
        }
    }
}