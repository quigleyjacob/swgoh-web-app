export async function getGACServerLeaderboard(displayMessage, setLeaderboard) {
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/leaderboard/943644101310562366`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      })
      if(response.ok) {
        let leaderboard = await response.json()

        let allyCodeArray = leaderboard.accounts
        let accounts = await getLeaderboardAccounts(allyCodeArray, displayMessage)
        let playerScores = await getAccountScores(allyCodeArray, displayMessage)
        let playerScoresMap = playerScores.reduce((map, scores) => {
            map[scores.allyCode] = scores
            return map
        }, {})
        let leaderboardData = accounts.map(account => {
            return {
                allyCode: account?.allyCode || '',
                name: account.name || '',
                modScore: playerScoresMap[account.allyCode]?.modScore || 0,
                galacticPower: playerScoresMap[account.allyCode]?.galacticPower || 0,
                gacPowerScore: playerScoresMap[account.allyCode]?.gacPowerScore || 0,
                skillRating: account?.playerRating?.playerSkillRating?.skillRating || 0
            }
        }).filter(data => data.allyCode !== '')
        setLeaderboard(leaderboardData)
      } else {
        let error = await response.text()
        displayMessage(error, false)
      }
}

async function getLeaderboardAccounts(allyCodeArray, displayMessage) {
    let body = {
        allyCodeArray,
        projection: {name: 1, allyCode: 1, 'playerRating.playerSkillRating.skillRating': 1}
    }
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/arena`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        return await response.json()
      } else {
        let error = await response.text()
        displayMessage(error, false)
      }
}

async function getAccountScores(allyCodeArray, displayMessage) {
    let body = {
        allyCodeArray
    }
    let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/playerScores`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        return await response.json()
      } else {
        let error = await response.text()
        displayMessage(error, false)
      }
}