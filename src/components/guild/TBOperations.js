// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Form, Button, Icon, List, Menu, Segment, Accordion, Modal, Dropdown } from 'semantic-ui-react';
import '../../App.css'
import './Rote.css'
import CharacterList from '../profile/CharacterList';
import { populateUnitData } from '../../utils/index.js'

function TBOperations({redirect, guildId, session, displayMessage, isOfficer, guild, units}){

	useEffect(() => {
		(async () => {
			redirect('tboperations')
			let body = {guildId: guildId, session: session, projection: {_id: 1, title: 1}}
			let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/operation`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(body)
			})
			if(response.ok) {
				let operations = await response.json()
				setOperationsList(operations)
			} else {
                displayMessage("Unable to get operations for guild.", false)
            }
		})()
	}, [redirect, guildId, session, displayMessage])

    useEffect(() => {
        (async () => {
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/platoon`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'session': session}
            })
            if(response.ok) {
                let body = await response.json()
                setPlatoons(body)
            } else {
                displayMessage("Unable to get operations for guild.", false)
            }
        })()
    }, [session, displayMessage])

    useEffect(() => {
        // eslint-disable-next-line
        setUnitsMap(units.reduce((map, obj) => (map[obj.baseId] = obj, map), {}))
    }, [units])

	const defaultOperationState = {
        title: '',
        zones: [],
        excludedPlayers: [],
        excludedPlatoons: [],
        status: true,
        assignments: false,
        dms: false
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
    }

    const displayCommand = async (e) => {
        let operationId = e.target.id
        let body = {
            session: session,
            guildId: guildId,
            operationId: operationId,
            projection: {_id: 0, guildId: 0}
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/operation/one`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let operation = await response.json()
            setOperation(operation)
            setOperationId(operationId)
        } else {
            displayMessage("Unable to get operations for guild.", false)
        }
    }

    const handleDeleteClick = async (e, target) => {
        setSendingRequest(true)
        let operationIdToDelete = e.target.id
        let body = {
            session: session,
            guildId: guildId,
            operationId: operationIdToDelete
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/operation/delete`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let message = await response.text()
            if(operationId === operationIdToDelete) {
                setOperation(defaultOperationState)
                setOperationId('new')
            }
            setOperationsList(operationsList.filter(operation => operation._id !== operationIdToDelete))
            displayMessage(message, true)
        } else {
            displayMessage("Unable to get operations for guild.", false)
        }
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
            setOperation(newOperation)
            return
        }
        //if LS, Mix, or DS is already in the list, it should be removed
        if(['LS', 'Mix', 'DS'].includes(type)) {
            newOperation.zones = newOperation.zones.filter(zoneId => !zoneId.includes(type))
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
        let allExcluded = true
        for(let i = 1; i <= 3; ++i) {
            for(let j = 1; j <= 5; ++j) {
                if(!operation.excludedPlatoons.includes(`${operationId}:${i}:${j}`)) {
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
        let body = {
            guildId: guildId,
            session: session,
            operationId: operationId === 'new' ? undefined : operationId,
            operation: operation
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/operation/add`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(response.ok) {
            let operation = await response.json()
            if(operationId === 'new') {
                let newOperationsList = [...operationsList, {_id: operation._id, title: operation.title}]
                setOperationsList(newOperationsList)
            }
            displayMessage("Operation saved.", true)
        } else {
            displayMessage("Unable to save operation.", false)
        }
        setSendingRequest(false)
    }

    const runOperation = async () => {
        setSendingRequest(true)
        let body = {
            guildId: guildId,
            tb: "ROTE",
            zones: operation.zones,
            excludedPlatoons: operation.excludedPlatoons,
            excludedPlayers: operation.excluded
          }
          let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/platoon/ideal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'session': session},
            body: JSON.stringify(body)
          })
          if(response.ok) {
            let simulation = await response.json()
            simulation.pivot = pivotSimulation(simulation)
            setSimulation(simulation)
          } else {
            let error = await response.text()
            displayMessage(error, false)
          }
          setSendingRequest(false)
    }

    const pivotSimulation = (simulation) => {
        let pivot = operation.zones.reduce((map, zoneId) => {
            map[zoneId] = Array.from({length: 6}, e => Array.from({length: 3}, e => Array(5).fill({})))
            return map
        }, {})
        simulation.optimalPlacement.forEach(player => {
            operation.zones.forEach(type => {
                player.placements[type].forEach(placement => {
                    placement.playerName = player.name
                    placement.allyCode = player.allyCode
                    pivot[type][placement.operation-1][placement.row-1][placement.slot-1] = placement
                })
            })
        })
        simulation.skippedPlatoons.forEach(platoon => {
            platoon.thumbnail = unitsMap[platoon.defId].thumbnailName
            platoon.nameKey = unitsMap[platoon.defId].nameKey
            platoon.combatType = unitsMap[platoon.defId].combatType
            platoon.currentRarity = 7
            platoon.currentLevel = 85
            platoon.disabled = true
            pivot[`${platoon.alignment}:${platoon.phase}`][platoon.operation-1][platoon.row-1][platoon.slot-1] = platoon
        })
        simulation.remainingPlatoons.forEach(platoon => {
            platoon.thumbnail = unitsMap[platoon.defId].thumbnailName
            platoon.nameKey = unitsMap[platoon.defId].nameKey
            platoon.combatType = unitsMap[platoon.defId].combatType
            platoon.currentRarity = 7
            platoon.currentLevel = 85
            pivot[`${platoon.alignment}:${platoon.phase}`][platoon.operation-1][platoon.row-1][platoon.slot-1] = platoon
        })
        simulation.unableToFill.forEach(platoon => {
            platoon.thumbnail = unitsMap[platoon.defId].thumbnailName
            platoon.nameKey = unitsMap[platoon.defId].nameKey
            platoon.combatType = unitsMap[platoon.defId].combatType
            platoon.currentRarity = 7
            platoon.currentLevel = 85
            platoon.disabled = true
            pivot[`${platoon.alignment}:${platoon.phase}`][platoon.operation-1][platoon.row-1][platoon.slot-1] = platoon
        })
        return pivot
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

    const displayCurrentMenu = () => {
        let panels
        switch(activeMenu) {
            case "Operation Details":
                panels = getActivePlanets()
                    .map(zoneId => {
                        return {
                            key: zoneId,
                            title: getPlanetHeader(zoneId),
                            content: {
                                content: <Accordion styled fluid exclusive={false} panels={simulation?.pivot[zoneId]?.map((operation, index) => {
                                    let icon = getIcon(zoneId, index+1)
                                    return {
                                        key: index,
                                        title: {content: <span><Icon name={icon.name} color={icon.color}/>Operation {index+1}</span>},
                                        content: {content: displayOperation(operation)}
                                    }
                                })} />

                            
                            }
                        }
                    })
                return <Accordion styled fluid panels={panels} exclusive={false}/>
            case "Player Details":
                panels = simulation?.optimalPlacement
                .sort((a,b) => a.name.localeCompare(b.name))
                .map((player, index) => {
                    return {
                        key: index,
                        title: player.name,
                        content: { content: displayPlayerPlacements(player)}
                    }
                })
                return <Accordion styled fluid panels={panels} exclusive={false}/>
            default:
                return <div></div>

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
            return <CharacterList key={index} unitData={unitData} filter={false} size='normal' killList={killList} onClick={onClick}/>
        })
    }

    const displayOperationFiltering = () => {
        if(planetDropdownValue !== '' && operationDropdownValue !== '') {
            let operationId = `${planetDropdownValue}:${operationDropdownValue}`
            let filteredPlatoons = platoons.filter(platoon => {
                let platoonOperationId = `${platoon.alignment}:${platoon.phase}:${platoon.operation}`
                return platoonOperationId === operationId
            })
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
                    platoonCopy.disabled = operation.excludedPlatoons.includes(platoonId) || operation.excludedPlatoons.includes(operationId)
                    visibleOperation[platoon.row-1].push(platoonCopy)
                })
            })

            const filterCharacter = (platoonId) => {
                let operationId = platoonId.split(':').slice(0,3).join(':')
                let operationCopy = JSON.parse(JSON.stringify(operation))
                let platoonIdList = [1,2,3].map(row => [1,2,3,4,5].map(slot => `${operationId}:${row}:${slot}`)).flat()
                if(operation.excludedPlatoons.includes(platoonId)) {
                    // if platoon id is present, just add it
                    operationCopy.excludedPlatoons = operationCopy.excludedPlatoons.filter(id => id !== platoonId)
                } else if(operation.excludedPlatoons.includes(operationId)) {
                    // need to add all other 14 platoons and exclude our platoon id
                    let platoonIdListToAdd = platoonIdList.filter(id => id !== platoonId)
                    operationCopy.excludedPlatoons = [...operationCopy.excludedPlatoons.filter(id => id !== operationId), ...platoonIdListToAdd]
                    console.log(platoonIdList)
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
        let placements = Object.keys(player.placements).reduce((arr, key) => {
            return [...arr, ...player.placements[key]]
        }, [])
        let unitData = populateUnitData(placements.map(placement => {
            return guild.rosterMap[player.allyCode].rosterMap[placement.defId]
        }), unitsMap)
        return <CharacterList unitData={unitData} filter={false} size='normal'/>
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
                <Grid.Row columns={2}>
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
                                <List.Item onClick={openFilterCharacterModal} key='open'>
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
                    <Button floated='left' color='green' loading={sendingRequest} disabled={(!isOfficer()) || sendingRequest} onClick={submitOperation}><Icon name='save'></Icon> Save</Button>
                    <Button color='grey' loading={sendingRequest} disabled={!isOfficer() || sendingRequest} onClick={runOperation}><Icon name='play'/>Run</Button>
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
                Click on characters you would like to remove from platoon assignments.
                <Grid>
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
                    <Grid.Row centered>
                        {displayOperationFiltering()}
                    </Grid.Row>
                </Grid>
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