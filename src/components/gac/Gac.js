import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Grid, Icon } from 'semantic-ui-react';
import './Gac.css'
import GacDefense from './GacDefense';
import GacInformation from './GacInformation';
import GacOffense from './GacOffense';
import Steps from './Steps';
import GacBoard from './GacBoard';
import { saveGac } from '../../server/player';

function Gac ({account, units, setLoaderVisible, setLoaderMessage, session, categories, displayMessage, squads, gacHistory, activeGac, setActiveGac, activeGacId, setActiveGacId, opponent, setOpponent, setGacHistory}){

    const [step, setStep] = useState(0)
    const [active, setActive] = useState('')
    const [showBackWall, setShowBackWall] = useState(false)

    const steps = [
        {title: 'Information', description: 'Pick settings and opponent.'},
        {title: 'Defense', description: 'Place yours and opponent\'s defense.'},
        {title: 'Offense', description: 'Plan and report your attacks.'}
    ]

    const getMaxSquadSize = (zone=null) => {
        if(active !== '') {
            let array = active.split(':')
            let isFleet = (zone || array[1]) === 'fleet'
            return isFleet ? 8 : activeGac.mode
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

    const saveGacCallback = useCallback(async () => {
        saveGac(session, activeGac, activeGacId, displayMessage, false)
    }, [displayMessage, session, activeGac, activeGacId])

    useEffect(() => {
        setStep(activeGacId === '' ? 0 : 1)
        if(activeGacId !== '') {
            saveGacCallback()
        }
        // eslint-disable-next-line
    }, [])

    const getToonsInPlayerDefense = () => {
        return [...activeGac.playerMap.top.flat(1), ...activeGac.playerMap.bottom.flat(1), ...activeGac.playerMap.back.flat(1), ...activeGac.playerMap.fleet.flat(1)]
    }

    const getToonsInOpponentDefense = () => {
        return [...activeGac.opponentMap.top.flat(1), ...activeGac.opponentMap.bottom.flat(1), ...activeGac.opponentMap.back.flat(1), ...activeGac.opponentMap.fleet.flat(1)]
    }

    const getToonsInPlanMap = () => {
        return [...activeGac.planMap.top.flat(1), ...activeGac.planMap.bottom.flat(1), ...activeGac.planMap.back.flat(1), ...activeGac.planMap.fleet.flat(1)]
    }

    const getToonsInBattleLog = () => {
        return activeGac.battleLog.map(log => log.attackTeam).flat(1)
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
                <Button disabled={step === 0} color='green' floated='right' onClick={() => saveGac(session, activeGac, activeGacId, displayMessage, true)}><Icon name='save'></Icon>Save</Button>
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
                <GacBoard step={step} account={account} opponent={opponent} active={active} setActive={setActive} showBackWall={showBackWall} units={units} activeGac={activeGac}/>
            </Grid.Row>
            :
            ''
        }
        <Grid.Row>
        {
            step === 0
            ?
            <GacInformation setStep={setStep} step={step} setOpponent={setOpponent} setLoaderVisible={setLoaderVisible} setLoaderMessage={setLoaderMessage} session={session} displayMessage={displayMessage} gacHistory={gacHistory} setActiveGac={setActiveGac} setActiveGacId={setActiveGacId} account={account} setGacHistory={setGacHistory}/>
            :
            step === 1
            ?
            <GacDefense account={account} opponent={opponent} active={active} units={units} getMaxSquadSize={getMaxSquadSize} categories={categories} getToonsInBattleLog={getToonsInBattleLog} squads={squads} session={session} getToonsInPlayerDefense={getToonsInPlayerDefense} getToonsInOpponentDefense={getToonsInOpponentDefense} getToonsInPlanMap={getToonsInPlanMap} activeGac={activeGac} setActiveGac={setActiveGac}/>
            :
            <GacOffense account={account} opponent={opponent} active={active} setActive={setActive} getMaxSquadSize={getMaxSquadSize} categories={categories} units={units} getToonsInBattleLog={getToonsInBattleLog} getToonsInPlayerDefense={getToonsInPlayerDefense} getToonsInPlanMap={getToonsInPlanMap} squads={squads} session={session} activeGac={activeGac} setActiveGac={setActiveGac}/>
        }
        </Grid.Row>
	</Grid>
}

export default Gac;
