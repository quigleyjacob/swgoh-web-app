// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Dropdown, Form, Grid, Input, Header, List, Icon } from 'semantic-ui-react';
import { validateAllyCode } from '../../utils';
import { getGacs, getCurrentGACBoard, createGac, getGac, deleteGac } from '../../server/gac';
import { squadsPerZone } from '../../utils/constants';
import { generateSquadId } from '../../utils/gac';

function GacInformation ({loggedInAllyCode, setStep, step, setOpponent, setLoaderVisible, setLoaderMessage, session, displayMessage, gacHistory, setGacHistory, setActiveGac, setActiveGacId, account, authStatus, displayModal}){

    const getGacHistoryCallback = useCallback(async () => {
        if(loggedInAllyCode !== account?.allyCode) {
            return
        }
        getGacs(session, account.allyCode, displayMessage, setGacHistory)
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
        displayModal(message, true, loadGameGac)
    }

    const displayLoadGACInstructionModal = async () => {
        let message = <span>
            <div>
                In order to use this feature, please join the <a href='https://discord.gg/gm7zPwSFJD' target='_blank' rel="noreferrer">Quigbot Discord Server</a> (or any Discord server with Mhanndalorian Bot invited).
            </div>
            <br/>
            <div>
                From here, you will need to perform the following slash commands <strong>using Mhanndalorian Bot</strong>:
            </div>
            <ol>
                <li>Make sure you are registered with the bot using <strong>/identify</strong>.</li>
                <li>Create an authenticated connection using <strong>/eaconnect</strong>.</li>
                <li>Authorize QuigBot to use this connection with <strong>/authconsent</strong>.</li>
                <li>Once this is all done, just refresh this page.</li>
            </ol>
            <div>
                And you should be all set!
            </div>
        </span>
        displayModal(message, true, () => {}, false)
    }

    const loadGameGac = async () => {
        setLoaderMessage('Getting current GAC board.')
        setLoaderVisible(true)
        let gacBoard = await getCurrentGACBoard(session, loggedInAllyCode, displayMessage)
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
            refresh: true
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', session},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let opponent = await response.json()
            setOpponent(opponent)

            gacBoard.player = {allyCode: loggedInAllyCode}
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
            createGac(session, loggedInAllyCode, gacBoard, displayMessage, gacHistory, setGacHistory, setActiveGac, setActiveGacId, step, setStep)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error, false)
        }
        setLoaderVisible(false)
    }

    const startNewGac = async () => {
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
            refresh: true
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', session},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let opponent = await response.json()
            setOpponent(opponent)

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
            createGac(session, loggedInAllyCode, newGac, displayMessage, gacHistory, setGacHistory, setActiveGac, setActiveGacId, step, setStep)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error, false)
        }
        setLoaderVisible(false)
    }

    const continueGac = async (e) => {
        setLoaderMessage('Getting opponent data.')
        setLoaderVisible(true)
        let id = e.target.id
        let gac = gacHistory.find(gac => gac._id === id)
        let body = {
            payload: {
                allyCode: gac.opponent.allyCode
            },
            refresh: true
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', session},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let opponent = await response.json()
            setOpponent(opponent)
            getGac(id, session, loggedInAllyCode, displayMessage, setActiveGac, setActiveGacId, step, setStep)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage(error, false)
        }
        setLoaderVisible(false)
    }

    const handleOpenGacClick = (e) => {
        displayModal('Open GAC. It will take a moment to load your opponent\'s roster.', true, () => continueGac(e))
    }

    const handleDeleteGacClick = (e) => {
        let id = e.target.id
        let action = () => deleteGac(id, session, loggedInAllyCode, displayMessage, gacHistory, setGacHistory)
        displayModal('Delete GAC. This action cannot be undone', true, action)
    }

    const displayGACList = () => {
        if(gacHistory === undefined) return ''
        return gacHistory
            .sort((a,b) => b.time - a.time)
            .map(gac => {
                return <List.Item key={gac._id}>
                    <List.Content floated='left' as={'a'} onClick={handleOpenGacClick}>
                        <b id={gac._id}>{`vs. ${gac.opponent.name} (${gac.mode}v${gac.mode})`}</b>
                    </List.Content>
                    <List.Content floated='right' onClick={handleDeleteGacClick}>
                        <Icon link name='trash alternate' id={gac._id}/>
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
                    <Form onSubmit={startNewGac}>
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

            <Grid.Column>
                <Grid centered>
                    <Grid.Row>
                    <Header textAlign='center'>Load GAC</Header><Icon className='info circle' link onClick={displayLoadGACInstructionModal}/>
                    </Grid.Row>
                    <Grid.Row>
                    <Button icon='game' color='green' content='Load GAC Board' disabled={!authStatus} onClick={onLoadGACButtonClick}/>
                    </Grid.Row>
                </Grid>
            </Grid.Column>

            <Grid.Column textAlign='center'>
                <Grid centered>
                <Grid.Row>
                <Header textAlign='center'>Continue GAC</Header>
                </Grid.Row>
                <Grid.Row>
                <List divided>
                    {displayGACList()}
                </List>
                </Grid.Row>
                </Grid>
            </Grid.Column>
            </Grid.Row>
        </Grid>
}

export default GacInformation;