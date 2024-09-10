import React, { useEffect, useState, useCallback } from 'react';
import { Header, Grid, List, Form, Icon, Button, Input, Ref, GridColumn } from 'semantic-ui-react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import { getDatacronTests, updateDatacronTests, defaultGuildChecklistState } from '../../server/datacrons';
import { isValidDatacronTest, getSetFromTest } from '../../utils/datacrons';
import '../../App.css'
import { stats } from '../../utils/constants.js'

function DatacronChecklist({redirect, guild, isOfficer, datacrons, session, displayMessage}){

    const defaultDatacronState = {_id: '', title: '', alignment: '', faction: '', character: '', stats: []}
    const defaultStatState = {stat: '', type: '', min: undefined, max: undefined}

    const [datacron, setDatacron] = useState(defaultDatacronState)
    const [sendingRequest, setSendingRequest] = useState(false)
    const [guildDatacronTest, setGuildDatacronTest] = useState(defaultGuildChecklistState)

    useEffect(() => {
		(async () => {
			redirect('datacronChecklist')
            setGuildDatacronTest(await getDatacronTests(session, guild.id, displayMessage))
		})()
	}, [redirect, guild.id, session, displayMessage])

    const updateGuildDatacronChecklist = useCallback(() => {
        let newGuildDatacronTest = JSON.parse(JSON.stringify(guildDatacronTest))
        Object.keys(newGuildDatacronTest).forEach(key => {
            let datacronList = newGuildDatacronTest[key].list
            datacronList.forEach((item, index) => {
                if(datacron._id === item._id) {
                    datacronList[index] = datacron
                }
            })
        })
        setGuildDatacronTest(newGuildDatacronTest)
        // eslint-disable-next-line
    }, [datacron])

    useEffect(() => {
        updateGuildDatacronChecklist()
    }, [updateGuildDatacronChecklist])

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
    const [statDropdownOptions, setStatDropdownOptions] = useState([])

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
                    return Object.values(factionTag[0].tag).some(tag => Object.values(elt.tag).some(optionTag => subset(optionTag, tag)))
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

        let statMap = {}
        let targetMap = {}

        // eslint-disable-next-line
        setDatacronImageMap(datacrons.reduce((map, obj) => (map[obj.id] = obj.icon, map), {}))

        datacrons.forEach(datacron => {
            let setId = datacron.id
            let tiers = datacron.tier

            tiers.forEach(tier => {
                if(tier.stats === undefined) return
                tier.stats.forEach(statList => {
                    statList.forEach(stat => {
                        let statType = String(stat.statType)
                        if(statMap[statType]) {
                            statMap[statType].setId.add(setId)
                        } else {
                            statMap[statType] = {
                                id: statType,
                                name: stats[statType].name,
                                setId: new Set([setId])
                            }
                        }
                    })
                })
            })

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

        setStatDropdownOptions(Object.values(statMap))
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

    const datacronFieldsEmpty = () => {
        return datacron.title === '' && (
            datacron.alignment === '' &&
            datacron.faction === '' &&
            datacron.character === '' &&
            datacron.stats.length === 0
        )
    }

    const datacronFieldsPopulated = () => {
        return datacron.title !== '' && (
            datacron.alignment !== '' ||
            datacron.faction !== '' ||
            datacron.character !== '' ||
            datacron.stats.length !== 0
        )
    }

    const handleSubmit = async () => {
        let newGuildDatacronTest = JSON.parse(JSON.stringify(guildDatacronTest))

        // let invalidDatacrons = newGuildDatacronTest.active.list.filter(test => !isValidDatacronTest(test, datacrons))
        // if(invalidDatacrons.length !== 0) {
        //     displayMessage(`You have an invalid datacron test, please fix. [${invalidDatacrons.map(test => test.title).join(',')}]`)
        //     return
        // }

        // only create a new datacron if id doesn't exist and if some fields are populated
        if(!datacron._id && !datacronFieldsEmpty()) {
            if(!datacronFieldsPopulated()) {
                displayMessage("Missing required fields.")
                return
            }
            // if(!isValidDatacronTest(datacron, datacrons)) {
            //     displayMessage("This datacron test is invalid, please fix.")
            //     return
            // }
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
		})
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

    const populateStats = () => {
        return (datacron.stats || []).map((stat, index) => {
            return <Grid key={index} as={Form.Group} columns={5}>
                <Grid.Column
                    computer={4} tablet={8} mobile={16}
                    label={'Stat'}
                    id={`stat:${index}`}
                    as={Form.Dropdown}
                    options={prepareDropdown(filter(statDropdownOptions, 'set'))}
                    selection
                    placeholder='Stat'
                    clearable
                    onChange={handleStatChange}
                    value={stat.stat}
                />
                <Grid.Column
                    computer={4} tablet={8} mobile={16}
                    as={Form.Dropdown}
                    label={'Filter Type'}
                    id={`type:${index}`}
                    options={[{value: "percent", key: "percent", text: "Percent"}, {value: "max", key: "max", text: "Max"}, {value: "has", key: "has", text: "Has"}, {value: "count", key: "count", text: "Count"}]}
                    selection
                    placeholder={'Filter Type'}
                    clearable
                    onChange={handleStatChange}
                    value={stat.type}
                />
                <Grid.Column
                    computer={3} tablet={7} mobile={16}
                    as={Form.Input}
                    label={'Min'}
                    id={`min:${index}`}
                    onChange={handleStatChange}
                    value={stat.min}
                    disabled={["max", "has"].includes(stat.type)}
                />
                <Grid.Column
                    computer={3} tablet={7} mobile={16}
                    as={Form.Input}
                    label={'Max'}
                    id={`max:${index}`}
                    onChange={handleStatChange}
                    value={stat.max}
                    disabled={["max", "has"].includes(stat.type)}
                />
                <GridColumn id={index} width={1} as={Icon} onClick={deleteStat} className='pointer' name={'trash alternate'}/>
            </Grid>
        })
    }

    const addNewStat = () => {
        let newDatacron = JSON.parse(JSON.stringify(datacron))
        newDatacron.stats = newDatacron.stats || []
        newDatacron.stats.push(defaultStatState)
        setDatacron(newDatacron)
    }

    const deleteStat = (e, obj) => {
        let index = obj.id
        let newDatacron = JSON.parse(JSON.stringify(datacron))
        newDatacron.stats?.splice(index, 1)
        setDatacron(newDatacron)
    }

    const handleStatChange = (e, obj) => {
        let [type, index] = obj.id.split(':')
        let value = obj.value
        let newDatacron = JSON.parse(JSON.stringify(datacron))
        newDatacron.stats[index][type] = value
        setDatacron(newDatacron)
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
                return <div key={index} style={{borderRadius: 5, border: '1px solid grey', margin: 5, padding: 5, backgroundColor: 'lightgrey'}}>
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
                                                    <b id={datacron._id}>{`${datacron.title} (Set ${getSetFromTest(datacron, datacrons)[0] || 'Expired'})`}</b>
                                                </List.Content>
                                                <List.Content floated='right' onClick={handleDelete} hidden={!isOfficer()}>
                                                    <Icon link name='trash alternate' id={datacron._id}></Icon>
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

            <Header>
                Bonuses
            </Header>

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

            <Header>
                Stats
            </Header>

            {populateStats()}

            <List>
                <List.Item onClick={addNewStat} disabled={!isOfficer()}>
                    <List.Content>
                        <List.Header as='a' className='pointer'><Icon name='plus'></Icon>Add Stat</List.Header>
                    </List.Content>
                </List.Item>
            </List>
            
			<Form.Field>
			<Button color='green' loading={sendingRequest} disabled={!isOfficer() || sendingRequest}><Icon name='save'></Icon> Save</Button>
			</Form.Field>
		</Form>
		</Grid.Column>
		</Grid>
	</div>
}

export default DatacronChecklist;