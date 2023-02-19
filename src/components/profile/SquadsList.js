import React, { useEffect, useState } from 'react';
import { Container, Dropdown, Icon, List } from 'semantic-ui-react';
import CharacterList from './CharacterList';
import ShipList from './ShipList';
import { getCreatedSquadData } from '../../utils/index.js'
import { deleteSquad } from '../../server/squads';


function SquadsList ({remainingToonsBaseId=null, account, units, combatType=1, toon=true, squads, skills, images, categories, isFor3, isFor5, session, setSquads, displayDelete=true, onSquadClick=()=>{}}){

	useEffect(() => {
		// props.redirect('home')
	})

    const [selectedOptions, setSelectedOptions] = useState([])

    const handleChange = (e, obj) => {
        let newSquad = obj.value
        setSelectedOptions(newSquad)
    }

    const handleDeleteClick = (e) => {
        if(displayDelete) {
            deleteSquad(e, session, account, squads, setSquads)
        }
    }

    const filterUnits = () => {
        let combatType = toon ? 1 : 2
        return units
            .filter(unit => unit.combatType === combatType)
            .map(unit => {
                return {
                    key: unit.baseId,
                    text: unit.nameKey,
                    value: unit.baseId,
                    combattype: unit.combatType
                  }
            })
    }

    const displaySquadList = () => {
        let combatType = toon ? 1 : 2
        return squads
        .filter(squad => {
            // @ts-ignore
            return squad.combatType === combatType && (squad.isFor3 === isFor3 || squad.isFor5 === isFor5)
        })
        .filter(squad => {
            // @ts-ignore
            return selectedOptions.every(baseId => squad.squad.includes(baseId))
        })
        .map(squad => {
            // @ts-ignore
            let unavailableToons = remainingToonsBaseId ? squad.squad.map(baseId => !remainingToonsBaseId.includes(baseId)) : null
            // @ts-ignore
            let id = squad._id
            // @ts-ignore
            return <List.Item key={id} id={id} onClick={onSquadClick}>
                <List.Content floated='left' verticalAlign='middle'>
                    {
                    toon
                    ?
                    // @ts-ignore
                    <CharacterList killList={unavailableToons} unitData={getCreatedSquadData(account, units, toon, squad.squad)} skills={skills} images={images} categories={categories} filter={false}/>
                    :
                    // @ts-ignore
                    <ShipList killList={unavailableToons} unitData={getCreatedSquadData(account, units, toon, squad.squad)} images={images} categories={categories} filter={false}/>
                    }
                </List.Content>
                {
                    displayDelete
                    ?
                    <List.Content floated='right' onClick={handleDeleteClick} verticalAlign='bottom'>
                        <Icon link textAlign='right' size='big' name='trash alternate' id={id}></Icon>
                    </List.Content>
                    :
                    ''
                }
            </List.Item>
        })
    }

	return <Container>
    <Dropdown 
        placeholder='Units'
        fluid
        multiple
        search
        selection
        closeOnChange
        onChange={handleChange}
        value={selectedOptions}
        options={filterUnits()}
    />
    <List divided>
        {displaySquadList()}
    </List>
</Container>
}

export default SquadsList;
