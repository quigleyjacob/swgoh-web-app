import React, { useState } from 'react';
import { Button, Dropdown, Form, Grid, Header, Icon } from 'semantic-ui-react';
import CharacterList from './CharacterList';
import ShipList from './ShipList';
import SquadsList from './SquadsList';
import { getCreatedSquadData } from '../../utils';
import { addNewSquad } from '../../server/squads.js';

function Squads ({session, units, account, categories, squads, setSquads, size='normal', remainingToonsBaseId=[], onSquadClick=()=>{}, isToon=true}){

    const [toon, setToon] = useState(isToon)
    const [selectedOptions, setSelectedOptions] = useState([])
    const [isFor3, setIsFor3] = useState(true)
    const [isFor5, setIsFor5] = useState(true)

    const toggleActive = () => {
        setToon(!toon)
        setSelectedOptions([])
        setIsFor3(true)
        setIsFor5(true)
    }

    const getMaxUnits = () => {
        return toon ? 5 : 8
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

    const handleChange = (e, obj) => {
        let newSquad = obj.value

        if(newSquad.length <= getMaxUnits()) {
            setSelectedOptions(newSquad)
        }

        if(toon && newSquad.length > 3) {
            setIsFor3(false)
        }
    }

    const handleCheckbox3Click = () => {
        setIsFor3(!isFor3)
    }
    const handleCheckbox5Click = () => {
        setIsFor5(!isFor5)
    }

	return <Grid>
        <Grid.Row centered>
            <Header size='huge' textAlign='center'>Add New Squad</Header>
        </Grid.Row>
		<Grid.Row centered>
            <Form>
                <Button.Group>
                    <Button onClick={toggleActive} color={toon ? 'blue' : 'grey'}>Toon</Button>
                    <Button.Or />
                    <Button onClick={toggleActive} color={!toon ? 'blue' : 'grey'}>Ship</Button>
                </Button.Group>

                <Form.Group inline>
                    <Form.Checkbox type='checkbox' label='Used in 3v3' checked={isFor3} disabled={toon && selectedOptions.length > 3} onClick={handleCheckbox3Click}/>
                    <Form.Checkbox type='checkbox' label='Used in 5v5' checked={isFor5} onClick={handleCheckbox5Click}/>
                </Form.Group>

                <Dropdown
                    placeholder='Units'
                    fluid
                    multiple
                    search
                    selection
                    closeOnChange
                    options={filterUnits()}
                    onChange={handleChange}
                    value={selectedOptions}
                />

                <Button positive onClick={addNewSquad.bind(this, selectedOptions, isFor3, isFor5, session, account, toon, squads, setSelectedOptions, setSquads)}><Icon name='save'></Icon>Save Squad</Button>
            </Form>
        </Grid.Row>

        <Grid.Row centered>
        {
            toon
            ?
            <CharacterList size={size} unitData={getCreatedSquadData(account, units, toon, selectedOptions)} categories={categories} filter={false}/>
            :
            <ShipList size={size} unitData={getCreatedSquadData(account, units, toon, selectedOptions)} categories={categories} filter={false}/>
        }
        </Grid.Row>
        
        <Grid.Row centered>
            <Header size='huge' textAlign='center'>Your Squads</Header>
        </Grid.Row>
        <Grid.Row centered>
        <SquadsList size={size} remainingToonsBaseId={remainingToonsBaseId} account={account} units={units} toon={toon} squads={squads} categories={categories} isFor3={isFor3} isFor5={isFor5} session={session} setSquads={setSquads} onSquadClick={onSquadClick}/>
        </Grid.Row>
    </Grid>
}

export default Squads;
