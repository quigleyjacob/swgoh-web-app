export async function getGacs(session, allyCode, displayMessage, setGacHistory) {
    if (session !== '' && allyCode !== '' && allyCode !== undefined) {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/gac`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', session }
        })
        if (response.ok) {
            let gacList = await response.json()
            setGacHistory(gacList)
        } else {
            if (response.status !== 401) {
                let error = await response.text()
                displayMessage(error, false)
            }
        }
    }
}

export async function getGac(id, session, allyCode, displayMessage, setActiveGac, setActiveGacId, step, setStep) {
    if(session !== '' && allyCode !== '') {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/gac/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', session}
        })
        if (response.ok) {
            let gac = await response.json()
            setActiveGac(gac)
            setActiveGacId(gac._id)
            setStep(1)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error)
        }
    }
}

export async function createGac(session, allyCode, activeGac, displayMessage, gacHistory, setGacHistory, setActiveGac, setActiveGacId, step, setStep) {
    if(session !== '' && allyCode !== '') {
        let body = JSON.parse(JSON.stringify(activeGac))
        body.time = Date.now()
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/gac`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', session},
            body: JSON.stringify(body)
        })
        if (response.ok) {
            let gac = await response.json()
            let gacLog =  {_id: gac._id, league: gac.league, mode: gac.mode, opponent: gac.opponent, time: gac.time}
            setGacHistory([gacLog, ...gacHistory])
            setActiveGac(gac)
            setActiveGacId(gac._id)
            setStep(step+1)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error)
        }
    }
}

export async function updateGac(id, session, allyCode, activeGac, displayMessage, displaySuccess = true) {
    if (id !== '' && session !== '' && allyCode) {
        let body = JSON.parse(JSON.stringify(activeGac))
        body.time = Date.now()

        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/gac/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', session },
            body: JSON.stringify(body)
        })
        if (response.ok) {
            if (displaySuccess) displayMessage('Successfully saved GAC data.', true)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage('Unable to save GAC data.', false)
        }
    }
}

export async function deleteGac(id, session, allyCode, displayMessage, gacHistory, setGacHistory) {
    if(id !== '' && session !== '' && allyCode !== '') {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/gac/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', session }
        })
        if (response.ok) {
            setGacHistory(gacHistory.filter(({_id}) => _id !== id))
            displayMessage(`Successfully deleted GAC [id=${id}]`, true)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage('Unable to save GAC data.', false)
        }
    }
}

export async function getCurrentGACBoard(session, allyCode, displayMessage) {
    if (session !== '' && allyCode !== '' && allyCode !== undefined) {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/gac/board`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', session }
        })
        if (response.ok) {
            let board = await response.json()
            return board
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error)
            return {}
        }
    }
}

export async function getLatestBracketResults(session, allyCode, displayMessage) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/gac/review`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', session }
    })
    if (response.ok) {
        let results = response.json()
        return results
    } else {
        let error = await response.text()
        console.log(error)
        displayMessage('Unable to retrieve latest bracket results.', false)
        return {}
    }
}

export async function getGacHistory(session, allyCode, payload, displayMessage, setBattleLogList) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/${allyCode}/gac/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', session },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        let results = await response.json()

        setBattleLogList(results.map(({battleLog, time}) =>{return {...battleLog, time}}))
    } else {
        let error = await response.text()
        console.log(error)
        displayMessage('Unable to retrieve latest bracket results.', false)
        return {}
    }
}