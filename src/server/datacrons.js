export async function getDatacronNames(session, allyCode, displayMessage) {
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
            return datacronNames
          } catch(e) {
            return {allyCode: allyCode, datacronNames: {}}
          }
        } else {
            let error = await response.text()
            displayMessage(error, false)
            return {allyCode: allyCode, datacronNames: {}}
        }
      }
}