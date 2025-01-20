import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Grid, Icon, Modal } from 'semantic-ui-react';
import './Gac.css'
import GacDefense from './GacDefense';
import GacInformation from './GacInformation';
import GacOffense from './GacOffense';
import Steps from './Steps';
import GacBoard from './GacBoard';
import { saveGac } from '../../server/player';
import { getAuthStatus } from '../../server/player';
import { getCurrentGACBoard } from '../../server/player';
import Datacron from '../profile/Datacron';
import Datacrons from '../profile/Datacrons';
import SquadsList from '../profile/SquadsList';

function Gac ({loggedInAllyCode, account, units, setLoaderVisible, setLoaderMessage, session, categories, displayMessage, squads, gacHistory, activeGac, setActiveGac, activeGacId, setActiveGacId, opponent, setOpponent, setGacHistory, displayModal, datacrons, datacronNames, nicknames}){

    const [step, setStep] = useState(0)
    const [active, setActive] = useState('')
    const [showBackWall, setShowBackWall] = useState(true)
    const [datacronDetailsModalOpen, setDatacronDetailsModalOpen] = useState(false)
    const [modalDatacron, setModalDatacron] = useState({})
    const [authStatus, setAuthStatus] = useState(false)

    const steps = [
        {title: 'Information', description: 'Pick settings and opponent.'},
        {title: 'Defense', description: 'Place yours and opponent\'s defense.'},
        {title: 'Offense', description: 'Plan and report your attacks.'}
    ]

    const getZoneIdFromSquadId = (squadId = getSquadId()) => {
        if(squadId !== '') {
            let match = /^Auto-(.*)_duel01_squad\d$/g.exec(squadId)
            if(match) {
                return match[1]
            }
        }
        return ''
    }

    const isFleet = (squadId = getSquadId()) => {
        return getZoneIdFromSquadId(squadId) === '4zone_phase02_conflict01'
    }

    const getMaxSquadSize = (squadId = getSquadId()) => {
        if(squadId !== '') {
            return isFleet(squadId) ? 8 : activeGac.mode
        }
        return -1
    }

    const getSquadId = (id = active) => {
        return id.split(':')[1]
    }

    const getOwner =(id = active) => {
        return id.split(':')[0]
    }

    const generateSquadId = (zoneId, index) => {
        return `Auto-${zoneId}_duel01_squad${index}`
    }

    const getSquadData = (owner= getOwner(), squadId = getSquadId()) => {
        if(owner === undefined || squadId === undefined) {
            return undefined
        }
        return activeGac[owner][squadId]
    }

    const getActiveAccount = (owner = getOwner()) => {
        return owner === 'awayStatus' ? opponent : account
    }

    const addToSquad = (baseId) => {
        let owner = step === 2 ? 'planStatus' : getOwner()
        if(active) {
            let newActiveGac = JSON.parse(JSON.stringify(activeGac))
            let squadId = getSquadId()
            let currentSquad = getSquadData(owner, squadId)
            if(currentSquad === undefined) {
                newActiveGac[owner][squadId] = {
                    squad: []
                }
            }

            if(newActiveGac[owner][squadId].squad.length < getMaxSquadSize()) {
                newActiveGac[owner][squadId].squad.push({baseId, isAlive: owner === 'awayStatus' ? true : undefined})
                setActiveGac(newActiveGac)
            }
        }
    }

    const removeFromSquad = (baseId) => {
        let owner = step === 2 ? 'planStatus' : getOwner()
        if(active) {
            let newActiveGac = JSON.parse(JSON.stringify(activeGac))
            let squadId = getSquadId()
            let newSquadList = getSquadData(owner, squadId).squad.filter(unit => unit.baseId !== baseId)
            newActiveGac[owner][squadId].squad = newSquadList
            setActiveGac(newActiveGac)
        }
    }

    // looks at the active zone, and will retrieve the character from the roster for those units
    // can overwrite who to get by inserting map name as an argument
    const getCharactersFromRoster = (owner = getOwner()) => {
        if(active) {
            let squadId = getSquadId()
            let player = getActiveAccount(owner)
            let squadData = getSquadData(owner, squadId)
            if(squadData === undefined) {
                return []
            }
            // eslint-disable-next-line
            let playerUnitsMap = player.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
            return squadData.squad.map(unit => playerUnitsMap[unit.baseId])
        }
    }

    const getRemainingCharacters = (owner = getOwner()) => {
        if(active) {
            let player = getActiveAccount(owner)
            let placements = getToonsInOwnerMap(owner)
            let battleLogToons = owner === 'homeStatus' ? getToonsInBattleLog() : []
            let planMapToons = owner === 'homeStatus' ? getToonsInOwnerMap('planStatus') : []
            let alreadyPlacedUnits = [...placements, ...planMapToons, ...battleLogToons]
            return player.rosterUnit.filter(unit => !alreadyPlacedUnits.includes(unit.baseId))
        }
    }

    const onSquadClick = (squadId) => {
        let squad = squads.find(squad => squad._id === squadId).squad
        let remainingToonsBaseId = getRemainingCharacters().map(toon => toon.baseId)
        let unavailableToons = squad.map(baseId => !remainingToonsBaseId.includes(baseId))
        let ableToPlace = unavailableToons.every(v => v === false)
        if(active && ableToPlace) {
            let newActiveGac = JSON.parse(JSON.stringify(activeGac))
            let owner = getOwner()
            let squadId = getSquadId()
            if(owner === 'homeStatus') {
                if(getSquadData() === undefined) {
                    newActiveGac[owner][squadId] = { squad: [] }
                }
                newActiveGac[owner][squadId].squad = squad.map(baseId => {return {baseId}})
            } else {
                if(getSquadData('planStatus') === undefined) {
                    newActiveGac.planStatus[squadId] = {squad: []}
                }
                newActiveGac.planStatus[squadId].squad = squad.map(baseId => {return {baseId}})
            }
            setActiveGac(newActiveGac)
        }
    }

    const getPresetSquadMenu = () => {
        if(active) {
            let remainingToonsBaseId = getRemainingCharacters('homeStatus').map(toon => toon.baseId)
            return <SquadsList size='small' remainingToonsBaseId={remainingToonsBaseId} account={account} units={units} toon={!isFleet()} squads={squads} categories={categories} isFor3={activeGac.mode === 3} isFor5={activeGac.mode === 5} session={session} displayDelete={false} onSquadClick={onSquadClick}/>
        }
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

    const getAuthStatusCallback = useCallback(async () => {
        if(session && account?.allyCode) {
            getAuthStatus(session, account.allyCode, setAuthStatus, displayMessage)
        }
    }, [session, account.allyCode, displayMessage])

    useEffect(() => {
        getAuthStatusCallback()
    }, [getAuthStatusCallback])

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

    const getToonsInOwnerMap = (owner) => {
        if(activeGac[owner]) {
            let zoneList = Object.keys(activeGac[owner]).map(id => activeGac[owner][id])
            return zoneList.map(zone => zone.squad.map(unit => unit.baseId)).flat().filter(elt => elt !== undefined)
        }
        return []
    }

    const getToonsInBattleLog = () => {
        return activeGac.battleLog.map(log => log.attackTeam.squad.map(unit => unit.baseId)).flat(1)
    }



    const getPlayerDatacronsOnDefense = () => {
        if(activeGac.homeStatus) {
            let zoneList = Object.keys(activeGac.homeStatus).map(id => activeGac.homeStatus[id])
            return zoneList.map(zone => zone.datacron).filter(elt => elt !== undefined)
        }
        return []
    }

    const getOpponentDatacronsOnDefense = () => {
        if(activeGac.awayStatus) {
            let zoneList = Object.keys(activeGac.awayStatus).map(id => activeGac.awayStatus[id])
            return zoneList.map(zone => zone.datacron).filter(elt => elt !== undefined)
        }
        return []
    }

    const getDatacronsPlannedForOffense = () => {
        if(activeGac.planStatus) {
            let zoneList = Object.keys(activeGac.planStatus).map(id => activeGac.planStatus[id])
            return zoneList.map(zone => zone.datacron).filter(elt => elt !== undefined)
        }
        return []
    }

    const getDatacronsUsedForOffense = () => {
        return activeGac.battleLog.map(elt => elt.attackTeam.datacron).filter(elt => elt !== undefined)
    }

    const handleShowBackWallClick = () => {
        setShowBackWall(!showBackWall)
    }

    const handleRefreshGACBoardClick = () => {
        displayModal("This action will break your game connection.", true, updateGACBoard)
    }

    const updateGACBoard = async () => {
        setLoaderMessage('Getting GAC Board from game.')
        setLoaderVisible(true)
        let gacBoard = await getCurrentGACBoard(session, account.allyCode, displayMessage)

        if(Object.keys(gacBoard).length === 0) {
            setLoaderVisible(false)
            return
        }

        let newActiveGac = JSON.parse(JSON.stringify(activeGac))

        for(const owner of ['homeStatus', 'awayStatus']) {
            for (const squadId of Object.keys(gacBoard.homeStatus)) {
                let newSquadData = gacBoard[owner][squadId]

                if( newActiveGac[owner][squadId] === undefined) {
                    newActiveGac[owner][squadId] = newSquadData
                    if(owner === 'awayStatus') {
                        newActiveGac[owner][squadId].squad.forEach(unit => {
                            unit.isAlive = true
                        })
                    }
                } else {
                    let currSquadData = JSON.parse(JSON.stringify(newActiveGac[owner][squadId].squad))
                    currSquadData.forEach((unit, index) => {
                        unit = {...newSquadData.squad[index], ...unit}
                    })
                    newActiveGac[owner][squadId] = {...newActiveGac[owner][squadId], squad: currSquadData}
                }
            }
        }
        setActiveGac(newActiveGac)
        setLoaderVisible(false)

    }

    const addDatacronToSquad = (datacronId) => {
        console.log(datacronId)
        if(active) {
            let newActiveGac = JSON.parse(JSON.stringify(activeGac))
            let owner = step === 2 ? 'planStatus' : getOwner()
            let squadId = getSquadId()
            let squadData = getSquadData(owner)
            if(squadData === undefined) {
                newActiveGac[owner][squadId] = {
                    squad: []
                }
            }
            newActiveGac[owner][squadId].datacron = datacronId
            setActiveGac(newActiveGac)
        }
    }

    const removeDatacronFromSquad = () => {
        if(active) {
            let newActiveGac = JSON.parse(JSON.stringify(activeGac))
            let owner = step === 2 ? 'planStatus' : getOwner()
            let squadId = getSquadId()
            delete newActiveGac[owner][squadId].datacron
            setActiveGac(newActiveGac)
        }
    }

    const getDatacronsMenu = (owner = getOwner()) => {
        if(active) {
            let gameAccount = owner === 'homeStatus' ? account : opponent
    
            return <Datacrons datacrons={datacrons} account={gameAccount} exclude={getUsedDatacrons(owner)} clickOnDatacron={addDatacronToSquad} datacronNames={datacronNames}/>
        }
    }

    const getCurrentSquadDatacron = (owner = getOwner()) => {
        if(active) {
            let squadData = getSquadData(owner)
            if(squadData === undefined || squadData.datacron === undefined) {
                return
            }
            let datacronId = squadData.datacron
            let gameAccount = getActiveAccount(owner)
            let datacron = gameAccount.datacron.find(datacron => datacron.id === datacronId)
            return <Datacron datacron={datacron} datacrons={datacrons} onClick={() => {setModalDatacron(datacron);setDatacronDetailsModalOpen(true)}}/>
        }
    }

    const getUsedDatacrons = (owner = getOwner()) => {
        if(active) {
            let placements = owner === 'homeStatus' ? getPlayerDatacronsOnDefense() : getOpponentDatacronsOnDefense()
            let planned = owner === 'homeStatus' ? getDatacronsPlannedForOffense() : []
            let used = owner === 'homeStatus' ? getDatacronsUsedForOffense() : []
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
                    authStatus
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
            step === 0
            ?
            <Grid.Row>
            <GacInformation
            loggedInAllyCode={loggedInAllyCode}
            setStep={setStep}
            step={step}
            setOpponent={setOpponent}
            setLoaderVisible={setLoaderVisible}
            setLoaderMessage={setLoaderMessage}
            session={session}
            displayMessage={displayMessage}
            gacHistory={gacHistory}
            setActiveGac={setActiveGac}
            setActiveGacId={setActiveGacId}
            account={account}
            setGacHistory={setGacHistory}
            authStatus={authStatus}
            displayModal={displayModal}
            generateSquadId={generateSquadId}
        />
        </Grid.Row>
        :''
        }
        {
            step > 0
            ?
            <Grid.Row>
                <Grid columns={2}>
                    <Grid.Column computer={step === 2 ? 5 : 10} mobile={16}>
                        <GacBoard
                            getOwner={getOwner}
                            getSquadId={getSquadId}
                            generateSquadId={generateSquadId}
                            getSquadData={getSquadData}
                            step={step}
                            account={account} 
                            opponent={opponent}
                            active={active}
                            setActive={setActive} 
                            showBackWall={showBackWall}
                            units={units} 
                            activeGac={activeGac}
                            setActiveGac={setActiveGac}
                        />
                    </Grid.Column>
                    <Grid.Column computer={step === 2 ? 11 : 6} mobile={16}>
                    {
                        step === 1
                        ?
                        <GacDefense
                            isFleet={isFleet}
                            addToSquad={addToSquad}
                            removeFromSquad={removeFromSquad}
                            getSquadId={getSquadId}
                            getOwner={getOwner}
                            getSquadData={getSquadData}
                            account={account}
                            opponent={opponent}
                            active={active} 
                            units={units}
                            getMaxSquadSize={getMaxSquadSize}
                            categories={categories}
                            squads={squads}
                            session={session}
                            activeGac={activeGac}
                            setActiveGac={setActiveGac}
                            getCurrentSquadDatacron={getCurrentSquadDatacron}
                            getDatacronsMenu={getDatacronsMenu}
                            nicknames={nicknames}
                            getCharactersFromRoster={getCharactersFromRoster}
                            getRemainingCharacters={getRemainingCharacters}
                            getPresetSquadMenu={getPresetSquadMenu}
                        />
                        :
                        <GacOffense
                            account={account}
                            opponent={opponent}
                            isFleet={isFleet}
                            addToSquad={addToSquad}
                            removeFromSquad={removeFromSquad}
                            getSquadId={getSquadId}
                            getOwner={getOwner}
                            getSquadData={getSquadData}
                            active={active}
                            setActive={setActive}
                            getMaxSquadSize={getMaxSquadSize}
                            categories={categories}
                            units={units}
                            squads={squads}
                            session={session}
                            activeGac={activeGac} 
                            setActiveGac={setActiveGac}
                            getCurrentSquadDatacron={getCurrentSquadDatacron}
                            getDatacronsMenu={getDatacronsMenu}
                            datacrons={datacrons}
                            nicknames={nicknames}
                            getPresetSquadMenu={getPresetSquadMenu}
                            getRemainingCharacters={getRemainingCharacters}
                        />
                    }
                    </Grid.Column>
                </Grid>

            </Grid.Row>
            :''
        }
	</Grid>
}

export default Gac;
