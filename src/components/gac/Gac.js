import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Grid, Icon, Modal } from 'semantic-ui-react';
import './Gac.css'
import GacDefense from './GacDefense';
import GacInformation from './GacInformation';
import GacOffense from './GacOffense';
import Steps from './Steps';
import GacBoard from './GacBoard';
import { updateGac, getCurrentGACBoard, getGacInfo } from '../../server/gac';
import Datacron from '../profile/Datacron';
import Datacrons from '../profile/Datacrons';
import Squads from '../profile/Squads';

function Gac ({loggedInAllyCode, account, redirect, units, setLoaderVisible, setLoaderMessage, session, categories, displayMessage, squads, gacHistory, activeGac, setActiveGac, activeGacId, setActiveGacId, opponent, setOpponent, setGacHistory, displayModal, datacrons, affixTextMap, datacronNames, nicknames, setSquads, step, setStep, authStatus}){

    const [active, setActive] = useState('')
    const [showBackWall, setShowBackWall] = useState(true)
    const [datacronDetailsModalOpen, setDatacronDetailsModalOpen] = useState(false)
    const [modalDatacron, setModalDatacron] = useState({})
    const [eventInstanceId, setEventInstanceId] = useState('')

    const steps = [
        {title: 'Information', description: 'Pick settings and opponent.'},
        {title: 'Defense', description: 'Place yours and opponent\'s defense.'},
        {title: 'Offense', description: 'Plan and report your attacks.'}
    ]

    const getZoneIdFromSquadId = (squadId = getSquadId()) => {
        if(squadId !== '') {
            let match = /^Auto-(.*)_squad\d$/g.exec(squadId)
            if(match) {
                return match[1]
            }
        }
        return ''
    }

    const isFleet = (squadId = getSquadId()) => {
        return getZoneIdFromSquadId(squadId) === '4zone_phase02_conflict01_duel01'
    }

    const getMaxSquadSize = (squadId = getSquadId()) => {
        if(squadId !== '') {
            return isFleet(squadId) ? 8 : activeGac.mode
        }
        return -1
    }

    const getSquadId = (id = active) => {
        if(id === '') {
            return undefined
        }
        return id.split(':')[1]
    }

    const getOwner =(id = active) => {
        if(id === '') {
            return 'homeStatus'
        }
        return id.split(':')[0]
    }

    const getSquadData = (owner= getOwner(), squadId = getSquadId()) => {
        if(owner === undefined || squadId === undefined) {
            return undefined
        }
        return activeGac[owner][squadId]
    }

    const isSquadAlive = (owner = getOwner(), squadId = getSquadId()) => {
        let squad = activeGac[owner][squadId]
        if(!squad || !squad.squad) return false
        return squad.squad.every(unit => unit.isAlive)
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
            return squadData.squad.map(unit => playerUnitsMap[unit.baseId]).filter(unit => unit !== undefined)
        }
    }

    const getAlreadyPlacedUnits = (owner = getOwner()) => {
        let placements = getToonsInOwnerMap(owner)
        let battleLogToons = owner === 'homeStatus' ? getToonsInBattleLog() : []
        let planMapToons = owner === 'homeStatus' ? getToonsInOwnerMap('planStatus') : []
        return [...placements, ...planMapToons, ...battleLogToons]
    }

    const getRemainingCharacters = (owner = getOwner()) => {
            let player = getActiveAccount(owner)
            let alreadyPlacedUnits = getAlreadyPlacedUnits(owner)
            return player.rosterUnit.filter(unit => !alreadyPlacedUnits.includes(unit.baseId))
    }

    const getEraUnitStatus = (owner = getOwner()) => {
        let player = getActiveAccount(owner)
        return player.eraUnitStatus
    }

    const onSquadClick = (e, obj) => {
        let squadId = obj.id
        let squad = squads.find(squad => squad._id === squadId).squad
        let remainingToonsBaseId = getRemainingCharacters('homeStatus').map(toon => toon.baseId)
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
        let width = step === 1 ? 6 : 11
            let remainingToonsBaseId = getRemainingCharacters('homeStatus').map(toon => toon.baseId)
            return <Squads width={width} size='small' remainingToonsBaseId={remainingToonsBaseId} isToon={!isFleet()} onSquadClick={onSquadClick} session={session} units={units} account={account} categories={categories} squads={squads} setSquads={setSquads} nicknames={nicknames} defaultTag={`gac${activeGac.mode}`}/>
    }

    const changeStep = (newStep) => {
        if(getOwner() === 'homeStatus' || !isSquadAlive()) {
            setActive('')
        }
        setStep(newStep)
    }

    const getEventInstanceId = useCallback(async() => {
        if(step === 0) {
            setEventInstanceId('')
            return
        }
        let mode = activeGac?.mode
        getGacInfo(mode, displayMessage, setEventInstanceId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step])

    useEffect(() => {
        redirect('gacPlanner')
        getEventInstanceId()
    }, [getEventInstanceId, redirect])

    const getToonsInOwnerMap = (owner) => {
        if(activeGac[owner]) {
            let zoneList = Object.keys(activeGac[owner]).map(id => activeGac[owner][id])
            return zoneList.map(zone => zone === undefined ? [] : zone.squad.map(unit => unit.baseId)).flat().filter(elt => elt !== undefined)
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
            return zoneList.map(zone => zone?.datacron).filter(elt => elt !== undefined)
        }
        return []
    }

    const getDatacronsUsedForOffense = () => {
        return activeGac.battleLog.map(elt => elt.attackTeam.datacron).filter(elt => elt !== undefined)
    }

    const handleShowBackWallClick = () => {
        setShowBackWall(!showBackWall)
    }

    const getSquadBaseIds = (squadData = {}) => {
        return (squadData?.squad || []).map((unit) => unit.baseId)
    }

    const unorderedEqual = (arr1, arr2) => {
        if(!arr1 || !arr2) return false
        if(arr1.length !== arr2.length) return false
        return JSON.stringify([...arr1].sort()) === JSON.stringify([...arr2].sort())
    }

    const squadsEqual = (squad1, squad2) => {
        return unorderedEqual(getSquadBaseIds(squad1), getSquadBaseIds(squad2))
    }

    const mergeSquadData = (existingSquadData = {}, incomingSquadData = {}) => {
        const incomingSquad = incomingSquadData.squad || []
        const mergedSquad = (existingSquadData.squad || []).map((unit, index) => {
            return {...incomingSquad[index], ...unit}
        })
        return {...existingSquadData, squad: mergedSquad}
    }

    const applyMisplacedSquadState = (newActiveGac, owner, squadId, newSquadData, squadIdList) => {
        if(owner !== 'awayStatus') {
            return
        }

        const misplacedSquadId = squadIdList.find((candidateSquadId) => {
            return candidateSquadId !== squadId && squadsEqual(activeGac[owner]?.[candidateSquadId], newSquadData)
        })

        if(!misplacedSquadId) {
            newSquadData.squad.forEach(unit => {
                unit.isAlive = true
            })
            return
        }

        const isAliveMap = (activeGac[owner][misplacedSquadId]?.squad || []).reduce((obj, toon) => {
            obj[toon.baseId] = toon.isAlive
            return obj
        }, {})

        newSquadData.squad.forEach(unit => {
            unit.isAlive = isAliveMap[unit.baseId]
        })

        const misplacedPlan = activeGac.planStatus?.[misplacedSquadId]
        if(misplacedPlan) {
            newActiveGac.planStatus = newActiveGac.planStatus || {}
            newActiveGac.planStatus[squadId] = JSON.parse(JSON.stringify(misplacedPlan))
            if(squadsEqual(misplacedPlan, newActiveGac.planStatus[misplacedSquadId])) {
                delete newActiveGac.planStatus[misplacedSquadId]
            }
        }

        newActiveGac.battleLog?.forEach(log => {
            if(log.squadId === misplacedSquadId) {
                log.squadId = squadId
            }
        })
    }

    const handleRefreshGACBoardClick = () => {
        displayModal("This action will break your game connection.", true, updateGACBoard)
    }

    const updateGACBoard = async () => {
        setLoaderMessage('Getting GAC Board from game.')
        setLoaderVisible(true)
        const gacBoard = await getCurrentGACBoard(session, account.allyCode, displayMessage)

        if(Object.keys(gacBoard).length === 0) {
            setLoaderVisible(false)
            return
        }

        const newActiveGac = JSON.parse(JSON.stringify(activeGac))

        for(const owner of ['homeStatus', 'awayStatus']) {
            const squadIdList = Object.keys(gacBoard[owner] || {})
            newActiveGac[owner] = newActiveGac[owner] || {}

            for (const squadId of squadIdList) {
                const newSquadData = gacBoard[owner][squadId]
                const oldSquadData = activeGac[owner]?.[squadId]

                if(newSquadData === undefined && oldSquadData === undefined) {
                    continue
                }

                if(oldSquadData === undefined || oldSquadData.squad === undefined || oldSquadData.squad.length === 0) {
                    newActiveGac[owner][squadId] = newSquadData
                    if(owner === 'awayStatus') {
                        applyMisplacedSquadState(newActiveGac, owner, squadId, newSquadData, squadIdList)
                    }
                    continue
                }

                if(owner === 'awayStatus' && !squadsEqual(oldSquadData, newSquadData)) {
                    newActiveGac[owner][squadId] = newSquadData
                    applyMisplacedSquadState(newActiveGac, owner, squadId, newSquadData, squadIdList)
                    continue
                }

                newActiveGac[owner][squadId] = mergeSquadData(newActiveGac[owner][squadId], newSquadData)
            }
        }

        setActiveGac(newActiveGac)
        setLoaderVisible(false)
    }

    const addDatacronToSquad = (datacronId) => {
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
    
            return <Datacrons datacrons={datacrons} affixTextMap={affixTextMap} account={gameAccount} exclude={getUsedDatacrons(owner)} clickOnDatacron={addDatacronToSquad} datacronNames={datacronNames}/>
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
            return <Datacron datacron={datacron} datacrons={datacrons} affixTextMap={affixTextMap} onClick={() => {setModalDatacron(datacron);setDatacronDetailsModalOpen(true)}}/>
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
            <Datacron datacron={modalDatacron} datacrons={datacrons} affixTextMap={affixTextMap} simple={false} />
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
                <Button disabled={step === 0} color='green' floated='right' onClick={() => updateGac(activeGacId, session, loggedInAllyCode, activeGac, displayMessage, true)}><Icon name='save'></Icon>Save</Button>                
            </Grid.Column>
        </Grid.Row>
        
        <Grid.Row>
        <Steps step={step} steps={steps} changeStep={changeStep}/>
        </Grid.Row>
        
        {/* {
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
        } */}
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
                            getEraUnitStatus={getEraUnitStatus}
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
                            affixTextMap={affixTextMap}
                            nicknames={nicknames}
                            getPresetSquadMenu={getPresetSquadMenu}
                            getRemainingCharacters={getRemainingCharacters}
                            displayMessage={displayMessage}
                            eventInstanceId={eventInstanceId}
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
