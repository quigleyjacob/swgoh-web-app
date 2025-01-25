import React, { useState } from 'react';
import { Dropdown, Form, Grid, Icon, Item } from 'semantic-ui-react';
import CharacterList from './CharacterList';
import ShipList from './ShipList';
import { getCreatedSquadData } from '../../utils/index.js'
import { deleteSquad } from '../../server/squads';


function SquadsList({remainingToonsBaseId=null, size='normal', account, units, combatType=1, toon=true, squads, categories, isFor3, isFor5, session, setSquads = (squads) => {}, displayDelete=true, onSquadClick=()=>{}, displayMessage}){

    const [selectedOptions, setSelectedOptions] = useState([])

    const handleChange = (e, obj) => {
        let newSquad = obj.value
        setSelectedOptions(newSquad)
    }

    const handleDeleteClick = (e) => {
        if(displayDelete) {
            let id = e.target.id
            deleteSquad(id, account.allyCode, session, displayMessage, squads, setSquads)
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
            return squad.combatType === combatType && (squad.isFor3 === isFor3 || squad.isFor5 === isFor5)
        })
        .filter(squad => {
            return selectedOptions.every(baseId => squad.squad.includes(baseId))
        })
        .map(squad => {
            let unavailableToons = remainingToonsBaseId ? squad.squad.map(baseId => !remainingToonsBaseId.includes(baseId)) : null
            let id = squad._id
            return (
                <Grid.Row key={id}>
                    <Grid.Column width={ displayDelete ? 14 : 16}>
                    {
                    toon
                    ?
                    <CharacterList size={size} killList={unavailableToons} unitData={getCreatedSquadData(account, units, toon, squad.squad)} categories={categories} filter={false}/>
                    :
                    <ShipList size={size} killList={unavailableToons} unitData={getCreatedSquadData(account, units, toon, squad.squad)} categories={categories} filter={false}/>
                    }
                    </Grid.Column>
                    
                    {
                    displayDelete
                    ?
                    <Grid.Column width={2} verticalAlign='middle' textAlign='left'>
                        <Item id={id} onClick={handleDeleteClick}><Icon link size='big' name='trash alternate' id={id}/></Item>
                    </Grid.Column>
                    :
                    ''
                    }
                </Grid.Row>
            )
        })
    }

	return <Grid>
        <Grid.Row centered>
            {
            squads.length > 0
            ?
            <Form>
                <Form.Group>
                    <Form.Field>
                        <label>Filter Squads</label>
                        <Dropdown 
                            placeholder='Units'
                            multiple
                            search
                            selection
                            closeOnChange
                            onChange={handleChange}
                            value={selectedOptions}
                            options={filterUnits()}
                        />
                    </Form.Field>
                </Form.Group>
             </Form>
             :
             ''
            }
        </Grid.Row>
        {displaySquadList()}
    </Grid>
}

export default SquadsList;
