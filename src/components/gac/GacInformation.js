// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Dropdown, Form, Grid, Input, Header, List } from 'semantic-ui-react';
import { validateAllyCode } from '../../utils';
import { saveGac } from '../../server/player';
import { getPlayerGACHistory, getCurrentGACBoard } from '../../server/player';
import { squadsPerZone } from '../../utils/constants';

function GacInformation ({loggedInAllyCode, setStep, step, setOpponent, setLoaderVisible, setLoaderMessage, session, displayMessage, gacHistory, setGacHistory, setActiveGac, setActiveGacId, account, authStatus, displayModal, generateSquadId}){

    const getGacHistoryCallback = useCallback(async () => {
        if(loggedInAllyCode !== account?.allyCode) {
            return
        }
        getPlayerGACHistory(session, account.allyCode, displayMessage, setGacHistory)
      }, [account?.allyCode, session, displayMessage, setGacHistory, loggedInAllyCode])

    useEffect(() => {
        getGacHistoryCallback()
    }, [getGacHistoryCallback])

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
        {value: 'KYBER', text: 'Kyber', image: '/tex.league_icon_kyber.png'},
        {value: 'AURODIUM', text: 'Aurodium', image: '/tex.league_icon_aurodium.png'},
        {value: 'CHROMIUM', text: 'Chromium', image: '/tex.league_icon_chromium.png'},
        {value: 'BRONZIUM', text: 'Bronzium', image: '/tex.league_icon_bronzium.png'},
        {value: 'CARBONITE', text: 'Carbonite', image: '/tex.league_icon_carbonite.png'}
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
        let gacBoard = await getCurrentGACBoard(session, account.allyCode, displayMessage)
        if(Object.keys(gacBoard).length === 0) {
            setLoaderVisible(false)
            return
        }
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

            gacBoard.player = {allyCode: account.allyCode}
            gacBoard.opponent.name = opponent.name
            gacBoard.planStatus = {}
            gacBoard.battleLog = []

            // set isAlive status of all toons in opponent roster
            gacBoard.zones.forEach(zoneId => {
                let numSquads = squadsPerZone[mode][league][zoneId]
                let array = Array.from({ length: numSquads }, (_, i) => i)
                array.forEach(index => {
                    let squadId = generateSquadId(zoneId, index)

                    if(gacBoard.awayStatus[squadId]) {
                        let squadData = gacBoard.awayStatus[squadId]
                        squadData.squad.forEach(unit => {
                            unit.isAlive = true
                        })
                    }
                })
            })

            let gacId = await saveGac(session, gacBoard, 'new', displayMessage, false)
            gacBoard._id = gacId
            setActiveGac(gacBoard)
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

            let newGac = {
                player: {
                    allyCode: account.allyCode
                },
                opponent: {
                    allyCode: opponent.allyCode,
                    name: opponent.name
                },
                league: league,
                mode: mode,
                homeStatus: {},
                awayStatus: {},
                planStatus: {},
                battleLog: []
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
            setActiveGacId(id)
            if(!Object.keys(gac).includes('homeStatus')) {
                let newVersionGac = upgradeGacData(gac)
                setActiveGac(newVersionGac)
            } else {
                setActiveGac(gac)
            }
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error, false)
        }
        setLoaderVisible(false)
    }

    const upgradeGacData = (gac) => {
        let oldZones = ['top', 'bottom', 'back', 'fleet']
        let newZones = [ '4zone_phase01_conflict01', '4zone_phase01_conflict02', '4zone_phase02_conflict02', '4zone_phase02_conflict01']

        let mode = gac.mode
        let league = gac.league
        let player = gac.player
        let opponent = gac.opponent
        let time = gac.time
        let _id = gac._id
        let battleLog = gac.battleLog

        let homeStatus = {}
        let awayStatus = {}
        let planStatus = {}

        for(const [index, oldZoneId] of oldZones.entries()) {
            let newZoneId = newZones[index]
            let numSquads = squadsPerZone[mode][league][newZoneId]
            let array = Array.from({ length: numSquads }, (_, i) => i)
            for(const index of array) {
                let squadId = generateSquadId(newZoneId, index)

                // set home status
                let homeSquad = gac.playerMap[oldZoneId][index].map(baseId => {
                    return { baseId }
                })
                let homeDatacron = gac.playerDatacronMap[oldZoneId][index].id
                homeStatus[squadId] = {squad: homeSquad, datacron: homeDatacron}

                // set away status
                let awaySquad = gac.opponentMap[oldZoneId][index].map((baseId, unitIndex) => {
                    let isAlive = !gac.killMap[oldZoneId][index][unitIndex]
                    return { baseId, isAlive }
                })
                let awayDatacron = gac.opponentDatacronMap[oldZoneId][index].id
                awayStatus[squadId] = {squad: awaySquad, datacron: awayDatacron}

                // set plan status
                let planSquad = gac.planMap[oldZoneId][index].map(baseId => {
                    return { baseId }
                })
                let planDatacron = gac.planDatacronMap[oldZoneId][index].id
                planStatus[squadId] = {squad: planSquad, datacron: planDatacron}
            }
        }

        return {
            _id,
            player,
            opponent,
            mode,
            league,
            battleLog,
            homeStatus,
            awayStatus,
            planStatus,
            time
        }

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

	return <Grid columns={authStatus ? 5 : 4} centered stackable doubling celled='internally'>
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
                authStatus
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