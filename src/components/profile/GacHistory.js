import React, { useEffect, useState } from 'react';
import { Form, Grid, Header, Table } from 'semantic-ui-react';
import { getCharacterData, getShipData, timeSince } from '../../utils';
import CharacterList from './CharacterList';
import ShipList from './ShipList';
import Datacron from './Datacron';
import { getGacHistory } from '../../server/gac';

function GacHistory ({session, account, units, categories, gacHistory, datacrons, displayMessage}){

    const [battleLogList, setBattleLogList] = useState([])
    const [opponentAllyCode, setOpponentAllyCode] = useState(undefined)
    const [allyUnits, setAllyUnits] = useState([])
    const [enemyUnits, setEnemyUnits] = useState([])
    const [mode, setMode] = useState(undefined)
    const [result, setResult] = useState(undefined)

    useEffect(() => {
        if(opponentAllyCode !== undefined || allyUnits.length > 0 || enemyUnits.length > 0) {
            let payload = {
                opponentAllyCode,
                allyUnits: allyUnits.length === 0 ? undefined : allyUnits,
                enemyUnits: enemyUnits.length === 0 ? undefined : enemyUnits,
                mode,
                result
            }
            getGacHistory(session, account.allyCode, payload, displayMessage, setBattleLogList)
        }
    }, [session, account, allyUnits, enemyUnits, mode, result, displayMessage, opponentAllyCode])

    const getHistoryOptions = () => {
        if(gacHistory === undefined) return []
        return gacHistory?.map((gac, index) => {
            return {
                key: index,
                text: `vs. ${gac.opponent.name}`,
                value: gac.opponent.allyCode
            }
        })
        .sort((a,b) => b.time - a.time)
    }

    const handleChange = (e, obj) => {
        let newValue = obj.value === "" ? undefined : obj.value
        setOpponentAllyCode(newValue)
    }

    const handleModeChange = (e, obj) => {
        let newValue = obj.value === "" ? undefined : obj.value
        setMode(newValue)
    }

    const handleResultChange = (e, obj) => {
        let newValue = obj.value === "" ? undefined : obj.value
        setResult(newValue)
    }

    const handleAllyUnitsDropdownChange = (e, obj) => {
        setAllyUnits(obj.value)
    }
    const handleEnemyUnitsDropdownChange = (e, obj) => {
        setEnemyUnits(obj.value)
    }

    const getLogTeam = (squad) => {
		return squad.squad.map(unit => {
            return {
                ...unit,
                currentRarity: 1,
                currentLevel: 1,
                currentTier: 1,
                relic: {
                   currentTier: 0 
                }
            }
        })
	}

    const getUnits = () => {
        return units
            .map(unit => {
                return {
                    key: unit.baseId,
                    text: unit.nameKey,
                    value: unit.baseId,
                    combattype: unit.combatType
                  }
            })
    }

    const getModes = () => {
        return [
            { key: 3, text: "3v3", value: 3 },
            { key: 5, text: "5v5", value: 5 }
        ]
    }

    const getResults = () => {
        return [
            { key: 1, text: "Win", value: true },
            { key: 0, text: "Loss", value: false }
        ]
    }

    const getTableRows = () => {
        if(gacHistory === undefined || gacHistory.length === 0) return

        return battleLogList
        .sort((a,b) => b.time - a.time)
        .map((log, index) => {
            return <Table.Row key={index} positive={log.result} negative={!log.result}>
                <Table.Cell>
                    {
                    log.isToon
                    ?
                    <CharacterList unitData={getCharacterData(getLogTeam(log.attackTeam), units)} filter={false} center={true} categories={categories} simple={true} size='small' displayDatacron={() => <Datacron datacron={log.attackDatacron} datacrons={datacrons} size='xs' modal />}/>
                    :
                    <ShipList unitData={getShipData(getLogTeam(log.attackTeam), units)} filter={false} center={true} categories={categories} simple={true} size='small'/>
                    }
                </Table.Cell>
                <Table.Cell>
                    {
                    log.isToon
                    ?
                    <CharacterList killList={log.killList} unitData={getCharacterData(getLogTeam(log.defenseTeam), units)} filter={false} center={true} categories={categories} simple={true} size='small' displayDatacron={() =><Datacron datacron={log.defenseDatacron} datacrons={datacrons} size='xs' modal />}/>
                    :
                    <ShipList killList={log.killList} unitData={getShipData(getLogTeam(log.defenseTeam), units)} filter={false} center={true} categories={categories} simple={true} size='small'/>
                    }
                </Table.Cell>
                <Table.Cell>
                    {log.banner}
                </Table.Cell>
                <Table.Cell textAlign='left'>
                    {log.comment}
                </Table.Cell>
                <Table.Cell>
                    {timeSince(log.time)}
                </Table.Cell>
            </Table.Row>
        })
    }

    const displaySelectedGacHistory = () => {
        return<Table celled textAlign='center'>
            <Table.Header fullWidth>
                <Table.Row>
                    <Table.HeaderCell>Your Squad</Table.HeaderCell>
                    <Table.HeaderCell>Opponent's Squad</Table.HeaderCell>
                    <Table.HeaderCell>Banners</Table.HeaderCell>
                    <Table.HeaderCell>Notes</Table.HeaderCell>
                    <Table.HeaderCell>Time</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {getTableRows()}
            </Table.Body>
        </Table>
    }

	return <Grid>
        <Grid.Row centered>
            <Grid.Column>
                <Header textAlign='center'>GAC History</Header>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row centered>
                <Form>
                    <Form.Group>
                        <Form.Dropdown
                            label="Opponent"
                            options={getHistoryOptions()}
                            selection
                            placeholder='Select Opponent'
                            clearable
                            onChange={handleChange}
                            value={opponentAllyCode}
                        />
                        <Form.Dropdown
                            label="Ally Units"
                            placeholder='Ally Units'
                            multiple
                            search
                            selection
                            closeOnChange
                            options={getUnits()}
                            onChange={handleAllyUnitsDropdownChange}
                            value={allyUnits}
                        />
                        <Form.Dropdown
                            label="Enemy Units"
                            placeholder='Enemy Units'
                            multiple
                            search
                            selection
                            closeOnChange
                            options={getUnits()}
                            onChange={handleEnemyUnitsDropdownChange}
                            value={enemyUnits}
                        />
                        <Form.Dropdown
                            label="GAC Mode"
                            placeholder='GAC Mode'
                            selection
                            closeOnChange
                            clearable
                            options={getModes()}
                            onChange={handleModeChange}
                            value={mode}
                        />
                        <Form.Dropdown 
                            label="Battle Result"
                            placeholder='Battle Result'
                            selection
                            closeOnChange
                            clearable
                            options={getResults()}
                            onChange={handleResultChange}
                            value={result}
                        />
                    </Form.Group>
                </Form>
        </Grid.Row>
        <Grid.Row>
            {displaySelectedGacHistory()}
        </Grid.Row>
    </Grid>
}


export default GacHistory;