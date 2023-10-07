import React, { useEffect, useState, useCallback } from 'react';
import { Header, Grid, List, Form, Icon, Button, Input, Ref } from 'semantic-ui-react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import { getDatacronTests, updateDatacronTests, defaultGuildChecklistState } from '../../server/datacrons';
import { isValidDatacronTest } from '../../utils/datacrons';

function DatacronChecklist({redirect, guild, isOfficer, datacrons, session, displayMessage}){

    const defaultDatacronState = {_id: '', title: '', alignment: '', faction: '', character: ''}

    const [datacron, setDatacron] = useState(defaultDatacronState)
    const [sendingRequest, setSendingRequest] = useState(false)
    const [guildDatacronTest, setGuildDatacronTest] = useState(defaultGuildChecklistState)

    useEffect(() => {
		(async () => {
			redirect('datacronChecklist')
            setGuildDatacronTest(await getDatacronTests(session, guild.id, displayMessage))
		})()
	}, [redirect, guild.id, session, displayMessage])

    function guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    const [datacronImageMap, setDatacronImageMap] = useState({})

    const [alignmentDropdownOptions, setAlignmentDropdownOptions] = useState([])
    const [alignmentBonusDropdownOptions, setAlignmentBonusDropdownOptions] = useState([])
    const [factionDropdownOptions, setFactionDropdownOptions] = useState([])
    const [factionBonusDropdownOptions, setFactionBonusDropdownOptions] = useState([])
    const [characterDropdownOptions, setCharacterDropdownOptions] = useState([])
    const [characterBonusDropdownOptions, setCharacterBonusDropdownOptions] = useState([])

    const [datacronSet, setDatacronSet] = useState('')
    const [alignment, setAlignment] = useState('')
    const [faction, setFaction] = useState('')
    const [character, setCharacter] = useState('')

    const handleDatacronSetDropdownChange = (e, obj) => {
        setDatacronSet(obj.value)
    }
    const handleAlignmentDropdownChange = (e, obj) => {
        setAlignment(obj.value)
    }
    const handleFactionDropdownChange = (e, obj) => {
        setFaction(obj.value)
    }
    const handleCharacterDropdownChange = (e, obj) => {
        setCharacter(obj.value)
    }

    const filter = (options, level) => {
        let filteredList = options
        switch(level) {
            case 'character':
                filteredList = filteredList.filter(elt => {
                    let characterTag = characterDropdownOptions.filter(op => op.id === character)
                    if(characterTag.length === 0) return true
                    return elt.id.includes(characterTag[0].id)
                })
            // eslint-disable-next-line
            case 'faction':
                filteredList = filteredList.filter(elt => {
                    let factionTag = factionDropdownOptions.filter(op => op.id === faction)
                    if(factionTag.length === 0) return true
                    return Object.values(factionTag[0].tag).some(tag => Object.values(elt.tag).some(optionTag => subset(tag, optionTag)))
                })
            // eslint-disable-next-line
            case 'alignment':
                filteredList = filteredList.filter(elt => {
                    let alignmentTag =  alignmentDropdownOptions.filter(op => op.id === alignment)
                    if (alignmentTag.length === 0) return true
                    return Object.values(alignmentTag[0].tag).some(tag => Object.values(elt.tag).some(optionTag => subset(tag, optionTag)))
                })
            // eslint-disable-next-line
            case 'set':
                filteredList = filteredList.filter(elt => datacronSet === '' || elt.setId.has(datacronSet))
                break
            default:
                filteredList = []
        }
        return filteredList
    }

    const subset = (a,b) => {
        let first = [...a]
        let second = [...b]
        return first.every(elt => second.includes(elt))
    }

    const prepareDropdown = (list) => {
        return list
        .sort((a,b) => {
            if(typeof a.id === 'number') {
                return a.id - b.id
            }
            return a.name?.localeCompare(b.name)
        })
        .map(elt => {
            let image = datacronImageMap[elt.id] ? { avatar: true, src: `${datacronImageMap[elt.id]}.png`} : undefined
            return {
                key: elt.id,
                value: elt.id,
                text: elt.name,
                image: image
            }
        })

    }

    const populateMap = (map, bonuses) => {
        bonuses.forEach(arr => {
            arr.forEach(bonus => {
                let key = bonus.targetRule
                if(map[key]) {
                    map[key].setId.add(bonus.setId)
                    map[key].tag[bonus.setId] = bonus.tag
                } else {
                    map[key] = {
                        id: key,
                        setId: new Set([bonus.setId]),
                        name: bonus.categoryName,
                        tag: {}
                    }
                    map[key].tag[bonus.setId] = bonus.tag
                }
            })
        })
    }

    const populateBonusMap = (map, bonuses) => {
        bonuses.forEach(arr => {
            arr.forEach(bonus => {
                let key = bonus.key
                if(map[key]) {
                    map[key].setId.add(bonus.setId)
                    map[key].tag[bonus.setId] = bonus.tag
                } else {
                    map[key] = {
                        id: key,
                        setId: new Set([bonus.setId]),
                        name: bonus.value,
                        tag: {}
                    }
                    map[key].tag[bonus.setId] = bonus.tag
                }
            })
        })
    }

    const parseDatacronData = useCallback(() => {
        if(datacrons === undefined || Object.keys(datacrons).length === 0) return
        let alignmentMap = {}
        let factionMap = {}
        let characterMap = {}

        let alignmentBonusMap = {}
        let factionBonusMap = {}
        let characterBonusMap = {}

        let targetMap = {}

        // eslint-disable-next-line
        setDatacronImageMap(datacrons.reduce((map, obj) => (map[obj.id] = obj.icon, map), {}))

        datacrons.forEach(datacron => {
            let tiers = datacron.tier

            tiers.forEach(tier => {
                if(tier.bonuses === undefined) return
                tier.bonuses.forEach(bonusGroup => {
                    bonusGroup.forEach(bonus => {
                        targetMap[bonus.targetRule] = bonus.categoryName
                    })                    
                })
            })

            populateMap(alignmentMap, tiers[2].bonuses)
            populateBonusMap(alignmentBonusMap, tiers[2].bonuses)
            populateMap(factionMap, tiers[5].bonuses)
            populateBonusMap(factionBonusMap, tiers[5].bonuses)
            populateMap(characterMap, tiers[8].bonuses)
            populateBonusMap(characterBonusMap, tiers[8].bonuses)
        })

        setAlignmentDropdownOptions(Object.values(alignmentMap))
        setAlignmentBonusDropdownOptions(Object.values(alignmentBonusMap))
        setFactionDropdownOptions(Object.values(factionMap))
        setFactionBonusDropdownOptions(Object.values(factionBonusMap))
        setCharacterDropdownOptions(Object.values(characterMap))
        setCharacterBonusDropdownOptions(Object.values(characterBonusMap))
    }, [datacrons])

	useEffect(() => {
        parseDatacronData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parseDatacronData])

    const handleNewDatacronClick = () => {
        setDatacron(defaultDatacronState)
    }

    const datacronFieldsPopulated = () => {
        return datacron.name !== '' && (
            datacron.alignment !== '' ||
            datacron.faction !== '' ||
            datacron.character !== ''
        )
    }

    const handleSubmit = async () => {
        let newGuildDatacronTest = JSON.parse(JSON.stringify(guildDatacronTest))
        if(!isValidDatacronTest(datacron, datacrons)) {
            displayMessage("This datacron test is invalid, please fix.")
            return
        }
        if(newGuildDatacronTest.active.list.some(test => !isValidDatacronTest(test, datacrons))) {
            displayMessage("You have an invalid datacron test, please fix.")
            return
        }
        // only create a new datacron if id doesn't exist and if some fields are populated
        if(!datacron._id && datacronFieldsPopulated()) {
            let newDatacron = JSON.parse(JSON.stringify(datacron))
            newDatacron._id = guidGenerator()
            newGuildDatacronTest['active'].list.push(newDatacron)
            setDatacron(newDatacron)
            setGuildDatacronTest(newGuildDatacronTest)
        }
        
        setSendingRequest(true)
        await updateDatacronTests(session, guild.id, newGuildDatacronTest, displayMessage)
        setSendingRequest(false)
    }

    const handleDelete = async (e) => {
        let id = e.target.id
        let newGuildDatacronTest = JSON.parse(JSON.stringify(guildDatacronTest))
        Object.keys(newGuildDatacronTest).forEach(key => {
            let list = newGuildDatacronTest[key].list
            list.forEach((datacron, index) => {
                if(datacron._id === id) {
                    list.splice(index, 1)
                }
            })
        })
        setGuildDatacronTest(newGuildDatacronTest)
        setSendingRequest(true)
        await updateDatacronTests(session, guild.id, newGuildDatacronTest, displayMessage)
        setSendingRequest(false)
    }

    
    const handleChange = (e, obj) => {
        const { id, value } = obj;
		setDatacron({
			...datacron,
			[id]: value,
		});
        let newGuildDatacronTest = JSON.parse(JSON.stringify(guildDatacronTest))
        Object.keys(newGuildDatacronTest).forEach(key => {
            newGuildDatacronTest[key].list.forEach(item => {
                if(datacron._id === item._id) {
                    item[id] = value
                }
            })
        })
        setGuildDatacronTest(newGuildDatacronTest)
    }

    const displayDatacron = (e) => {
        let id = e.target.id
        let currentDatacron = Object.keys(guildDatacronTest).map(key => guildDatacronTest[key].list.find(item => item._id === id)).filter(item => item)[0]
        setDatacronSet('')
        setAlignment('')
        setFaction('')
        setCharacter('')
        setDatacron(currentDatacron)
    }

	return <div>
		<Header size='huge' textAlign='center'>Datacron Checklist</Header>
		<Grid>

		<Grid.Column width={4}>
        <List>
        <List.Item onClick={handleNewDatacronClick} value='new' disabled={!isOfficer()} key='new'>
        <List.Content>
            <List.Header as='a'><Icon name='plus'></Icon>New</List.Header>
            </List.Content>
            </List.Item>
        </List>
        <DragDropContext onDragEnd={(result) => {
            let {source, destination} = result

            if(!destination) return
            
            if(source.droppableId === destination.droppableId && source.index === destination.index) return

            let oldIndex = source.index
            let newIndex = destination.index
            let oldList = source.droppableId
            let newList = destination.droppableId

            let newGuildDatacronTest = JSON.parse(JSON.stringify(guildDatacronTest))

            let elementToMove = newGuildDatacronTest[oldList].list.splice(oldIndex, 1)[0]
            newGuildDatacronTest[newList].list.splice(newIndex, 0, elementToMove)
            setGuildDatacronTest(newGuildDatacronTest)
        }}>
            {Object.keys(guildDatacronTest).map((key, index) => {
                let group = guildDatacronTest[key]
                return <div style={{borderRadius: 5, border: '1px solid grey', margin: 5, padding: 5, backgroundColor: 'lightgrey'}}>
                    <h4 style={{margin: 0}}>{group.title}</h4>
                    <Droppable droppableId={key} key={key}>
                    {(provided) => (
                            <Ref innerRef={provided.innerRef}>
                            <List divided relaxed {...provided.droppableProps}>
                            {group.list.map((datacron, index) => {
                                return <Draggable draggableId={`draggable-${datacron._id}`} index={index} key={datacron._id} isDragDisabled={!isOfficer()}>
                                    {(provided) => (
                                        <Ref innerRef={provided.innerRef}>
                                            <List.Item key={datacron._id} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                <List.Content as='a' onClick={displayDatacron} id={datacron._id}>
                                                    <b id={datacron._id}>{datacron.title}</b>
                                                </List.Content>
                                                <List.Content floated='right' onClick={handleDelete} hidden={!isOfficer()}>
                                                    <Icon link textAlign='right' name='trash alternate' id={datacron._id}></Icon>
                                                </List.Content>
                                            </List.Item>
                                        </Ref>
                                    )}
                                </Draggable>
                            })}
                            {provided.placeholder}
                            </List>
                            </Ref>
                    )}
                </Droppable>
                </div>
            })}

        </DragDropContext>
		</Grid.Column>
		<Grid.Column width={12}>
		<Form align='left' onSubmit={handleSubmit}>
			<Form.Field >
				<label>Title</label>
				<Input fluid placeholder='title' id='title' value={datacron.title} onChange={handleChange} disabled={!isOfficer()}></Input>
			</Form.Field>

            Use these four Dropdowns to help you filter between all of the different bonuses so that you can find the ones you are looking for easier.
            <Grid as={Form.Group} columns={4}>
                <Grid.Column 
                    as={Form.Dropdown} 
                    computer={4} tablet={8} mobile={16}
                    label="Datacron Set"
                    options={prepareDropdown(datacrons)}
                    selection
                    placeholder='Datacron Set'
                    clearable
                    onChange={handleDatacronSetDropdownChange}
                    value={datacronSet}
                    />
                <Grid.Column 
                    as={Form.Dropdown}
                    computer={4} tablet={8} mobile={16}
                    label="Alignment"
                    options={prepareDropdown(filter(alignmentDropdownOptions, 'set'))}
                    selection
                    placeholder='Alignment'
                    clearable
                    onChange={handleAlignmentDropdownChange}
                    value={alignment}
                />
                <Grid.Column 
                    as={Form.Dropdown}
                    computer={4} tablet={8} mobile={16}
                    label="Faction"
                    options={prepareDropdown(filter(factionDropdownOptions, 'alignment'))}
                    selection
                    placeholder='Faction'
                    clearable
                    onChange={handleFactionDropdownChange}
                    value={faction}
                    />
                <Grid.Column 
                    as={Form.Dropdown}
                    computer={4} tablet={8} mobile={16}
                    label="Character"
                    options={prepareDropdown(filter(characterDropdownOptions, 'faction'))}
                    selection
                    placeholder='Character'
                    clearable
                    onChange={handleCharacterDropdownChange}
                    value={character}
                />
            </Grid>
            
            <Form.Dropdown
                    label="Alignment Bonus"
                    options={prepareDropdown(filter(alignmentBonusDropdownOptions, 'alignment'))}
                    selection
                    placeholder='Alignment Bonus'
                    id='alignment'
                    clearable
                    onChange={handleChange}
                    value={datacron.alignment}
                    disabled={!isOfficer()}
                />
                <Form.Dropdown
                    label="Faction Bonus"
                    options={prepareDropdown(filter(factionBonusDropdownOptions, 'faction'))}
                    selection
                    placeholder='Faction Bonus'
                    id='faction'
                    clearable
                    onChange={handleChange}
                    value={datacron.faction}
                    disabled={!isOfficer()}
                />
                <Form.Dropdown
                    label="Character Bonus"
                    options={prepareDropdown(filter(characterBonusDropdownOptions, 'character'))}
                    selection
                    placeholder='Character Bonus'
                    id='character'
                    clearable
                    onChange={handleChange}
                    value={datacron.character}
                    disabled={!isOfficer()}
                />
			<Form.Field>
			<Button color='green' loading={sendingRequest} disabled={!isOfficer() || sendingRequest}><Icon name='save'></Icon> Save</Button>
			</Form.Field>
		</Form>
		</Grid.Column>
		</Grid>
	</div>
}

export default DatacronChecklist;