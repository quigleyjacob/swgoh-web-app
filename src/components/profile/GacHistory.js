import React, { useCallback, useEffect, useState } from 'react';
import { Form, Grid, Header, Table } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from './CharacterList';
import ShipList from './ShipList';

function GacHistory ({session, units, account, skills, images, categories}){

    const [gacHistory, setGacHistory] = useState([])
    const [battleLogsList, setBattleLogsList] = useState([])
    const [active, setActive] = useState(undefined)
    const [allyUnits, setAllyUnits] = useState([])
    const [enemyUnits, setEnemyUnits] = useState([])
    const [mode, setMode] = useState(undefined)
    const [result, setResult] = useState(undefined)

    const primaryFilterNotNull = () => {
        return active !== undefined || allyUnits.length > 0 || enemyUnits.length > 0
    }

    const getGACHistory = useCallback(async () => {
        let body = {
            session: session,
            allyCode: account.allyCode
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/gac`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let gacList = await response.json()
            setGacHistory(gacList)
        } else {
            let error = await response.text()
            console.log(error)
        }
    }, [account.allyCode, session])

    useEffect(() => {
        (async () => {
            if(session) {
                getGACHistory()
            }
        })()
    }, [getGACHistory, session])

    useEffect(() => {
        console.log('here')
        let logs = []
        gacHistory.forEach((history, index) => {
            let addedEnemyIndexList = history.battleLog.map(log => ({...log, active: index}))
            console.log(history.battleLog)
            logs.push(...addedEnemyIndexList)
        })
        setBattleLogsList(logs)
        console.log(logs.length)
    }, [gacHistory])
    

    const getHistoryOptions = () => {
        return gacHistory.map((gac, index) => {
            return {
                key: index,
                text: `vs. ${gac.opponent.name}`,
                value: index
            }
        })
        .sort((a,b) => b.time - a.time)
    }

    const handleChange = (e, obj) => {
        let newValue = obj.value === "" ? undefined : obj.value
        setActive(newValue)
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
		return squad.map(baseId => {
            return {
                baseId: baseId,
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

    const getFilteredLogs = () => {
        return battleLogsList
            .filter(log => active === undefined || log.active === active)
            .filter(log => allyUnits.every(unit => log.attackTeam.includes(unit)))
            .filter(log => enemyUnits.every(unit => log.defenseTeam.includes(unit)))
            .filter(log => mode === undefined || !log.isToon || log.defenseTeam.length === mode)
            .filter(log => result === undefined || log.result === result)
    }

    const displaySelectedGacHistory = () => {
            return<Table celled textAlign='center'>
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell>Your Squad</Table.HeaderCell>
                        <Table.HeaderCell>Opponent's Squad</Table.HeaderCell>
                        <Table.HeaderCell>Banners</Table.HeaderCell>
                        <Table.HeaderCell>Notes</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                    Object.keys(gacHistory).length !== 0 && primaryFilterNotNull()
                    ?
                    getFilteredLogs().map((log, index) => {
                        return <Table.Row key={index} positive={log.result} negative={!log.result}>
                            <Table.Cell>
                                {
                                log.isToon
                                ?
                                <CharacterList unitData={getCharacterData(getLogTeam(log.attackTeam), units)} skills={skills} images={images} filter={false} center={true} categories={categories} simple={true} size='small'/>
                                :
                                <ShipList unitData={getShipData(getLogTeam(log.attackTeam), units)} images={images} filter={false} center={true} categories={categories} simple={true} size='small'/>
                                }
                            </Table.Cell>
                            <Table.Cell>
                                {
                                log.isToon
                                ?
                                <CharacterList killList={log.killList} unitData={getCharacterData(getLogTeam(log.defenseTeam), units)} skills={skills} images={images} filter={false} center={true} categories={categories} simple={true} size='small'/>
                                :
                                <ShipList killList={log.killList} unitData={getShipData(getLogTeam(log.defenseTeam), units)} images={images} filter={false} center={true} categories={categories} simple={true} size='small'/>
                                }
                            </Table.Cell>
                            <Table.Cell>
                                {log.banner}
                            </Table.Cell>
                            <Table.Cell textAlign='left'>
                                {log.comment}
                            </Table.Cell>
                        </Table.Row>
                    })
                    :
                    ""
                    }
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
                            value={active}
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