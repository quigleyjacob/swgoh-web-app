import React, { useEffect, useState } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from '../profile/CharacterList';
import ShipList from '../profile/ShipList'
import SquadsList from '../profile/SquadsList';

function GacDefense ({account, opponent, active, units, getMaxSquadSize, categories, getToonsInBattleLog, session, squads, getToonsInPlayerDefense, getToonsInOpponentDefense, getToonsInPlanMap, activeGac, setActiveGac, getCurrentSquadDatacron, getDatacronsMenu, nicknames}){

	const [activeMenu, setActiveMenu] = useState('Custom Squad')
    
    useEffect(() => {
		// props.redirect('home')
	})

    const addToSquad = (baseId) => {
        if(active) {
            let array = active.split(':')
            let isPlayer = array[0] === 'player'
            let placements = JSON.parse(JSON.stringify(isPlayer ? activeGac.playerMap : activeGac.opponentMap))
            let zone = array[1]
            let squadNumber = Number(array[2])
            let currentSquad = placements[zone][squadNumber]
            if(currentSquad.length < getMaxSquadSize()) {
                currentSquad.push(baseId)
                let newActiveGac = JSON.parse(JSON.stringify(activeGac))
                if(isPlayer) {
                    newActiveGac.playerMap = placements
                } else {
                    newActiveGac.opponentMap = placements
                }
                setActiveGac(newActiveGac)
            }
        }
    }

    const removeFromSquad = (baseId) => {
        if(active) {
            let array = active.split(':')
            let isPlayer = array[0] === 'player'
            let placements = JSON.parse(JSON.stringify(isPlayer ? activeGac.playerMap : activeGac.opponentMap))
            let zone = array[1]
            let squadNumber = Number(array[2])
            let newSquadList = placements[zone][squadNumber].filter(unit => unit !== baseId)
            placements[zone][squadNumber] = newSquadList
            let newActiveGac = JSON.parse(JSON.stringify(activeGac))
            if(isPlayer) {
                newActiveGac.playerMap = placements
            } else {
                newActiveGac.opponentMap = placements
                if(newSquadList.length === 0) {
                    newActiveGac.planMap[zone][squadNumber] = []
                }
            }
            setActiveGac(newActiveGac)
        }
    }

    const getCustomSquadMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            return isFleet
                ?
                <ShipList unitData={getShipData(getRemainingCharacters(), units)} onClick={addToSquad} categories={categories} defaultSort='power' nicknames={nicknames}/>
                :
                <CharacterList unitData={getCharacterData(getRemainingCharacters(), units)} onClick={addToSquad} categories={categories} defaultSort='power' nicknames={nicknames}/>
                
        }
    }

    const onSquadClick = (e, obj) => {
        let squadId = obj.id
        let squad = squads.filter(squad => squad._id === squadId)[0].squad
        let remainingToonsBaseId = getRemainingCharacters().map(toon => toon.baseId)
        let unavailableToons = squad.map(baseId => !remainingToonsBaseId.includes(baseId))
        let ableToPlace = unavailableToons.every(v => v === false)
        if(active && ableToPlace) {
            let array = active.split(':')
            let player = array[0]
            let zone = array[1]
            let squadNumber = Number(array[2])
            if(player === 'player') {
                let newActiveGac = JSON.parse(JSON.stringify(activeGac))
                newActiveGac.playerMap[zone][squadNumber] = squad
                setActiveGac(newActiveGac)
            }
        }
    }

    const getPresetSquadMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            let remainingToonsBaseId = getRemainingCharacters().map(toon => toon.baseId)
            return <SquadsList remainingToonsBaseId={remainingToonsBaseId} account={account} units={units} toon={!isFleet} squads={squads} categories={categories} isFor3={activeGac.mode === 3} isFor5={activeGac.mode === 5} session={session} displayDelete={false} onSquadClick={onSquadClick}/>
        }
    }

    const getCharactersInSquad = () => {
        if(active) {
            let array = active.split(':')
            let player = array[0] === 'player' ? account : opponent
            let placements = array[0] === 'player' ? activeGac.playerMap : activeGac.opponentMap
            let combatType = array[1]
            let squadNumber = Number(array[2])
            let squadList = placements[combatType][squadNumber]
            player.rosterUnit.forEach(unit => {
                let baseId = unit.definitionId.split(':')[0]
                unit.baseId = baseId
            })
            // eslint-disable-next-line
            let playerUnitsMap = player.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
            return squadList.map(baseId => playerUnitsMap[baseId])
        }
    }

    const getRemainingCharacters = () => {
        if(active) {
            let array = active.split(':')
            let player = array[0] === 'player' ? account : opponent
            let placements = array[0] === 'player' ? getToonsInPlayerDefense() : getToonsInOpponentDefense()
            let battleLogToons = array[0] === 'player' ? getToonsInBattleLog() : []
            let planMapToons = array[0] === 'player' ? getToonsInPlanMap() : []
            let alreadyPlacedUnits = [...placements, ...planMapToons, ...battleLogToons]
            return player.rosterUnit.filter(unit => !alreadyPlacedUnits.includes(unit.baseId))
        }
    }

    const displayCurrentSquad = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            if(isFleet) {
                return <ShipList unitData={getShipData(getCharactersInSquad(), units)} onClick={removeFromSquad} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList unitData={getCharacterData(getCharactersInSquad(), units)} onClick={removeFromSquad} filter={false} center={true} categories={categories} displayDatacron={getCurrentSquadDatacron}/>
            }
        }
    }

    const handleMenuClick = (e, obj) => {
        let tabName = obj.name
        setActiveMenu(tabName)
    }

    const displayCurrentMenu = () => {
        switch(activeMenu) {
            case 'Custom Squad':
                return getCustomSquadMenu()
            case 'Preset Squad':
                return getPresetSquadMenu()
            case 'Datacrons':
                return getDatacronsMenu()
            default:
                return <Header>Unknown</Header>
        }
    }

    const selectedPlayerSquad = () => {
        if(active) {
            let array = active.split(':')
            let isPlayer = array[0] === 'player'
            if(activeMenu === 'Datacrons' && array[1] === 'fleet') {
                setActiveMenu('Custom Squad')
            }
            if(!isPlayer && activeMenu === 'Preset Squad') {
                setActiveMenu('Custom Squad')
            }
            return isPlayer
        }
        return false
    }

	return <Grid centered columns={1}>
        <Grid.Row centered>
            <Header textAlign='center'>Selected Squad</Header>
        </Grid.Row>
        <Grid.Row centered className='toonList'>
            {displayCurrentSquad()}
        </Grid.Row>

        <Grid.Row>
            <Menu attached='top' tabular>
                <Menu.Item name='Custom Squad' active={activeMenu === 'Custom Squad'} onClick={handleMenuClick}/>
                <Menu.Item disabled={!selectedPlayerSquad()} name='Preset Squad' active={activeMenu === 'Preset Squad'} onClick={handleMenuClick}/>
                <Menu.Item disabled={active === "" || active.split(':')[1] === 'fleet'} name='Datacrons' active={activeMenu === 'Datacrons'} onClick={handleMenuClick}/>
            </Menu>
            <Segment attached='bottom'>
                {displayCurrentMenu()}
            </Segment>
        </Grid.Row>

        </Grid>
}

export default GacDefense;