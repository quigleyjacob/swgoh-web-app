import React, { useEffect, useState } from 'react';
import { Divider, Grid, Header, Menu, Segment } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from '../profile/CharacterList';
import ShipList from '../profile/ShipList'
import SquadsList from '../profile/SquadsList';

function GacDefense ({account, opponent, playerMap, opponentMap, images, active, units, skills, setPlayerMap, setOpponentMap, getMaxSquadSize, categories, getToonsInBattleLog, mode, session, squads, setSquads, getToonsInPlayerDefense, getToonsInOpponentDefense, getToonsInPlanMap}){

	const [activeMenu, setActiveMenu] = useState('Custom Squad')
    
    useEffect(() => {
		// props.redirect('home')
	})

    const addToSquad = (baseId) => {
        if(active) {
            let array = active.split(':')
            let isPlayer = array[0] === 'player'
            let placements = JSON.parse(JSON.stringify(isPlayer ? playerMap : opponentMap))
            let zone = array[1]
            let squadNumber = Number(array[2])
            let currentSquad = placements[zone][squadNumber]
            if(currentSquad.length < getMaxSquadSize()) {
                currentSquad.push(baseId)
                if(isPlayer) {
                    setPlayerMap(placements)
                } else {
                    setOpponentMap(placements)
                }
                
            }
        }
    }

    const removeFromSquad = (baseId) => {
        if(active) {
            let array = active.split(':')
            let isPlayer = array[0] === 'player'
            let placements = JSON.parse(JSON.stringify(isPlayer ? playerMap : opponentMap))
            let zone = array[1]
            let squadNumber = Number(array[2])
            let newSquadList = placements[zone][squadNumber].filter(unit => unit !== baseId)
            placements[zone][squadNumber] = newSquadList
            if(isPlayer) {
                setPlayerMap(placements)
            } else {
                setOpponentMap(placements)
            }
        }
    }

    const getCustomSquadMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            return isFleet
                ?
                <ShipList unitData={getShipData(getRemainingCharacters(), units)} images={images} addToSquad={addToSquad} categories={categories}/>
                :
                <CharacterList unitData={getCharacterData(getRemainingCharacters(), units)} addToSquad={addToSquad} skills={skills} images={images} categories={categories}/>
                
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
                let newPlayerMap = JSON.parse(JSON.stringify(playerMap))
                newPlayerMap[zone][squadNumber] = squad
                setPlayerMap(newPlayerMap)
            }
        }
    }

    const getPresetSquadMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            let remainingToonsBaseId = getRemainingCharacters().map(toon => toon.baseId)
            return <SquadsList remainingToonsBaseId={remainingToonsBaseId} account={account} units={units} toon={!isFleet} squads={squads} skills={skills} images={images} categories={categories} isFor3={mode === 3} isFor5={mode === 5} session={session} setSquads={setSquads} displayDelete={false} onSquadClick={onSquadClick}/>
        }
    }

    const getCharactersInSquad = () => {
        if(active) {
            let array = active.split(':')
            let player = array[0] === 'player' ? account : opponent
            let placements = array[0] === 'player' ? playerMap : opponentMap
            let combatType = array[1]
            let squadNumber = Number(array[2])
            let squadList = placements[combatType][squadNumber]
            // eslint-disable-next-line
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
                return <ShipList unitData={getShipData(getCharactersInSquad(), units)} addToSquad={removeFromSquad} images={images} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList unitData={getCharacterData(getCharactersInSquad(), units)} addToSquad={removeFromSquad} skills={skills} images={images} filter={false} center={true} categories={categories}/>
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
            default:
                return <Header>Unknown</Header>
        }
    }

    const selectedPlayerSquad = () => {
        if(active) {
            let array = active.split(':')
            let isPlayer = array[0] === 'player'
            if(!isPlayer && activeMenu !== 'Custom Squad') {
                setActiveMenu('Custom Squad')
            }
            return isPlayer
        }
        return false
    }

	return <Grid centered columns={1}>
        <Grid.Row centered>
            <Header textAlign='center'>Character's in Selected Squad</Header>
        </Grid.Row>
        <Grid.Row centered>
            {displayCurrentSquad()}
        </Grid.Row>

        <Grid.Row>
            <Menu attached='top' tabular>
                <Menu.Item name='Custom Squad' active={activeMenu === 'Custom Squad'} onClick={handleMenuClick}/>
                <Menu.Item disabled={!selectedPlayerSquad()} name='Preset Squad' active={activeMenu === 'Preset Squad'} onClick={handleMenuClick}/>
            </Menu>
            <Segment attached='bottom' >
                {displayCurrentMenu()}
            </Segment>
        </Grid.Row>

        </Grid>
}

export default GacDefense;