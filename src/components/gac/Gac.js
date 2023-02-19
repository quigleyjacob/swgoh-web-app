// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import './Gac.css'
import GacDefense from './GacDefense';
import GacInformation from './GacInformation';
import GacOffense from './GacOffense';
import Steps from './Steps';

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

    const steps = [
        {title: 'Information', description: 'Pick settings and opponent.'},
        {title: 'Defense', description: 'Place your\'s and opponent\'s defense.'},
        {title: 'Offense', description: 'Plan and report your attacks.'}
    ]

	useEffect(() => {
		// props.redirect('home')
	}, [])

    const getMaxSquadSize = (zone=null) => {
        if(active !== '') {
            let array = active.split(':')
            let isFleet = (zone || array[1]) === 'fleet'
            return isFleet ? 8 : mode
        }
        return -1
    }

    const prev = () => {
        setActive('')
        setStep(step-1)
    }

    const next = () => {
        setActive('')
        setStep(step+1)
    }

    const saveGAC = async () => {
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
                killMap: killMap
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
    }

    const getToonsInBattleLog = () => {
        return battleLog.map(log => log.attackTeam).flat(1)
    }

	return <div>
        <Button disabled={step === 0} color='green' floated='right' onClick={saveGAC}><Icon name='save'></Icon>Save</Button>
        <br></br>
        <Steps step={step} steps={steps}/>
        <br></br>
        {
            step > 0
            ?
            <div>
            <Button floated='left' onClick={prev}>
                Go Back
            </Button>
            <Button disabled={step === 2} floated='right' onClick={next}>
                Continue
            </Button>
            </div>
            :
            ''
        }
        <br></br>
        {
            step === 0
            ?
            <GacInformation allyCode={account.allyCode} setStep={setStep} step={step} setLeague={setLeague} setOpponent={setOpponent} setMode={setMode} setLoaderVisible={setLoaderVisible} setLoaderMessage={setLoaderMessage} session={session} setPlayerMap={setPlayerMap} setOpponentMap={setOpponentMap} setId={setId} setKillMap={setKillMap} setBattleLog={setBattleLog}/>
            :
            step === 1
            ?
            <GacDefense account={account} opponent={opponent} playerMap={playerMap} opponentMap={opponentMap} images={images} active={active} setActive={setActive} units={units} skills={skills} setPlayerMap={setPlayerMap} getMaxSquadSize={getMaxSquadSize} setOpponentMap={setOpponentMap} categories={categories} step={step} killMap={killMap} getToonsInBattleLog={getToonsInBattleLog}/>
            :
            <GacOffense account={account} opponent={opponent} playerMap={playerMap} opponentMap={opponentMap} images={images} active={active} setActive={setActive} getMaxSquadSize={getMaxSquadSize} categories={categories} step={step} battleLog={battleLog} setBattleLog={setBattleLog} skills={skills} units={units} killMap={killMap} setKillMap={setKillMap} getToonsInBattleLog={getToonsInBattleLog} saveGAC={saveGAC}/>
        }
	</div>
}

export default Gac;
