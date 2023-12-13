import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Grid, Icon, Modal } from 'semantic-ui-react';
import './Gac.css'
import GacDefense from './GacDefense';
import GacInformation from './GacInformation';
import GacOffense from './GacOffense';
import Steps from './Steps';
import GacBoard from './GacBoard';
import { saveGac } from '../../server/player';
// import { getGameConnectionCount } from '../../server/player';
import { getCurrentGACBoard } from '../../server/player';
import Datacron from '../profile/Datacron';
import Datacrons from '../profile/Datacrons';

function Gac ({account, units, setLoaderVisible, setLoaderMessage, session, categories, displayMessage, squads, gacHistory, activeGac, setActiveGac, activeGacId, setActiveGacId, opponent, setOpponent, setGacHistory, displayModal, datacrons, datacronNames, nicknames}){

    const [step, setStep] = useState(0)
    const [active, setActive] = useState('')
    const [showBackWall, setShowBackWall] = useState(true)
    const [connection, setConnection] = useState(false)
    const [datacronDetailsModalOpen, setDatacronDetailsModalOpen] = useState(false)
    const [modalDatacron, setModalDatacron] = useState({})

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

    const getGameConnection = useCallback(async () => {
        // let gameConnectionCount = await getGameConnectionCount(session, account.allyCode)
        setConnection(false)
        // setConnection(gameConnectionCount && gameConnectionCount.count > 0)
    }, [])// [session, account?.allyCode])

    useEffect(() => {
        getGameConnection()
    }, [getGameConnection])

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

    const getSquadsPerZone = () => {
        let zoneLengths = activeGac.squadsPerZone
        return {
            top: new Array(zoneLengths.top).fill([]),
            bottom: new Array(zoneLengths.bottom).fill([]),
            back: new Array(zoneLengths.back).fill([]),
            fleet: new Array(zoneLengths.fleet).fill([])
        }
    }

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

    const getPlayerDatacronsOnDefense = () => {

        if(!activeGac.playerDatacronMap) {
            activeGac.playerDatacronMap = getSquadsPerZone()
        }
        return [...activeGac.playerDatacronMap.top.flat(1), ...activeGac.playerDatacronMap.bottom.flat(1), ...activeGac.playerDatacronMap.back.flat(1), ...activeGac.playerDatacronMap.fleet.flat(1)]
    }

    const getOpponentDatacronsOnDefense = () => {

        if(!activeGac.opponentDatacronMap) {
            activeGac.opponentDatacronMap = getSquadsPerZone()
        }
        return [...activeGac.opponentDatacronMap.top.flat(1), ...activeGac.opponentDatacronMap.bottom.flat(1), ...activeGac.opponentDatacronMap.back.flat(1), ...activeGac.opponentDatacronMap.fleet.flat(1)]
    }

    const getDatacronsPlannedForOffense = () => {
        if(!activeGac.planDatacronMap) {
            activeGac.planDatacronMap = getSquadsPerZone()
        }
        return [...activeGac.planDatacronMap.top.flat(1), ...activeGac.planDatacronMap.bottom.flat(1), ...activeGac.planDatacronMap.back.flat(1), ...activeGac.planDatacronMap.fleet.flat(1)]
    }

    const getDatacronsUsedForOffense = () => {
        return activeGac.battleLog.map(elt => elt.attackDatacron)
    }

    const handleShowBackWallClick = () => {
        setShowBackWall(!showBackWall)
    }

    const handleRefreshGACBoardClick = () => {
        displayModal("This action will break your game connection.", true, updateGACBoard)
    }

    const updateGACBoard = async () => {
        setLoaderMessage('Getting GAC Board from HotUtils.')
        setLoaderVisible(true)
        let gacBoard = await getCurrentGACBoard(session, account.allyCode)

        let newActiveGac = JSON.parse(JSON.stringify(activeGac))
        let conversion = ['top', 'bottom', 'fleet', 'back']
        gacBoard.home.forEach((zone, index) => {
            let zoneName = conversion[index]
            newActiveGac.playerMap[zoneName] = zone
        })
        // eslint-disable-next-line
        let playerIdToDatcron = account.datacron.reduce((map, obj) => (map[obj.id] = obj, map), {})
        gacBoard.homeDatacrons.forEach((zone, index) => {
            if(zone.length) {
                let zoneName = conversion[index]
                newActiveGac.playerDatacronMap[zoneName] = zone.map(id => playerIdToDatcron[id] || [])
            }
        })
        gacBoard.away.forEach((zone, index) => {
            let zoneName = conversion[index]
            newActiveGac.opponentMap[zoneName] = zone
        })
        // eslint-disable-next-line
        let opponentIdToDatcron = opponent.datacron.reduce((map, obj) => (map[obj.id] = obj, map), {})
        gacBoard.awayDatacrons.forEach((zone, index) => {
            if(zone.length) {
                let zoneName = conversion[index]
                newActiveGac.opponentDatacronMap[zoneName] = zone.map(id => opponentIdToDatcron[id] || [])
            }
        })

        setActiveGac(newActiveGac)
        setLoaderVisible(false)

    }

    const addDatacronToSquad = (datacron) => {
        console.log(datacron)
        if(active) {
            let isOffense = step === 2
            let array = active.split(':')
            let isSelf = array[0] === 'player'
            let zone = array[1]
            let squadNumber = Number(array[2])
            if(zone === 'fleet') return

            let newActiveGac = JSON.parse(JSON.stringify(activeGac))
            if(isOffense) {
                newActiveGac.planDatacronMap[zone][squadNumber] = datacron
            } else if(isSelf) {
                newActiveGac.playerDatacronMap[zone][squadNumber] = datacron
            } else {
                newActiveGac.opponentDatacronMap[zone][squadNumber] = datacron
            }
            setActiveGac(newActiveGac)
        }
    }

    const removeDatacronFromSquad = () => {
        if(active) {
            let array = active.split(':')
            let isSelf = array[0] === 'player'
            let isOffense = step === 2
            let zone = array[1]
            let squadNumber = Number(array[2])
            if(zone === 'fleet') return

            let newActiveGac = JSON.parse(JSON.stringify(activeGac))
            if(isOffense) {
                newActiveGac.planDatacronMap[zone][squadNumber] = []
            } else if(isSelf) {
                newActiveGac.playerDatacronMap[zone][squadNumber] = []
            } else {
                newActiveGac.opponentDatacronMap[zone][squadNumber] = []
            }
            setActiveGac(newActiveGac)
        }
    }

    const getDatacronsMenu = () => {
        if(active) {
            let array = active.split(':')
            let isSelf = array[0] === 'player'
            let isOffense = step === 2
            let gameAccount = isSelf || isOffense ? account : opponent
    
            return <Datacrons datacrons={datacrons} account={gameAccount} exclude={getUsedDatacrons()} clickOnDatacron={addDatacronToSquad} datacronNames={datacronNames}/>
        }
    }

    const getCurrentSquadDatacron = (simple=true, planned=false) => {
        if(active) {
            let array = active.split(':')
            let isSelf = array[0] === 'player'
            let zone = array[1]
            let squadNumber = Number(array[2])
            let datacron
            if(planned) {
                if(!activeGac.planDatacronMap) {
                    activeGac.planDatacronMap = getSquadsPerZone()
                }
                datacron = activeGac.planDatacronMap[zone][squadNumber]
            } else if(isSelf) {
                if(!activeGac.playerDatacronMap) {
                    activeGac.playerDatacronMap = getSquadsPerZone()
                }
                datacron = activeGac.playerDatacronMap[zone][squadNumber]
            } else {
                if(!activeGac.opponentDatacronMap) {
                    activeGac.opponentDatacronMap = getSquadsPerZone()
                }
                datacron = activeGac.opponentDatacronMap[zone][squadNumber]
            }
            return <Datacron datacron={datacron} datacrons={datacrons} onClick={() => {setModalDatacron(datacron);setDatacronDetailsModalOpen(true)}} simple={simple}/>
        }
    }

    const getUsedDatacrons = () => {
        if(active) {
            let array = active.split(':')
            let isSelf = array[0] === 'player'
            let isOffense = step === 2
            let placements = isSelf || isOffense ? getPlayerDatacronsOnDefense() : getOpponentDatacronsOnDefense()
            let planned = isSelf || isOffense ? getDatacronsPlannedForOffense() : []
            let used = isSelf || isOffense ? getDatacronsUsedForOffense() : []

            return [...placements, ...planned, ...used]
        }
    }

    const datacronDetailsModal = () => {
        return <Modal
        onClose={() => setDatacronDetailsModalOpen(false)}
        onOpen={() => setDatacronDetailsModalOpen(true)}
        open={datacronDetailsModalOpen}
      >
        <Modal.Header>Datacron Details</Modal.Header>
        <Modal.Content>
            <Datacron datacron={modalDatacron} datacrons={datacrons} simple={false} />
        </Modal.Content>
        <Modal.Actions>
          <Button 
            content='Remove from Squad'
            onClick={() => {
                removeDatacronFromSquad()
                setDatacronDetailsModalOpen(false)
            }}
            negative
            />
          <Button
            content="Close"
            onClick={() => setDatacronDetailsModalOpen(false)}
            color='black'
          />
        </Modal.Actions>
      </Modal>
    }

	return <Grid>
        {datacronDetailsModal()}
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
                {
                    connection
                    ?
                    <Button icon='refresh' content='Refresh Board' color='orange' disabled={step === 0} floated='right' onClick={handleRefreshGACBoardClick}/>
                    :
                    ''
                }
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
            <GacInformation setStep={setStep} step={step} setOpponent={setOpponent} setLoaderVisible={setLoaderVisible} setLoaderMessage={setLoaderMessage} session={session} displayMessage={displayMessage} gacHistory={gacHistory} setActiveGac={setActiveGac} setActiveGacId={setActiveGacId} account={account} setGacHistory={setGacHistory} connection={connection} displayModal={displayModal}/>
            :
            step === 1
            ?
            <GacDefense account={account} opponent={opponent} active={active} units={units} getMaxSquadSize={getMaxSquadSize} categories={categories} getToonsInBattleLog={getToonsInBattleLog} squads={squads} session={session} getToonsInPlayerDefense={getToonsInPlayerDefense} getToonsInOpponentDefense={getToonsInOpponentDefense} getToonsInPlanMap={getToonsInPlanMap} activeGac={activeGac} setActiveGac={setActiveGac} getCurrentSquadDatacron={getCurrentSquadDatacron} getDatacronsMenu={getDatacronsMenu} nicknames={nicknames}/>
            :
            <GacOffense account={account} opponent={opponent} active={active} setActive={setActive} getMaxSquadSize={getMaxSquadSize} categories={categories} units={units} getToonsInBattleLog={getToonsInBattleLog} getToonsInPlayerDefense={getToonsInPlayerDefense} getToonsInPlanMap={getToonsInPlanMap} squads={squads} session={session} activeGac={activeGac} setActiveGac={setActiveGac} getCurrentSquadDatacron={getCurrentSquadDatacron} getDatacronsMenu={getDatacronsMenu} datacrons={datacrons} nicknames={nicknames}/>
        }
        </Grid.Row>
	</Grid>
}

export default Gac;
