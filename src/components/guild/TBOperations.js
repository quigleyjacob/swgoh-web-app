// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Form, Button, Icon, List, Menu, Segment, Modal, Dropdown, HeaderSubheader, Image } from 'semantic-ui-react';
import '../../App.css'
import './Rote.css'
import CharacterList from '../profile/CharacterList';
import { populateUnitData } from '../../utils/index.js'
import { addOperation, deleteOperation, getIdealPlatoons, getOperation, getOperations, updateOperation } from '../../server/operation.js';
import { getPlatoons } from '../../server/data.js';
import SortableTable from '../displays/SortableTable.js';

function TBOperations({redirect, guildId, session, displayMessage, isOfficer, guild, units}){

    const defaultOperationState = {
        title: '',
        zones: [],
        excludedPlayers: [],
        excludedPlatoons: [],
        previousOperation: '',
        status: true,
        assignments: false,
        dms: false
    }

    const planetNameMap = {
        'DS': ['Burn', 'Mustafar', 'Geonosis', 'Dathomir', 'Haven-class Medical Station', 'Malachor', 'Death Star'],
        'Mix': ['Burn', 'Corellia', 'Felucia', 'Tatooine', 'Kessel', 'Vandor', 'Hoth'],
        'LS': ['Burn', 'Coruscant', 'Bracca', 'Kashyyyk', 'Lothal', 'Ring of Kafrene', 'Scarif'],
        'Bonus': ['Burn', 'Zeffo', 'Mandalore']
    }

    const planets = {
        'Bonus': ['zeffo', 'mandalore'],
        "LS": ["coruscant", "bracca", "kashyyyk", "lothal", "ring-of-kafrene", "scarif"],
        "Mix": ["corellia", "felucia", "tatooine", "kessel", "vandor", "hoth"],
        "DS": ["mustafar", "geonosis", "dathomir", "haven-class-medical-station", "malachor", "death-star"]
    }

    const titleMap = {
        "Bonus": "Bonus",
        "LS": "Light Side",
        "Mix": "Mixed",
        "DS": "Dark Side"
    }

    const [operation, setOperation] = useState(defaultOperationState)
    const [operationId, setOperationId] = useState('new')
    const [operationsList, setOperationsList] = useState([])
	const [sendingRequest, setSendingRequest] = useState(false)
    const [activeMenu, setActiveMenu] = useState('Operation Details')
    const [unitsMap, setUnitsMap] = useState({})
    const [simulation, setSimulation] = useState({})
    const [platoons, setPlatoons] = useState([])
    const [filterCharacterModalOpen, setFilterCharacterModalOpen] = useState(false)
    const [planetDropdownValue, setPlanetDropdownValue] = useState('')
    const [operationDropdownValue, setOperationDropdownValue] = useState('')
    const [previousOperation, setPreviousOperation] = useState(defaultOperationState)
    const [playerDropdownValue, setPlayerDropdownValue] = useState('')

	useEffect(() => {
		(async () => {
			await redirect('tboperations')
            if(session === '') {
                return
            }
            getOperations(guildId, session, displayMessage, setOperationsList)
            getPlatoons(session, displayMessage, setPlatoons)
		})()
	}, [redirect, guildId, session, displayMessage])

    useEffect(() => {
        (async () => {
        if(operation.previousOperation === '') {
            return
        }
        getOperation(operation.previousOperation, guildId, session, displayMessage, setPreviousOperation, () => {})
    })()
    }, [displayMessage, guildId, operation, session])

    useEffect(() => {
        // eslint-disable-next-line
        setUnitsMap(units.reduce((map, obj) => (map[obj.baseId] = obj, map), {}))
    }, [units])

    const getPlanetHeader = (zoneId) => {
        let arr = zoneId.split(':')
        let alignment = arr[0]
        let phase = arr[1]
        return `${planetNameMap[alignment][phase]} (${titleMap[alignment]})`
    }

    const getIcon = (zoneId, number) => {
        let operationId = `${zoneId}:${number}`
        if(simulation?.operations.includes(operationId)) {
            return {name: 'check circle', color: 'green'}
        }
        if(simulation?.skippedOperations.includes(operationId)) {
            return {name: 'warning circle', color: 'yellow'}
        }
        if(simulation?.remainingOperations.includes(operationId)) {
            return {name: 'times circle', color: 'red'}
        }
        return {}
    }

    const handleNewOperationClick = () => {
        setOperationId('new')
        setOperation(defaultOperationState)
        setPreviousOperation(defaultOperationState)
        setSimulation({})
    }

    const displayCommand = async (e) => {
        let operationId = e.target.id
        setSimulation({})
        getOperation(operationId, guildId, session, displayMessage, setOperation, setOperationId)
    }

    const getPreviousOperationInclusionList = () => {
        if(operation.previousOperation === '') {
            return []
        }
        let previousOperationExcludedPlatoons = previousOperation.excludedPlatoons

        let commonZones = operation.zones.filter(value => previousOperation.zones.includes(value))
        if(commonZones.length === 0) {
            return []
        }
        let operationList = commonZones.map(zoneId => {
            return [1,2,3,4,5,6].reduce((arr, operation) => {
                let operationId = `${zoneId}:${operation}`
                if(previousOperationExcludedPlatoons.some(platoonId => platoonId.includes(operationId))) {
                    if(!previousOperationExcludedPlatoons.includes(operationId)) {
                        // add complement of platoons included
                        let excludedPlatoonsInOperation = previousOperationExcludedPlatoons.filter(platoonId => platoonId.includes(operationId))
                        let includedPlatoonsInOperation = [1,2,3].map(row => [1,2,3,4,5].map(slot => `${operationId}:${row}:${slot}`)).flat().filter(id => !excludedPlatoonsInOperation.includes(id))
                        return [...arr, ...includedPlatoonsInOperation]
                    } else {
                        // entire platoon was excluded last phase, included this phase
                        return arr
                    }
                } else {
                    // no mention of this operation in exclusion, so was completely filled last phase
                    return [...arr, operationId]
                }
            }, [])
        }).flat()
        return operationList
    }



    const handleDeleteClick = async (e, target) => {
        setSendingRequest(true)
        let operationIdToDelete = e.target.id
        if(operationId === operationIdToDelete) {
            setOperation(defaultOperationState)
            setPreviousOperation(defaultOperationState)
            setOperationId('new')
        }
        deleteOperation(operationIdToDelete, guildId, session, displayMessage, operationsList, setOperationsList)
        setSendingRequest(false)
    }

    const listOperations = () => {
        return operationsList
            .sort((a,b) => a.title.localeCompare(b.title))
            .map(operation => {
            return <List.Item key={operation._id}>
            <List.Content as='a' onClick={displayCommand} id={operation._id}>
                <b id={operation._id}>{operation.title}</b>
            </List.Content>
            <List.Content floated='right' onClick={handleDeleteClick} hidden={!isOfficer()}>
                <Icon link name='trash alternate' id={operation._id}></Icon>
            </List.Content>
            </List.Item>
        })
    }

    const listGuildMembers = () => {
        return guild?.member?.map(member => {
            return {
                key: member.allyCode,
                value: member.allyCode,
                text: member.playerName
            }
        }) || []
    }

    const setActivePlanets = (type, planet) => {
        if(!isOfficer()) {
            return
        }
        let newOperation = JSON.parse(JSON.stringify(operation))
        let clickedZoneId = `${type}:${planet}`
        // if clicked on selected zoneId, should remove it
        if(newOperation.zones.includes(clickedZoneId)) {
            newOperation.zones = newOperation.zones.filter(zoneId => zoneId !== clickedZoneId)
            newOperation.excludedPlatoons = newOperation.excludedPlatoons.filter(id => !id.includes(clickedZoneId))
            setOperation(newOperation)
            return
        }
        //if LS, Mix, or DS is already in the list, it should be removed
        if(['LS', 'Mix', 'DS'].includes(type)) {
            newOperation.zones = newOperation.zones.filter(zoneId => !zoneId.includes(type))
            newOperation.excludedPlatoons = newOperation.excludedPlatoons.filter(id => !id.includes(type))
        }
        if(newOperation.zones.includes(clickedZoneId)) {
            
        } else {
            newOperation.zones.push(clickedZoneId)
        }
        setOperation(newOperation)
    }

    const handleCheckmarkChange = (operationId) => {
        let newOperation = JSON.parse(JSON.stringify(operation))
        // in either case, we want to remove all currently existing platoon id in the list
        newOperation.excludedPlatoons = newOperation.excludedPlatoons.filter(platoonId => !platoonId.includes(operationId))
        if(isCheckmarkChecked(operationId)) {
            // we need to add all exluded platoons to the list
            newOperation.excludedPlatoons.push(operationId)
        }
        setOperation(newOperation)
    }

    const isCheckmarkChecked = (operationId) => {
        if(operation.excludedPlatoons.includes(operationId)) {
            return false
        }
        let previousOperationInclusionList = getPreviousOperationInclusionList()
        if(previousOperationInclusionList.includes(operationId)) {
            return false
        }
        let allExcluded = true
        for(let i = 1; i <= 3; ++i) {
            for(let j = 1; j <= 5; ++j) {
                let platoonId = `${operationId}:${i}:${j}`
                if(!operation.excludedPlatoons.includes(platoonId) && !previousOperationInclusionList.includes(platoonId)) {
                    allExcluded = false
                }
            }
        }
        return !allExcluded
    }

    const handleChange = (e, target) => {
        let newOperation = JSON.parse(JSON.stringify(operation))
        newOperation[target.id] = target.value
        setOperation(newOperation)
    }

    const submitOperation = async () => {
        setSendingRequest(true)
        if(operationId === 'new') {
            await addOperation(guildId, session, operation, displayMessage, operationsList, setOperationsList, setOperationId)
        } else {
            await updateOperation(operationId, guildId, session, operation, displayMessage)
        }
        setSendingRequest(false)
    }

    const runOperation = async () => {
        if(guild.rosterMap === undefined || Object.keys(guild.rosterMap).length === 0) {
            displayMessage('You have not loaded your guild member rosters. Please run Load Guild Member Rosters before running operations.')
            return
        }
        setSendingRequest(true)
        await getIdealPlatoons(guildId, session, 'ROTE', operation, unitsMap, displayMessage, setSimulation)
        setSendingRequest(false)
    }

    const openFilterCharacterModal = () => {
        setPlanetDropdownValue('')
        setOperationDropdownValue('')
        setFilterCharacterModalOpen(true)
    }

    const getPlanetDropdownOptions = () => {
        return operation.zones.map(zoneId => {            
            return {
                key: zoneId,
                text: getPlanetHeader(zoneId),
                value: zoneId
            }
        })
    }

    const getOperationDropdownOptions = () => {
        return [1,2,3,4,5,6]
            .map(operation => {
                return {
                    key: operation,
                    text: `Operation ${operation}`,
                    value: operation
                }
            })
    }

    const getPlayerDropdownOptions = () => {
        return simulation?.optimalPlacement.map(member => {
            let assignmentsString = Object.keys(member.placements).map(zoneId => member.placements[zoneId].length).join('/')
            let total = Object.keys(member.placements).reduce((sum, zoneId) => {
                return sum + member.placements[zoneId].length
            }, 0)
            return {
                key: member.allyCode,
                value: member.allyCode,
                text: `${member.name} (${assignmentsString})`,
                total
            }
        })
        .sort((a,b) => b.total - a.total)
    }

    const getPreviousOperationDropdownOptions = () => {
        return operationsList
            .filter(operation => operation._id !== operationId)
            .map(({_id, title}) => {
                return {
                    key: _id,
                    text: title,
                    value: _id
                }
            })
    }

    const displayCurrentMenu = () => {
        switch(activeMenu) {
            case "Operation Details":
                return displayOperationWithDropdowns(displayOperationDetails)
            case "Player Details":
                let player = simulation?.optimalPlacement.find(member => member.allyCode === playerDropdownValue)
                return <Grid centered>
                    <Grid.Row>
                        <Form>
                            <Form.Field
                                label="Player"
                                placeholder="Player"
                                control={Dropdown}
                                selection
                                clearable
                                search
                                value={playerDropdownValue}
                                options={getPlayerDropdownOptions()}
                                onChange={(_, obj) => setPlayerDropdownValue(obj.value)}
                            />
                        </Form>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid centered>
                            {displayPlayerPlacements(player)}
                        </Grid>
                    </Grid.Row>
                </Grid>
            case 'Delta Details':
                return displayDeltas()
            default:
                return <div></div>

        }
    }

    const displayOperationWithDropdowns = (displayStrategy) => {
        return  <Grid>
            <Grid.Row centered>
            <Form>
                <Form.Group widths={'equal'}>
                    <Form.Field
                        label="Planet"
                        placeholder="Planet"
                        control={Dropdown}
                        selection
                        clearable
                        search
                        value={planetDropdownValue}
                        options={getPlanetDropdownOptions()}
                        onChange={(_, obj) => setPlanetDropdownValue(obj.value)}
                    />
                    <Form.Field
                        label="Operation"
                        placeholder="Operation"
                        control={Dropdown}
                        selection
                        clearable
                        search
                        value={operationDropdownValue}
                        options={getOperationDropdownOptions()}
                        onChange={(_, obj) => setOperationDropdownValue(obj.value)}
                    />
                </Form.Group>
            </Form>
            </Grid.Row>
            <Grid.Row>
                <Grid centered>
                {displayStrategy()}
                </Grid>
            </Grid.Row>
        </Grid>
    }

    const displayOperationDetails = () => {
        if(planetDropdownValue !== '' && operationDropdownValue !== '') {
            let planet = simulation.pivot[planetDropdownValue]
            if(operationDropdownValue > planet.length) {
                return
            }
            return displayOperation(planet[operationDropdownValue-1])
        }
    }

    const displayOperation = (operation, onClick = () => {}) => {
        return operation.map((row, index) => {
            let unitData = row.map(slot => {
                let isAssigned = Object.keys(slot).length > 0 && slot.allyCode !== undefined
                let unit = isAssigned ? populateUnitData([guild.rosterMap[slot.allyCode].rosterMap[slot.defId]], unitsMap)[0] : slot
                unit.requirement = !isAssigned
                if(isAssigned) {
                    unit.nameKey = slot.playerName
                }
                return unit
            })
            let killList = row.map(slot => slot.disabled)
            return <Grid.Row><CharacterList key={index} unitData={unitData} filter={false} size='normal' killList={killList} onClick={onClick}/></Grid.Row>
        })
    }

    const displayOperationFiltering = () => {
        if(planetDropdownValue !== '' && operationDropdownValue !== '') {
            let operationId = `${planetDropdownValue}:${operationDropdownValue}`
            let filteredPlatoons = platoons.filter(platoon => {
                let platoonOperationId = `${platoon.alignment}:${platoon.phase}:${platoon.operation}`
                return platoonOperationId === operationId
            })
            let previousOperationInclusionList = getPreviousOperationInclusionList()
            let visibleOperation = [];
            [1,2,3].forEach(row => {
                visibleOperation.push([])
                let platoonsInRow = filteredPlatoons.filter(platoon => platoon.row === row).sort((a,b) => a.slot - b.slot)
                platoonsInRow.forEach(platoon => {
                    let platoonCopy = JSON.parse(JSON.stringify(platoon))
                    let platoonId = `${operationId}:${platoon.row}:${platoon.slot}`
                    platoonCopy.thumbnail = unitsMap[platoonCopy.defId].thumbnailName
                    platoonCopy.nameKey = unitsMap[platoonCopy.defId].nameKey
                    platoonCopy.combatType = unitsMap[platoonCopy.defId].combatType
                    platoonCopy.currentRarity = 7
                    platoonCopy.currentLevel = 85
                    platoonCopy.disabled = operation.excludedPlatoons.includes(platoonId) || operation.excludedPlatoons.includes(operationId) || previousOperationInclusionList.includes(platoonId) || previousOperationInclusionList.includes(operationId)
                    visibleOperation[platoon.row-1].push(platoonCopy)
                })
            })

            const filterCharacter = (platoonId) => {
                let operationId = platoonId.split(':').slice(0,3).join(':')
                if(previousOperationInclusionList.includes(platoonId) || previousOperationInclusionList.includes(operationId)) {
                    return
                }
                let operationCopy = JSON.parse(JSON.stringify(operation))
                let platoonIdList = [1,2,3].map(row => [1,2,3,4,5].map(slot => `${operationId}:${row}:${slot}`)).flat()
                if(operation.excludedPlatoons.includes(platoonId)) {
                    // if platoon id is present, just add it
                    operationCopy.excludedPlatoons = operationCopy.excludedPlatoons.filter(id => id !== platoonId)
                } else if(operation.excludedPlatoons.includes(operationId)) {
                    // need to add all other 14 platoons and exclude our platoon id
                    let platoonIdListToAdd = platoonIdList.filter(id => id !== platoonId)
                    operationCopy.excludedPlatoons = [...operationCopy.excludedPlatoons.filter(id => id !== operationId), ...platoonIdListToAdd]
                } else {
                    operationCopy.excludedPlatoons = [...operationCopy.excludedPlatoons, platoonId]
                }
                // if all 15 platoonId are present, remove them all and replace with operationId instead
                if(platoonIdList.every(id => operationCopy.excludedPlatoons.includes(id))) {
                    operationCopy.excludedPlatoons = operationCopy.excludedPlatoons.filter(id => !platoonIdList.includes(id))
                    operationCopy.excludedPlatoons.push(operationId)
                }
                setOperation(operationCopy)
            }
            return displayOperation(visibleOperation, filterCharacter)
        }
    }

    const displayPlayerPlacements = (player) => {
        if(playerDropdownValue !== '') {
            return Object.keys(player.placements).map(zoneId => {
                let zonePlacements = player.placements[zoneId]
                let header = getPlanetHeader(zoneId)
                let unitData = populateUnitData(zonePlacements.map(placement => {
                    return guild.rosterMap[player.allyCode].rosterMap[placement.defId]
                }), unitsMap)
                if(zonePlacements.length > 0) {
                    return <Grid.Row>
                        <Grid centered>
                            <Grid.Row>
                                <Header>{header}
                                    <HeaderSubheader>
                                        {`${zonePlacements.length}/10`}
                                    </HeaderSubheader>
                                </Header>
                            </Grid.Row>
                            <Grid.Row>
                                <CharacterList unitData={unitData} filter={false} size='normal'/>
                            </Grid.Row>
                        </Grid>
                    </Grid.Row>
                }
                return ''
            })
        }
    }

    const displayDeltas = () => {
        let meta = [
            {text: "Name", key: 'defId', textAlign: 'left'},
			{text: "Delta", key: 'delta'},
			{text: "Guild Has", key: 'numHave'},
			{text: "Guild Needs", key: 'numNeeded'}
        ]
        let row = simulation.deltaList
        let defaultSort={column: 'galacticPower', direction: 'descending'}
        let render = {
            'defId': (row) => {
                let unit = {
                    thumbnail: unitsMap[row.defId].thumbnailName,
                    nameKey: unitsMap[row.defId].nameKey,
                    combatType: unitsMap[row.defId].combatType,
                    currentRarity: 7,
                    currentLevel: 85
                }
                let thumbnail=unitsMap[row.defId].thumbnailName
                return <Header as='h4' textAlign='left'>
                    <Image src={`https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${thumbnail}.png`} size='medium' circular/>
                    <Header.Content>
                        {unit.nameKey}
                    </Header.Content>
                </Header>
            }
        }
        return <SortableTable meta={meta} row={row} render={render} fixed sortable defaultSort={defaultSort}/>
    }

    // eslint-disable-next-line
    const getCheckboxValue = (name) => {
        let defaultValue = name === 'status'
        let value = operation[name]
        if(value === undefined) {
            let newOperation = JSON.parse(JSON.stringify(operation))
            newOperation[name] = defaultValue
            setOperation(newOperation)
            return defaultValue
        }
        return value
    }

    const setCheckboxValue = (name) => {
        let defaultValue = name === 'status'
        let currentValue = operation[name] === undefined ? defaultValue : operation[name]
        let newOperation = JSON.parse(JSON.stringify(operation))
        newOperation[name] = !currentValue
        setOperation(newOperation)
    }

    const getActivePlanets = () => {
        return operation.zones
    }

    const isEmpty = () => {
        return operation.title === '' || operation.zones.length === 0
    }

	return <div>
		<Header size='huge' textAlign='center'>TB Operations</Header>
		<Grid centered>
            <Grid.Column width={4}>
                <List divided relaxed>
                    <List.Item onClick={handleNewOperationClick} value='new' disabled={!isOfficer()} key='new'>
                    <List.Content>
                        <List.Header as='a'><Icon name='plus'></Icon>New</List.Header>
                    </List.Content>
                    </List.Item>
                    {listOperations()}
                </List>
            </Grid.Column>
            <Grid.Column width={12}>
                <Grid centered>
                <Grid.Row columns={3}>
                    <Grid.Column>
                        <Form.Input
                            fluid
                            id='title'
                            label='Title'
                            placeholder='Title'
                            value={operation.title}
                            onChange={handleChange}
                            disabled={!isOfficer()}
                        />
                        </Grid.Column>
                        <Grid.Column>
                        <Form.Dropdown
                            disabled={!isOfficer()}
                            fluid
                            id='excludedPlayers'
                            label='Excluded Players'
                            placeholder='Excluded Players'
                            value={operation.excludedPlayers}
                            selection
                            multiple
                            options={listGuildMembers()}
                            onChange={handleChange}
                            search
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <Form.Dropdown
                            disabled={!isOfficer()}
                            fluid
                            id='previousOperation'
                            label='Previous Operation'
                            placeholder='Previous Operation'
                            clearable
                            value={operation.previousOperation}
                            selection
                            options={getPreviousOperationDropdownOptions()}
                            onChange={handleChange}
                            search
                        />
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                        <Grid.Column computer={8} tablet={8} mobile={16}>
                        <div className="wrapper">
                            <div className="roteMap">
                                {
                                    ["DS", "Mix", "LS", "Bonus"]
                                    .map(type => {
                                        return planets[type]
                                        .map((planet, index) => {
                                            return <div key={planet} className={`planet ${planet} ${operation.zones.includes(`${type}:${index+1}`) ? 'activePlanet' : ''}`} onClick={() => setActivePlanets(type, index+1)}></div>
                                        })
                                    }).flat()

                                }
                            </div>
                        </div>
                        </Grid.Column>
                        <Grid.Column computer={8} tablet={8} mobile={16}>
                            {
                                operation.zones
                                .map(zoneId => {
                                    return <Grid.Row key={zoneId}>
                                        <Header>
                                            {getPlanetHeader(zoneId)}
                                        </Header>
                                        <Form>
                                        <Form.Group>
                                        {
                                            [1,2,3,4,5,6]
                                            .map(number => {
                                                let operationId = `${zoneId}:${number}`
                                                return <Form.Checkbox disabled={!isOfficer()} key={operationId} label={number} checked={isCheckmarkChecked(operationId)} onClick={() => handleCheckmarkChange(operationId)}/>
                                            })
                                        }
                                        </Form.Group>
                                        </Form>
                                    </Grid.Row>
                                })
                            }
                            {
                                operation.zones.length > 0
                                ?
                                <List>
                                <List.Item disabled={!isOfficer()} onClick={openFilterCharacterModal} key='open'>
                                <List.Content>
                                    <List.Header as='a'><Icon name='filter'></Icon>Filter Characters</List.Header>
                                </List.Content>
                                </List.Item>
                                </List>
                                :
                                ''
                            }
                        </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column>
                        <Form>
                        <Form.Group inline>
                            <Form.Checkbox label={`Display guild status`} checked={operation.status} disabled={!isOfficer()} onChange={() => setCheckboxValue('status')}/>
                            <Form.Checkbox label={`Display guild member assignments`} checked={operation.assignments} disabled={!isOfficer()} onChange={() => setCheckboxValue('assignments')}/>
                            <Form.Checkbox label={`Send DMs to players with assignments`} checked={operation.dms} disabled={!isOfficer()} onChange={() => setCheckboxValue('dms')}/>
                        </Form.Group>
                        </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column floated='left'>
                    <Button floated='left' color='green' loading={sendingRequest} disabled={(!isOfficer()) || sendingRequest || isEmpty()} onClick={submitOperation}><Icon name='save'></Icon> Save</Button>
                    <Button color='grey' loading={sendingRequest} disabled={sendingRequest || isEmpty()} onClick={runOperation}><Icon name='play'/>Run</Button>
                    </Grid.Column>
                </Grid.Row>
                {
                    simulation !== undefined && Object.keys(simulation).length > 0
                    ?
                    <Grid.Row>
                        <Grid.Column>
                        <Grid centered>
                            <Grid.Row>
                                <Header as={'h3'}>Operation Summary</Header>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid divided centered>
                                {
                                    getActivePlanets()
                                    .map(zoneId => {
                                        return <Grid.Column width={4} key={zoneId}>
                                            <Grid.Row>
                                                <Header as={'h4'}>
                                                {getPlanetHeader(zoneId)}
                                                </Header>
                                            </Grid.Row>
                                            <Grid.Row>
                                                <Grid>
                                                {
                                                    [1,4,2,5,3,6] 
                                                    .map(number => {
                                                        let iconDetails = getIcon(zoneId, number)
                                                        return <Grid.Column width={8} key={number}>
                                                            Operation {number}:
                                                            <br></br>
                                                            <Icon size='huge' name={iconDetails.name} color={iconDetails.color}></Icon>
                                                        </Grid.Column>
                                                    })
                                                }
                                                </Grid>
                                            </Grid.Row>
                                        </Grid.Column>
                                    })
                                } 
                                </Grid>
                            </Grid.Row>
                        </Grid>
                        </Grid.Column>

                    </Grid.Row>
                    :
                    ''
                }
                {
                    simulation !== undefined && Object.keys(simulation).length > 0
                    ?
                    <Grid.Row>
                        <Grid.Column>
                            <Grid>
                                <Grid.Row>
                                    <Header as={'h3'}>
                                    Operation Details
                                    </Header>
                                </Grid.Row>
                                <Grid.Row>
                                    <Menu attached='top' tabular>
                                        <Menu.Item name='Operation Details' active={activeMenu === 'Operation Details'} onClick={() => setActiveMenu('Operation Details')}/>
                                        <Menu.Item name='Player Details' active={activeMenu === 'Player Details'} onClick={() => setActiveMenu('Player Details')}/>
                                        <Menu.Item name='Delta Details' active={activeMenu === 'Delta Details'} onClick={() => setActiveMenu('Delta Details')}/>
                                    </Menu>
                                    <Segment attached='bottom'>
                                        {displayCurrentMenu()}
                                    </Segment>
                                </Grid.Row>
                            </Grid>
                        </Grid.Column>
                    </Grid.Row>
                    :
                    ''
                }
                </Grid>
            </Grid.Column>
		</Grid>

        <Modal
            onOpen={() => setFilterCharacterModalOpen(true)}
            onClose={() => setFilterCharacterModalOpen(false)}
            open={filterCharacterModalOpen}
        >
            <Modal.Header>
                Filter Characters
            </Modal.Header>
            <Modal.Content>
                <Header textAlign='center' size='tiny'>
                    Click on characters you would like to remove from platoon assignments.
                </Header>
                {displayOperationWithDropdowns(displayOperationFiltering)}
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setFilterCharacterModalOpen(false)}>
                    Close
                </Button>
            </Modal.Actions>
        </Modal>
	</div>
}

export default TBOperations;