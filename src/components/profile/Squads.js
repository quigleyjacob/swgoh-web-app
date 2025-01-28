import React, { useState, useEffect } from 'react';
import { Button, Form, Grid, Header, Icon } from 'semantic-ui-react';
import CharacterList from './CharacterList';
import ShipList from './ShipList';
import SquadsList from './SquadsList';
import { getCreatedSquadData, getShipData } from '../../utils';
import { addNewSquad } from '../../server/squads.js';
import { getCharacterData } from '../../utils';
import { tagOptions } from '../../utils/constants.js';

function Squads ({session, width=16, units, account, categories, nicknames, squads, setSquads, size='normal', remainingToonsBaseId=null, onSquadClick=()=>{}, isToon=true, displayMessage, defaultTag = ''}){

    const [toon, setToon] = useState(isToon)
    const [selectedOptions, setSelectedOptions] = useState([])
    const [tags, setTags] = useState([])
    const [tag, setTag] = useState(defaultTag)
    const [unique, setUnique] = useState(false)

    const toggleActive = () => {
        setToon(!toon)
        setSelectedOptions([])
    }

    useEffect(() => {
        setToon(isToon)
    }, [isToon])

    const getMaxUnits = () => {
        if(!toon) {
            return 8
        }
        return tags.includes('gac3') ? 3 : 5
    }

    const handleTagChange = (e, obj) => {
        setTags(obj.value)
    }

    const addUnitToSquad = (baseId) => {
        let newSelectedOptions = [...selectedOptions, baseId]
        if(newSelectedOptions.length <= getMaxUnits()) {
            setSelectedOptions(newSelectedOptions)
        }
    }

    const removeUnitFromSquad = (baseId) => {
        let newSelectedOptions = selectedOptions.filter(id => id !== baseId)
        setSelectedOptions(newSelectedOptions)
    }

    const getRemainingCharacters = () => {
        let unitsInSquads = squads
        .filter(squad => squad.tags.includes(tag))
        .reduce((arr, squad) => {
            return [...arr, ...squad.squad]
        }, [])
        return account.rosterUnit
        .filter(unit => !selectedOptions.includes(unit.baseId)) // filter out characters in selected options
        .filter(unit => remainingToonsBaseId === null || remainingToonsBaseId.includes(unit.baseId)) // keep characters in the list of remaining toons defined externally\
        .filter(unit => !unique || !unitsInSquads.includes(unit.baseId))
    }

	return <Grid centered stackable>
        <Grid.Row columns={2}>
            <Grid.Column width={width < 8 ? 16: 8}>
                <Grid centered>
                    <Grid.Row>
                        <Header size='huge' textAlign='center'>Your Squads</Header>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <SquadsList size={size} remainingToonsBaseId={remainingToonsBaseId} account={account} units={units} toon={toon} squads={squads} categories={categories} tag={tag} setTag={setTag} unique={unique} setUnique={setUnique} session={session} setSquads={setSquads} onSquadClick={onSquadClick} displayMessage={displayMessage} defaultTag={defaultTag} nicknames={nicknames}/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Grid.Column>
            <Grid.Column width={width < 8 ? 16: 8}>
                <Grid centered>
                    <Grid.Row>
                        <Header size='huge' textAlign='center'>Add New Squad</Header>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                        <Form>
                            <Form.Group widths={'equal'}>
                                <Form.Field>
                                    <Button.Group>
                                        <Button onClick={toggleActive} color={toon ? 'blue' : 'grey'}>Toon</Button>
                                        <Button.Or />
                                        <Button onClick={toggleActive} color={!toon ? 'blue' : 'grey'}>Ship</Button>
                                    </Button.Group>
                                </Form.Field>

                                <Form.Dropdown
                                    fluid
                                    placeholder='Tags'
                                    multiple
                                    search
                                    selection
                                    options={tagOptions}
                                    value={tags}
                                    onChange={handleTagChange}
                                />
                                <Form.Button positive disabled={selectedOptions.length === 0 || tags.length === 0} onClick={() => addNewSquad(selectedOptions, tags, session, account.allyCode, toon, squads, setSelectedOptions, setSquads, displayMessage)}><Icon name='save'></Icon>Save Squad</Form.Button>
                            </Form.Group>
                        </Form>
                        </Grid.Column>

                    </Grid.Row>

                    <Grid.Row centered className={`toonList toonList-${size}`}>
                    {
                        toon
                        ?
                        <CharacterList width={width/2} onClick={removeUnitFromSquad} size={size} unitData={getCreatedSquadData(account, units, toon, selectedOptions)} categories={categories} filter={false}/>
                        :
                        <ShipList onClick={removeUnitFromSquad} size={size} unitData={getCreatedSquadData(account, units, toon, selectedOptions)} categories={categories} filter={false}/>
                    }
                    </Grid.Row>
                    <Grid.Row>
                        {
                            toon
                            ?
                            <CharacterList width={width/2} onClick={addUnitToSquad} size={size} unitData={getCharacterData(getRemainingCharacters(), units)} categories={categories} defaultSort='power' nicknames={nicknames} />
                            :
                            <ShipList onClick={addUnitToSquad} size={size} unitData={getShipData(getRemainingCharacters(), units)} categories={categories} defaultSort='power' nicknames={nicknames} />
                        }
                    
                    </Grid.Row>
                </Grid>
            </Grid.Column>
        </Grid.Row>
    </Grid>
}

export default Squads;
