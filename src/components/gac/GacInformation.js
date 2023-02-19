// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Form, Grid, Input, Header, List } from 'semantic-ui-react';

function GacInformation ({allyCode, setStep, step, setLeague, setOpponent, setMode, setLoaderVisible, setLoaderMessage, session, setPlayerMap, setOpponentMap, setId, setKillMap, setBattleLog}){

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
            top: new Array(zoneLengths.bottom).fill([]),
            bottom: new Array(zoneLengths.bottom).fill([]),
            back: new Array(zoneLengths.back).fill([]),
            fleet: new Array(zoneLengths.fleet).fill([])
        }
    }

    const getKillMap = (mode, league) => {
        let zoneLengths = squadsPerZone[mode][league]
        return {
            top: new Array(zoneLengths.bottom).fill(new Array(mode).fill(false)),
            bottom: new Array(zoneLengths.bottom).fill(new Array(mode).fill(false)),
            back: new Array(zoneLengths.back).fill(new Array(mode).fill(false)),
            fleet: new Array(zoneLengths.fleet).fill(new Array(8).fill(false))
        }
    }

    const [formData, setFormData] = useState({})
    const [allGACList, setAllGACList] = useState([])

    const updateFormData = (e, obj) => {
        let id = obj.id
        let newValue = obj.value
        let data = JSON.parse(JSON.stringify(formData))
        data[id] = newValue
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

    const startGAC = async () => {
        setLoaderMessage('Getting opponent data.')
        setLoaderVisible(true)
        let body = {
            payload: {
                allyCode: formData['allyCode']
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
            let mode = formData['mode']
            let league = formData['league']
            setOpponent(opponent)
            setPlayerMap(getSquadsPerZone(mode, league))
            setOpponentMap(getSquadsPerZone(mode, league))
            setLeague(league)
            setMode(mode)
            setKillMap(getKillMap(mode, league))
            setStep(step+1)
        } else {
            let error = await response.text()
            console.log(error)
        }
        setLoaderVisible(false)
    }

    const getGAC = async (e, obj) => {
        setLoaderMessage('Getting opponent data.')
        setLoaderVisible(true)
        let id = e.target.id
            let gac = allGACList.filter(gac => gac._id === id)[0]
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
            setPlayerMap(gac.playerMap)
            setOpponentMap(gac.opponentMap)
            setLeague(gac.league)
            setMode(gac.mode)
            setId(gac._id)
            setKillMap(gac.killMap)
            console.log(gac.battleLog)
            setBattleLog(gac.battleLog)
            setStep(step+1)
        } else {
            let error = await response.text()
            console.log(error)
        }
        setLoaderVisible(false)
    }

    const displayGACList = () => {
        return allGACList
            .sort((a,b) => b.time - a.time)
            .map(gac => {
                return <List.Item key={gac._id}>
                    <List.Content as={'a'} onClick={getGAC}>
                        <b id={gac._id}>{`vs. ${gac.opponent.name}`}</b>
                    </List.Content>
                </List.Item>
            })
    }

    useEffect(() => {
        (async () => {
            if(session) {
                let body = {
                    session: session,
                    allyCode: allyCode
                }
                let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/gac`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                })
                if(response.ok) {
                    let gacList = await response.json()
                    setAllGACList(gacList)
                } else {
                    let error = await response.text()
                    console.log(error)
                }
            }
        })()
    }, [allyCode, session])

	return <div>
        <Grid columns={4}>
            <Grid.Column></Grid.Column>
            <Grid.Column>
                <Header textAlign='center'>New GAC</Header>
                <Form onSubmit={startGAC}>
                    <Form.Field>
                        <label>Opponent AllyCode</label>
                        <Input id='allyCode' required placeholder='allyCode' onChange={updateFormData}/>
                    </Form.Field>
                    <Form.Field>
                        <label>League</label>
                        <Dropdown id='league' required placeholder='league' selection options={leagues} onChange={updateFormData}/>
                    </Form.Field>
                    <Form.Field>
                        <label>GAC Mode</label>
                        <Dropdown id='mode' required placeholder='mode' selection options={modes} onChange={updateFormData}/>
                    </Form.Field>
                    <Button type='submit'>Submit</Button>
                </Form>
            </Grid.Column>
            <Grid.Column>
                <Header textAlign='center'>Continue GAC</Header>
                <List animated>
                    {displayGACList()}
                </List>
            </Grid.Column>
            <Grid.Column></Grid.Column>
        </Grid>
	</div>
}

export default GacInformation;