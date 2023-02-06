import React, { useEffect } from 'react';
import { Divider, Header, Segment } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from '../profile/CharacterList';
import ShipList from '../profile/ShipList'
import GacBoard from './GacBoard';

function GacDefense ({account, opponent, playerMap, opponentMap, images, active, setActive, units, skills, setPlayerMap, setOpponentMap, getMaxSquadSize, categories, step, killMap, getToonsInBattleLog}){

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

    const getActiveMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            if(isFleet) {
                return <ShipList unitData={getShipData(getRemainingCharacters(), units)} images={images} addToSquad={addToSquad} categories={categories}/>
            } else {
                return <CharacterList unitData={getCharacterData(getRemainingCharacters(), units)} addToSquad={addToSquad} skills={skills} images={images} categories={categories}/>
            }
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
            let placements = array[0] === 'player' ? playerMap : opponentMap
            let alreadyPlacedUnits = [...placements.top.flat(1), ...placements.bottom.flat(1), ...placements.back.flat(1), ...placements.fleet.flat(), ...getToonsInBattleLog()]
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

	return <div>
		<Header size='huge' textAlign='center'>GAC Defense</Header>
        <GacBoard step={step} playerMap={playerMap} opponentMap={opponentMap} images={images} account={account} opponent={opponent} active={active} setActive={setActive} getMaxSquadSize={getMaxSquadSize} killMap={killMap}/>
        <Divider />
        <Header textAlign='center'>Character's in Selected Squad</Header>
        {displayCurrentSquad()}
        <Divider />
        <Header textAlign='center'>Remaining Characters</Header>
        <Segment attached='bottom'>
        {getActiveMenu()}
        </Segment>
	</div>
}

export default GacDefense;