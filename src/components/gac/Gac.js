import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Grid, Icon } from 'semantic-ui-react';
import { getSquads } from '../../server/squads';
import './Gac.css'
import GacDefense from './GacDefense';
import GacInformation from './GacInformation';
import GacOffense from './GacOffense';
import Steps from './Steps';
import GacBoard from './GacBoard';

function Gac ({account, units, images, setLoaderVisible, setLoaderMessage, session, skills, categories, displayMessage}){

    const [league, setLeague] = useState('')
    const [opponent, setOpponent] = useState({})
    const [playerMap, setPlayerMap] = useState({})
    const [opponentMap, setOpponentMap] = useState({})
    const [step, setStep] = useState(0)
    const [mode, setMode] = useState(0)
    const [active, setActive] = useState('')
    const [id, setId] = useState('new')
    const [battleLog, setBattleLog] = useState([])
    const [killMap, setKillMap] = useState({})
    const [squads, setSquads] = useState([])
    const [planMap, setPlanMap] = useState({})
    const [showBackWall, setShowBackWall] = useState(false)

    const steps = [
        {title: 'Information', description: 'Pick settings and opponent.'},
        {title: 'Defense', description: 'Place yours and opponent\'s defense.'},
        {title: 'Offense', description: 'Plan and report your attacks.'}
    ]

	useEffect(() => {
		// props.redirect('home')
        getSquads(session, account, setSquads)
	}, [account, session])

    const getMaxSquadSize = (zone=null) => {
        if(active !== '') {
            let array = active.split(':')
            let isFleet = (zone || array[1]) === 'fleet'
            return isFleet ? 8 : mode
        }
        return -1
    }

    const changeStep = (newStep) => {
        setActive('')
        setStep(newStep)

    }

    const prev = () => {
        changeStep(step-1)
    }

    const next = () => {
        changeStep(step+1)
    }

    const saveGAC = useCallback(async () => {
        if(Object.keys(opponent).length === 0) return

        let body = {
            session: session,
            id: id === 'new' ? null : id,
            gac: {
                time: Date.now(),
                player: {
                    allyCode: account.allyCode
                },
                opponent: {
                    allyCode: opponent.allyCode,
                    name: opponent.name
                },
                playerMap: playerMap,
                opponentMap: opponentMap,
                mode: mode,
                league: league,
                battleLog: battleLog,
                killMap: killMap,
                planMap: planMap
            }
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/gac/add`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let gac = await response.json()
            setId(gac._id)
            displayMessage('Successfully saved GAC data.', true)
        } else {
            let error = await response.text()
            console.log(error)
            displayMessage('Unable to save GAC data.', false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        saveGAC()
    }, [saveGAC, battleLog, step])

    const getToonsInPlayerDefense = () => {
        return [...playerMap.top.flat(1), ...playerMap.bottom.flat(1), ...playerMap.back.flat(1), ...playerMap.fleet.flat(1)]
    }

    const getToonsInOpponentDefense = () => {
        return [...opponentMap.top.flat(1), ...opponentMap.bottom.flat(1), ...opponentMap.back.flat(1), ...opponentMap.fleet.flat(1)]
    }

    const getToonsInPlanMap = () => {
        return [...planMap.top.flat(1), ...planMap.bottom.flat(1), ...planMap.back.flat(1), ...planMap.fleet.flat(1)]
    }

    const getToonsInBattleLog = () => {
        return battleLog.map(log => log.attackTeam).flat(1)
    }

    const handleShowBackWallClick = () => {
        setShowBackWall(!showBackWall)
    }

	return <Grid>
        <Grid.Row columns={2}>
            <Grid.Column>
                <Form>
                    <Form.Checkbox
                    label={'Show back wall'}
                    checked={showBackWall}
                    onClick={handleShowBackWallClick}
                    />
                </Form>
            </Grid.Column>
            <Grid.Column floated='right'>
                <Button disabled={step === 0} color='green' floated='right' onClick={saveGAC}><Icon name='save'></Icon>Save</Button>
            </Grid.Column>
        </Grid.Row>
        
        <Grid.Row>
        <Steps step={step} steps={steps} changeStep={changeStep}/>
        </Grid.Row>
        
        {
            step > 0
            ?
            <Grid.Row>
                <Grid.Column floated='left' computer={2} tablet={4} mobile={8}>
                    <Button onClick={prev} floated='left'>
                        Go Back
                    </Button>
                </Grid.Column>
                <Grid.Column floated='right' computer={2} tablet={4} mobile={8}>
                    <Button disabled={step === 2} onClick={next} floated='right'>
                        Continue
                    </Button>
                </Grid.Column>

            </Grid.Row>
            :
            ''
        }
        {
            step > 0
            ?
            <Grid.Row>
                <GacBoard step={step} playerMap={playerMap} opponentMap={opponentMap} images={images} account={account} opponent={opponent} active={active} setActive={setActive} killMap={killMap} planMap={planMap} showBackWall={showBackWall} units={units}/>
            </Grid.Row>
            :
            ''
        }
        <Grid.Row>
        {
            step === 0
            ?
            <GacInformation allyCode={account.allyCode} setStep={setStep} step={step} setLeague={setLeague} setOpponent={setOpponent} setMode={setMode} setLoaderVisible={setLoaderVisible} setLoaderMessage={setLoaderMessage} session={session} setPlayerMap={setPlayerMap} setOpponentMap={setOpponentMap} setId={setId} setKillMap={setKillMap} setBattleLog={setBattleLog} setPlanMap={setPlanMap}/>
            :
            step === 1
            ?
            <GacDefense account={account} opponent={opponent} playerMap={playerMap} opponentMap={opponentMap} images={images} active={active} units={units} skills={skills} setPlayerMap={setPlayerMap} getMaxSquadSize={getMaxSquadSize} setOpponentMap={setOpponentMap} categories={categories} getToonsInBattleLog={getToonsInBattleLog} mode={mode} squads={squads} setSquads={setSquads} session={session} getToonsInPlayerDefense={getToonsInPlayerDefense} getToonsInOpponentDefense={getToonsInOpponentDefense} getToonsInPlanMap={getToonsInPlanMap}/>
            :
            <GacOffense account={account} opponent={opponent} opponentMap={opponentMap} images={images} active={active} setActive={setActive} getMaxSquadSize={getMaxSquadSize} categories={categories} battleLog={battleLog} setBattleLog={setBattleLog} skills={skills} units={units} killMap={killMap} setKillMap={setKillMap} getToonsInBattleLog={getToonsInBattleLog} planMap={planMap} setPlanMap={setPlanMap} getToonsInPlayerDefense={getToonsInPlayerDefense} getToonsInPlanMap={getToonsInPlanMap} squads={squads} mode={mode} session={session} setSquads={setSquads}/>
        }
        </Grid.Row>
	</Grid>
}

export default Gac;
