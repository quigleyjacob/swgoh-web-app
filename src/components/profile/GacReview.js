import React, {useCallback, useEffect, useState} from 'react'
import { Header, Grid, Accordion, Message, List } from "semantic-ui-react"
import { getLatestBracketResults } from '../../server/gac'
import { BattleOutcome } from '../../utils/constants.js'
import CharacterList from './CharacterList.js'
import ShipList from './ShipList.js'
import Datacron from './Datacron.js'
import { getCharacterData, getShipData } from '../../utils/index.js'


function GacReview({session, redirect, datacrons, account, displayMessage, units}) {

    const [brackets, setBrackets] = useState({})

    const getBracket = useCallback(async () => {
        let response = await getLatestBracketResults(session, account.allyCode, displayMessage)
        setBrackets(response)
    }, [session, account.allyCode, displayMessage])

    useEffect(() => {
        redirect('gacReview')
        getBracket()
    }, [redirect, getBracket])

    const overviewDisplay = (match) => {
        let win = Number(match.home.score) > Number(match.away.score)
        return <Message positive={win} negative={!win}>
            <Grid columns={3}>
                <Grid.Column>
                <Header textAlign='center' size='huge' content={match.home.playerName} subheader={match.home.score}/>
                </Grid.Column>
                <Grid.Column>
                    <Header textAlign='center' size='medium' content={'vs.'} />
                </Grid.Column>
                <Grid.Column>
                <Header textAlign='center' size='huge' content={match.away.playerName} subheader={match.away.score}/>
                </Grid.Column>
            </Grid>
            
            
        </Message>
    }

    const getBattleLength = (startTime, endTime)=>{
        try{
          let timeDiff = Math.floor(Math.abs((+endTime - +startTime)/1000)), timeAdjust = (1000 * 60 * 60 * 24 * 60) - 4000
          if(timeDiff > 10 * 60){
            timeDiff = Math.floor(Math.abs(((+endTime - timeAdjust) - +startTime)/1000))
          }
          let m = Math.floor(timeDiff/60)
          let s = Math.floor((timeDiff - (m * 60)))
          return m+':'+s?.toString()?.padStart(2, '0')
        }catch(e){
          console.error(e);
        }
      }

    const convertUnitData = (unit) => {
        return {
            baseId: unit.definitionId.split(':')[0],
            currentLevel: unit.level,
            currentRarity: unit.rarity,
            currentTier: unit.tier,
            relic: {
                currentTier: unit.relicTier
            },
            remainingLife: {
                health: unit.healthPercent,
                protection: unit.shieldPercent
            }
        }
    }

    const convertDatacronStats = (datacron) => {
        datacron.affix.forEach(tier => {
            tier.statValue = String(Number(tier.statValue) / Math.pow(10, 8))
        })
        return datacron
    }

    const displayBattle = (battle, offense) => {
        let outcome = battle.battleOutcome
        let win = outcome === 1
        let isFleet = battle.attackerUnit[0].squadUnitType === 3

        let playerUnits = (offense ? battle.attackerUnit : battle.defenderUnit).map(unit => convertUnitData(unit))
        let opponentUnits = (offense ? battle.defenderUnit : battle.attackerUnit).map(unit => convertUnitData(unit))

        let playerDatacron = convertDatacronStats(offense ? battle.attackerDatacron : battle.defenderDatacron)
        let opponentDatacron = convertDatacronStats(offense ? battle.defenderDatacron : battle.attackerDatacron)
        return <Message positive={win} negative={!win}>

            
            
            <Grid columns={2}>
                <Grid.Column width={2}>
                    <List>
                        <List.Item>
                        {BattleOutcome[outcome]}
                        </List.Item>
                        <List.Item>
                        Duration: {getBattleLength(battle.startTime, battle.endTime)}
                        </List.Item>
                        <List.Item>
                        Attempt: {battle.attempt}
                        </List.Item>
                        <List.Item>
                        Banners: {battle.banners}
                        </List.Item>
                    </List>
                </Grid.Column>
                <Grid.Column width={14}>
                    <Grid columns={3}>
                    <Grid.Column computer={7} mobile={16}>
                    {isFleet ? <ShipList size='small' unitData={getShipData(playerUnits, units)} filter={false} showLife/> : <CharacterList simple size='small' unitData={getCharacterData(playerUnits, units)} filter={false} showLife displayDatacron={() => <Datacron datacron={playerDatacron} datacrons={datacrons} size='xs' modal />} />}
                    </Grid.Column>
                    <Grid.Column computer={2} mobile={16}>
                        <Header textAlign='center' size='medium' content='vs.'/>
                    </Grid.Column>
                    <Grid.Column computer={7} mobile={16}>
                    {isFleet ? <ShipList size='small' unitData={getShipData(opponentUnits, units)} filter={false} showLife/> : <CharacterList simple size='small' unitData={getCharacterData(opponentUnits, units)} filter={false} showLife displayDatacron={() => <Datacron datacron={opponentDatacron} datacrons={datacrons} size='xs' modal />} />}
                    </Grid.Column>
                    </Grid>
                </Grid.Column>

            </Grid>
            
            </Message>
    }

    const computeDetails = (battles) => {
        battles.forEach((battle, index) => {
            let enemyLeader = battle.duelResult[0].defenderUnit[0].definitionId
            let numPrior = battles.filter((battle, idx) => idx > index && battle.duelResult[0].defenderUnit[0].definitionId === enemyLeader).length
            let prior = battles.find((battle, idx) => idx > index && battle.duelResult[0].defenderUnit[0].definitionId === enemyLeader)
            let numDeadPrior = prior ? prior.duelResult[0].defenderUnit.filter(unit => unit.healthPercent === 0).length : 0
            let numDeadNow = battle.duelResult[0].defenderUnit.filter(unit => unit.healthPercent === 0).length
            battle.duelResult[0].attempt = numPrior + 1

            let isFleet = battle.duelResult[0].attackerUnit[0].squadUnitType === 3
            let maxUnitLength = isFleet ? 8 : battle.duelResult[0].defenderUnit.length

            let win = battle.duelResult[0].battleOutcome === 1
            let banners = numDeadNow - numDeadPrior // number defeated
            if(win) {
                banners += 15 // default for win
                banners += numPrior === 0 ? 30 : 0 // first battle bonus
                banners += numPrior === 1 ? 10 : 0 // second battle bonus
                banners += battle.duelResult[0].attackerUnit.filter(unit => unit.healthPercent > 0).length // surviving units bonus
                banners += battle.duelResult[0].attackerUnit.filter(unit => unit.healthPercent === 100).length // max health bonus
                banners += battle.duelResult[0].attackerUnit.filter(unit => unit.shieldPercent === 100).length // max protection bonus
                banners += 4*(maxUnitLength - battle.duelResult[0].attackerUnit.length) // unused slot bonus
            }
            battle.duelResult[0].banners = banners
        })

        return battles
    }

    const displayBattles = (battles, offense) => {
        return computeDetails(battles)
        .reverse()
        .map(battle => displayBattle(battle.duelResult[0], offense))
    }

    const displayMatchResults = (match, index) => {

        let panels = [
            {
                index: 0,
                title: 'Offense',
                content: {content: displayBattles(match.attackResult, true)}
            },
            {
                index: 1,
                title: 'Defense',
                content: {content: displayBattles(match.defenseResult, false)}
            }
        ]
        return {
            key: index,
            title: `vs. ${match.away.playerName}`,
            content: {
                content: <div>
                    {overviewDisplay(match)}
                    <Accordion styled fluid panels={panels}/>
                    </div>
            }
        }
    }

    const displayResults = () => {
        let panels = brackets?.matchResult?.map((match, index) => displayMatchResults(match, index))
        return <Accordion styled fluid exclusive={false} panels={panels} />
    }

    return <Grid>
    <Grid.Row centered>
        <Grid.Column>
            <Header textAlign='center'>GAC Review</Header>
        </Grid.Column>
    </Grid.Row>
    <Grid.Row>
        {brackets ? displayResults() : ''}
    </Grid.Row>
    </Grid>
}

export default GacReview