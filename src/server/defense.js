export async function getDefenses(session, allyCode, displayMessage) {
    if(session && allyCode) {
        let headers = {
            'Content-Type': 'application/json',
            session: session,
            allyCode: allyCode
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/defense`, {
            method: 'GET',
            headers: headers
        })
        if(response.ok) {
            let defenseList = await response.json()
            return defenseList
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error, false)
            return []            
        }
    }
}