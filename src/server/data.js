export async function getNicknames(session, displayMessage, setNicknames) {
    let body = {
        session: session,
        type: "nicknames"
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let nicknames = await response.json()
        nicknames.keys = Object.keys(nicknames.nicknames)
        setNicknames(nicknames)
      } else {
        displayMessage('Unable to retrieve nicknames data.', false)
      }
}

export async function getVisibleCategories(session, displayMessage, setCategories) {
    let body = {
        session: session
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/category/visible`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let categories = await response.json()
        setCategories(categories)
      } else {
        displayMessage('Unable to retrieve categories data.', false)
      }
}

export async function getPlayableUnits(session, displayMessage, setUnits) {
    let body = {
        filter: {obtainable: true, obtainableTime: "0", rarity: 7},
        projection: {baseId: 1, combatType: 1, forceAlignment: 1, nameKey: 1, categoryId: 1, thumbnailName: 1, crew: 1},
        session: session
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/unit/playable`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let units = await response.json()
        setUnits(units)
      } else {
        displayMessage('Unable to retrieve units data.', false)
      }
}