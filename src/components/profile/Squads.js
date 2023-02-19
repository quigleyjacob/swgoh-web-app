import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Container, Divider, Dropdown, Form, Header, Icon } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from './CharacterList';
import ShipList from './ShipList';

function Squads ({units, account, skills, images, categories}){

    const [toon, setToon] = useState(true)
    const [selectedOptions, setSelectedOptions] = useState([])
    const [isFor3, setIsFor3] = useState(true)
    const [isFor5, setIsFor5] = useState(true)

	useEffect(() => {
		// props.redirect('home')
	})

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
        console.log(obj.value.length)
        let newSquad = obj.value

        if(newSquad.length <= getMaxUnits()) {
            setSelectedOptions(newSquad)
        }

        if(toon && newSquad.length > 3) {
            setIsFor3(false)
        }
    }

    const getCreatedSquadData = () => {
        console.log(selectedOptions)
        let squadMap = account.rosterUnit
            // @ts-ignore
            .filter(unit =>selectedOptions.includes(unit.baseId))
            // @ts-ignore
            .reduce((map, obj) => (map[obj.baseId] = obj, map), {})
        console.log(squadMap)
        let squad = selectedOptions.map(baseId => squadMap[baseId])
        console.log(squad)
        return toon ? getCharacterData(squad, units) : getShipData(squad, units)
    }

    const handleCheckbox3Click = () => {
        setIsFor3(!isFor3)
    }
    const handleCheckbox5Click = () => {
        setIsFor5(!isFor5)
    }

	return <div>
       <Container text>
		<Header size='huge' textAlign='center'>Add New Squad</Header>
        <Form>
            <Form.Group inline>
            <Button.Group>
                <Button onClick={toggleActive} color={toon ? 'blue' : 'grey'}>Toon</Button>
                <Button.Or />
                <Button onClick={toggleActive} color={!toon ? 'blue' : 'grey'}>Ship</Button>
            </Button.Group>
            
            <Form.Checkbox type='checkbox' label='Used in 3v3' checked={isFor3} disabled={toon && selectedOptions.length > 3} onClick={handleCheckbox3Click}/>

            <Form.Checkbox type='checkbox' label='Used in 5v5' checked={isFor5} onClick={handleCheckbox5Click}/>

            </Form.Group>

        <Dropdown
            placeholder='Units'
            fluid
            multiple
            search
            selection
            options={filterUnits()}
            onChange={handleChange}
            value={selectedOptions}
        />



        <Button positive><Icon name='save'></Icon>Save Squad</Button>
        </Form>

        {
            toon
            ?
            <CharacterList unitData={getCreatedSquadData()} skills={skills} images={images} categories={categories} filter={false}/>
            :
            <ShipList unitData={getCreatedSquadData()} images={images} categories={categories} filter={false}/>
        }
        

        </Container>

        <Divider></Divider>

        <Header size='huge' textAlign='center'>Already Existing Squads</Header>

	
    </div>
}

export default Squads;
