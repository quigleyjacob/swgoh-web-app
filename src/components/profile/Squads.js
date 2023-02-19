import React, { useCallback, useEffect, useState } from 'react';
import { Button, Container, Divider, Dropdown, Form, Header, Icon, List } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from './CharacterList';
import ShipList from './ShipList';

function Squads ({session, units, account, skills, images, categories}){

    const [toon, setToon] = useState(true)
    const [selectedOptions, setSelectedOptions] = useState([])
    const [isFor3, setIsFor3] = useState(true)
    const [isFor5, setIsFor5] = useState(true)
    const [squads, setSquads] = useState([])

    const getSquads = useCallback(async () => {
        if(session) {
            let body = {
                session: session,
                allyCode: account.allyCode
            }
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/squad`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })
            if(response.ok) {
                let squadList = await response.json()
                setSquads(squadList)
            } else {
                console.log(await response.text())
                //TODO: display error message
            }
        }
    }, [session, account.allyCode])

	useEffect(() => {
		// props.redirect('home')
        getSquads()
	}, [getSquads])

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

    const getCreatedSquadData = (squadList=selectedOptions) => {
        let squadMap = account.rosterUnit
            // @ts-ignore
            .filter(unit =>squadList.includes(unit.baseId))
            // eslint-disable-next-line
            .reduce((map, obj) => (map[obj.baseId] = obj, map), {})
        let squad = squadList.map(baseId => squadMap[baseId])
        return toon ? getCharacterData(squad, units) : getShipData(squad, units)
    }

    const handleCheckbox3Click = () => {
        setIsFor3(!isFor3)
    }
    const handleCheckbox5Click = () => {
        setIsFor5(!isFor5)
    }

    const addNewSquad = async () => {
        // cannot submit if no toons are selected or if both options for 3s and 5s are not selected
        if(selectedOptions.length === 0 || (!isFor3 && !isFor5)) {
            return
        }
        if(session) {
            let body = {
                session: session,
                payload: {
                    allyCode: account.allyCode,
                    combatType: toon ? 1 : 2,
                    isFor3: isFor3,
                    isFor5: isFor5,
                    squad: selectedOptions
                }
            }
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/squad/add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })
            if(response.ok) {
                let squad = await response.json()
                let newSquadList = [...squads, squad]
                // @ts-ignore
                setSquads(newSquadList)
                setSelectedOptions([])
            } else {
                console.log(await response.text())
                //TODO: display error message
            }

        }
    }

    const deleteSquad = async (e) => {
        if(session) {
            let squadToDeleteId = e.target.id
            let body = {
                session: session,
                allyCode: account.allyCode,
                squadId: squadToDeleteId
            }
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/squad/delete`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })
            if(response.ok) {
                let newSquadList = squads.filter(squad => {
                    // @ts-ignore
                    return squad._id !== squadToDeleteId
                })
                // @ts-ignore
                setSquads(newSquadList)
            } else {
                console.log(await response.text())
                // TODO: display error message
            }
        }
        

    }

    const displaySquadList = () => {
        let combatType = toon ? 1 : 2
        return squads
        .filter(squad => {
            // @ts-ignore
            return squad.combatType === combatType && (squad.isFor3 === isFor3 || squad.isFor5 === isFor5)
        })
        .map(squad => {
            // @ts-ignore
            let id = squad._id
            // @ts-ignore
            return <List.Item key={id}>
                <List.Content floated='left' verticalAlign='middle'>
                    {
                    toon
                    ?
                    // @ts-ignore
                    <CharacterList  unitData={getCreatedSquadData(squad.squad)} skills={skills} images={images} categories={categories} filter={false}/>
                    :
                    // @ts-ignore
                    <ShipList unitData={getCreatedSquadData(squad.squad)} images={images} categories={categories} filter={false}/>
                    }
                </List.Content>
                <List.Content floated='right' onClick={deleteSquad} verticalAlign='bottom'>
                    <Icon link textAlign='right' size='big' name='trash alternate' id={id}></Icon>
                </List.Content>
            </List.Item>
        })
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

        <Button positive onClick={addNewSquad}><Icon name='save'></Icon>Save Squad</Button>
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

        <Container>
            <List divided>
                {displaySquadList()}
            </List>
        </Container>
    </div>
}

export default Squads;
