// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Dropdown, Form, Grid, Input, Header, List } from 'semantic-ui-react';
import { validateAllyCode } from '../../utils';
import { saveGac } from '../../server/player';
import { getPlayerGACHistory, getCurrentGACBoard } from '../../server/player';

function GacInformation ({setStep, step, setOpponent, setLoaderVisible, setLoaderMessage, session, displayMessage, gacHistory, setGacHistory, setActiveGac, setActiveGacId, account, connection, displayModal}){

    const getGacHistoryCallback = useCallback(async () => {
        let gacHistory = await getPlayerGACHistory(session, account.allyCode, displayMessage)
        setGacHistory(gacHistory)
      }, [account?.allyCode, session, displayMessage, setGacHistory])

    useEffect(() => {
        getGacHistoryCallback()
    }, [getGacHistoryCallback])

    const squadsPerZone = {
        3: {
            KYBER: {top: 5,bottom: 5,back: 5,fleet: 3},
            AURODIUM: {top: 4,bottom: 4,back: 5,fleet: 2},
            CHROMIUM: {top: 3,bottom: 3,back: 4,fleet: 2},
            BRONZIUM: {top: 2,bottom: 2,back: 3,fleet: 1},
            CARBONITE: {top: 1,bottom: 1,back: 1,fleet: 1}
        },
        5: {
            KYBER: {top: 4,bottom: 4,back: 3,fleet: 3},
            AURODIUM: {top: 3,bottom: 3,back: 3,fleet: 2},
            CHROMIUM: {top: 3,bottom: 2,back: 2,fleet: 2},
            BRONZIUM: {top: 2,bottom: 2,back: 1,fleet: 1},
            CARBONITE: {top: 1,bottom: 1,back: 1,fleet: 1}
        }
    }

    const getSquadsPerZone = (mode, league) => {
        let zoneLengths = squadsPerZone[mode][league]
        return {
            top: new Array(zoneLengths.top).fill([]),
            bottom: new Array(zoneLengths.bottom).fill([]),
            back: new Array(zoneLengths.back).fill([]),
            fleet: new Array(zoneLengths.fleet).fill([])
        }
    }

    const getKillMap = (mode, league) => {
        let zoneLengths = squadsPerZone[mode][league]
        return {
            top: new Array(zoneLengths.top).fill(new Array(mode).fill(false)),
            bottom: new Array(zoneLengths.bottom).fill(new Array(mode).fill(false)),
            back: new Array(zoneLengths.back).fill(new Array(mode).fill(false)),
            fleet: new Array(zoneLengths.fleet).fill(new Array(8).fill(false))
        }
    }

    const defaultFormErrorObject = {'allyCode': {}, 'league': {}, 'mode': {}}

    const [formData, setFormData] = useState({})
    const [formError, setFormError] = useState(defaultFormErrorObject)

    const validateForm = () => {
        let newFormError = defaultFormErrorObject
        if(!formData['allyCode']) {
            newFormError['allyCode'] = {
                content: 'This field is required',
                pointing: 'below'
            }
        }
        if(!formData['league']) {
            newFormError['league'] = {
                content: 'This field is required',
                pointing: 'below'
            }
        }
        if(!formData['mode']) {
            newFormError['mode'] = {
                content: 'This field is required',
                pointing: 'below'
            }
        }
        setFormError(newFormError)
        return Object.values(newFormError).every(obj => Object.keys(obj).length === 0)
    }

    const updateFormData = (e, obj) => {
        let id = obj.id
        let newValue = obj.value
        let data = JSON.parse(JSON.stringify(formData))
        data[id] = newValue
        setFormError(defaultFormErrorObject)
        setFormData(data)
    }

    const leagues = [
        {value: 'KYBER', text: 'Kyber', image: 'tex.league_icon_kyber.png'},
        {value: 'AURODIUM', text: 'Aurodium', image: 'tex.league_icon_aurodium.png'},
        {value: 'CHROMIUM', text: 'Chromium', image: 'tex.league_icon_chromium.png'},
        {value: 'BRONZIUM', text: 'Bronzium', image: 'tex.league_icon_bronzium.png'},
        {value: 'CARBONITE', text: 'Carbonite', image: 'tex.league_icon_carbonite.png'}
    ]

    const modes = [
        {value: 3, text:'3 vs. 3'},
        {value: 5, text: '5 vs. 5'}
    ]

    const onLoadGACButtonClick = async () => {
        let message = <span>
            <p>This action will log into your game and retrieve the current GAC round, if one is active.</p>
            <p>This will break your game connection. Would you like to proceed?</p>
        </span>
        displayModal(message, true, loadGAC)
    }

    const loadGAC = async () => {
        setLoaderMessage('Getting current GAC board.')
        setLoaderVisible(true)
        let gacBoard = await getCurrentGACBoard(session, account.allyCode)
        let allyCode = gacBoard.opponent.allyCode
        let mode = gacBoard.mode
        let league = gacBoard.league

        let body = {
            payload: {
                allyCode: allyCode
            },
            session: session,
            refresh: true
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let opponent = await response.json()
            let conversion = ['top', 'bottom', 'fleet', 'back']
            let playerMap = getSquadsPerZone(mode, league)
            gacBoard.home.forEach((zone, index) => {
                if(zone.length) {
                    let zoneName = conversion[index]
                    playerMap[zoneName] = zone
                }
            })

            let playerDatacronMap = getSquadsPerZone(mode, league)
            // eslint-disable-next-line
            let playerIdToDatcron = account.datacron.reduce((map, obj) => (map[obj.id] = obj, map), {})
            gacBoard.homeDatacrons.forEach((zone, index) => {
                if(zone.length) {
                    let zoneName = conversion[index]
                    playerDatacronMap[zoneName] = zone.map(id => playerIdToDatcron[id] || [])
                }
            })

            let opponentMap = getSquadsPerZone(mode, league)
            gacBoard.away.forEach((zone, index) => {
                if(zone.length) {
                    let zoneName = conversion[index]
                    opponentMap[zoneName] = zone
                }
            })

            let opponentDatacronMap = getSquadsPerZone(mode, league)
            // eslint-disable-next-line
            let opponentIdToDatcron = opponent.datacron.reduce((map, obj) => (map[obj.id] = obj, map), {})
            gacBoard.awayDatacrons.forEach((zone, index) => {
                if(zone.length) {
                    let zoneName = conversion[index]
                    opponentDatacronMap[zoneName] = zone.map(id => opponentIdToDatcron[id] || [])
                }
            })

            let planDatacronMap = getSquadsPerZone(mode, league)

            let newGac = {
                player: {
                    allyCode: account.allyCode
                },
                opponent: {
                    allyCode: opponent.allyCode,
                    name: opponent.name
                },
                playerMap: playerMap,
                opponentMap: opponentMap,
                playerDatacronMap: playerDatacronMap,
                opponentDatacronMap: opponentDatacronMap,
                planDatacronMap: planDatacronMap,
                league: league,
                mode: mode,
                squadsPerZone: squadsPerZone[mode][league],
                battleLog: [],
                killMap: getKillMap(mode, league),
                planMap: getSquadsPerZone(mode, league)
            }
            let gacId = await saveGac(session, newGac, 'new', displayMessage, false)
            newGac._id = gacId
            setActiveGac(newGac)
            setActiveGacId(gacId)
            setOpponent(opponent)
            setStep(step+1)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error, false)
        }
        setLoaderVisible(false)
    }

    const startGAC = async () => {
        if(!validateForm(formData)) return
        if(!validateAllyCode(formData['allyCode'])) {
            let newFormError = defaultFormErrorObject
            newFormError['allyCode'] = {
                content: 'AllyCode must be in format XXXXXXXXX or XXX-XXX-XXX',
                pointing: 'below'
            }
            setFormError(newFormError)
            return
        }
        setLoaderMessage('Getting opponent data.')
        setLoaderVisible(true)
        let allyCode = formData['allyCode']
        let mode = formData['mode']
        let league = formData['league']

        let body = {
            payload: {
                allyCode: allyCode
            },
            session: session,
            refresh: true
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let opponent = await response.json()
            let playerMap = getSquadsPerZone(mode, league)
            let opponentMap = getSquadsPerZone(mode, league)
            let newGac = {
                player: {
                    allyCode: account.allyCode
                },
                opponent: {
                    allyCode: opponent.allyCode,
                    name: opponent.name
                },
                playerMap: playerMap,
                opponentMap: opponentMap,
                league: league,
                mode: mode,
                squadsPerZone: squadsPerZone[mode][league],
                battleLog: [],
                killMap: getKillMap(mode, league),
                planMap: getSquadsPerZone(mode, league),
                playerDatacronMap: getSquadsPerZone(mode, league),
                opponentDatacronMap: getSquadsPerZone(mode, league),
                planDatacronMap: getSquadsPerZone(mode, league)
            }
            let gacId = await saveGac(session, newGac, 'new', displayMessage, false)
            newGac._id = gacId
            setActiveGac(newGac)
            setActiveGacId(gacId)
            setOpponent(opponent)
            setStep(step+1)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error, false)
        }
        setLoaderVisible(false)
    }

    const getGAC = async (e, obj) => {
        setLoaderMessage('Getting opponent data.')
        setLoaderVisible(true)
        let id = e.target.id
        let gac = gacHistory.filter(gac => gac._id === id)[0]
        let body = {
            payload: {
                allyCode: gac.opponent.allyCode
            },
            session: session,
            refresh: true
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let opponent = await response.json()
            setOpponent(opponent)
            setStep(step+1)
            setActiveGac(gac)
            setActiveGacId(id)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error, false)
        }
        setLoaderVisible(false)
    }

    const displayGACList = () => {
        if(gacHistory === undefined) return ''
        return gacHistory
            .sort((a,b) => b.time - a.time)
            .map(gac => {
                return <List.Item key={gac._id}>
                    <List.Content as={'a'} onClick={getGAC}>
                        <b id={gac._id}>{`vs. ${gac.opponent.name} (${gac.mode}v${gac.mode})`}</b>
                    </List.Content>
                </List.Item>
            })
    }

    const getError = (fieldName) => {
        return Object.keys(formError[fieldName]).length === 0 ? false : formError[fieldName]
    }

	return <Grid columns={connection ? 5 : 4} centered stackable doubling celled='internally'>
            <Grid.Row>
            <Grid.Column>
                <Grid centered>
                    <Grid.Row>
                    <Header textAlign='center'>New GAC</Header>
                    </Grid.Row>
                    <Grid.Row>
                    <Form onSubmit={startGAC}>
                        <Form.Field
                            id={'allyCode'}
                            label={'Opponent AllyCode'}
                            control={Input}
                            required
                            placeholder={'Opponent AllyCode'}
                            onChange={updateFormData}
                            error={getError('allyCode')}
                        />
                        <Form.Field
                            id={'league'}
                            control={Dropdown}
                            label={'League'}
                            required={true}
                            placeholder={'League'}
                            selection
                            options={leagues}
                            onChange={updateFormData}
                            error={getError('league')}
                        />
                        <Form.Field
                            id={'mode'}
                            control={Dropdown}
                            label={'GAC Mode'}
                            required={true}
                            placeholder='Mode'
                            selection
                            options={modes}
                            onChange={updateFormData}
                            error={getError('mode')}
                        />
                        <Button primary type='submit'>Submit</Button>
                    </Form>
                    </Grid.Row>
                </Grid>
            </Grid.Column>
            {
                connection
                ?
                <Grid.Column>
                    <Grid centered>
                        <Grid.Row>
                        <Header textAlign='center'>Load GAC</Header>
                        </Grid.Row>
                        <Grid.Row>
                        <Button icon='game' color='green' content='Load GAC Board' onClick={onLoadGACButtonClick}/>
                        </Grid.Row>
                    </Grid>
                </Grid.Column>
                :
                ''
            }
            <Grid.Column textAlign='center'>
                <Grid centered>
                <Grid.Row>
                <Header textAlign='center'>Continue GAC</Header>
                </Grid.Row>
                <Grid.Row>
                <List animated>
                    {displayGACList()}
                </List>
                </Grid.Row>
                </Grid>
            </Grid.Column>
            </Grid.Row>
        </Grid>
}

export default GacInformation;