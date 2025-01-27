import React, { useState } from 'react';
import { Form, Grid, Icon, List } from 'semantic-ui-react';
import CharacterList from './CharacterList';
import ShipList from './ShipList';
import { getCreatedSquadData } from '../../utils/index.js'
import { deleteSquad } from '../../server/squads';
import { tagOptions } from '../../utils/constants.js';

function SquadsList({ remainingToonsBaseId = null, size = 'normal', account, units, combatType = 1, toon = true, squads, categories, tag, setTag, unique, setUnique, session, setSquads = (squads) => { }, displayDelete = true, onSquadClick = () => { }, displayMessage, defaultTag, nicknames }) {

    const [selectedOptions, setSelectedOptions] = useState([])
    const [filterUnusable, setFilterUnusable] = useState(false)

    const handleChange = (e, obj) => {
        console.log('here')
        let newSquad = obj.value
        setSelectedOptions(newSquad)
    }

    const handleDeleteClick = (e) => {
        if (displayDelete) {
            let id = e.target.id
            deleteSquad(id, account.allyCode, session, displayMessage, squads, setSquads)
        }
    }

    const filterUnits = () => {
        let combatType = toon ? 1 : 2
        return units
            .filter(unit => unit.combatType === combatType)
            .sort((a,b) => a.nameKey.localeCompare(b.nameKey))
            .map(unit => {
                return {
                    key: unit.baseId,
                    text: unit.nameKey,
                    value: unit.baseId,
                    combattype: unit.combatType
                }
            })
    }

    const customSearch = (options, text) => {
        let search = text.trim().toLocaleLowerCase()
        let filteredNicknames = Object.keys(nicknames.nicknames).filter(nickname => nickname.includes(search))
        let filteredBaseId = filteredNicknames.map(nickname => nicknames.nicknames[nickname])
        return options.filter(option => {
            return filteredBaseId.includes(option.value) || 
                option.text.toLocaleLowerCase().includes(search)
            })
    }

    const displaySquadList = () => {
        let combatType = toon ? 1 : 2
        return squads
            .filter(squad => {
                return squad.combatType === combatType
            })
            .filter(squad => {
                return selectedOptions.every(baseId => squad.squad.includes(baseId))
            })
            .filter(squad => {
                return tag === '' || squad.tags.includes(tag)
            })
            .filter(squad => {
                if(filterUnusable && remainingToonsBaseId !== null) {
                    return squad.squad.every(baseId => remainingToonsBaseId.includes(baseId))
                }
                return true
            })
            .map(squad => {
                let unavailableToons = remainingToonsBaseId ? squad.squad.map(baseId => !remainingToonsBaseId.includes(baseId)) : null
                let id = squad._id
                return (
                    <List.Item key={id} id={id} onClick={onSquadClick}>
                        <List.Content floated='left'>
                            {
                                toon
                                ?
                                <CharacterList size={size} killList={unavailableToons} unitData={getCreatedSquadData(account, units, toon, squad.squad)} categories={categories} filter={false} />
                                :
                                <ShipList id={id} onClick={onSquadClick} size={size} killList={unavailableToons} unitData={getCreatedSquadData(account, units, toon, squad.squad)} categories={categories} filter={false} />
                            }
                        </List.Content>
                        {
                        displayDelete
                        ?
                        <List.Content floated='right' onClick={handleDeleteClick}>
                            <Icon link size='big' name='trash alternate' id={id}/>
                        </List.Content>
                        :
                        ''
                        }
                    </List.Item>
                )
            })
    }

    return <Grid centered>
        <Grid.Row>
            <Grid.Column>
            <Form>
                <Form.Group widths={'equal'}>
                    <Form.Dropdown
                        fluid
                        placeholder='Units'
                        multiple
                        search={customSearch}
                        selection
                        clearable
                        onChange={handleChange}
                        value={selectedOptions}
                        options={filterUnits()}
                    />
                    <Form.Dropdown
                        fluid
                        placeholder='Tag'
                        search
                        selection
                        clearable
                        options={tagOptions}
                        value={tag}
                        onChange={(_, obj) => setTag(obj.value)}
                        disabled={defaultTag !== ''}
                    />

                </Form.Group>
                <Form.Group>
                <Form.Checkbox
                        label='Unique'
                        value={unique}
                        onChange={() => setUnique(!unique)}
                    />
                    {
                        remainingToonsBaseId === null
                        ?
                        ''
                        :
                        <Form.Checkbox
                        label='Filter Unusable'
                        value={filterUnusable}
                        onChange={() => setFilterUnusable(!filterUnusable)}
                    />
                    }

                </Form.Group>
            </Form>
            </Grid.Column>

        </Grid.Row>
        <Grid.Row>
            <List selection>
                {displaySquadList()}
            </List>
        </Grid.Row>

    </Grid>
}

export default SquadsList;
