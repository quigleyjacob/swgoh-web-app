// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Form, Button, Icon, List, Menu, Segment, Accordion } from 'semantic-ui-react';
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
        // eslint-disable-next-line
        setUnitsMap(units.reduce((map, obj) => (map[obj.baseId] = obj, map), {}))
    }, [units])

	const defaultOperationState = {
        title: '',
        planets: {
            'LS': undefined,
            'Mix': undefined,
            'DS': undefined
        },
        squadNumber: {
            'LS': 0,
            'Mix': 0,
            'DS': 0
        },
        excluded: []
    }

	const [operation, setOperation] = useState(defaultOperationState)
    const [operationId, setOperationId] = useState('new')
    const [operationsList, setOperationsList] = useState([])
	const [sendingRequest, setSendingRequest] = useState(false)
    const [simulation, setSimulation] = useState({})
    const [activeMenu, setActiveMenu] = useState('Operation Details')
    const [unitsMap, setUnitsMap] = useState({})

    const planetNameMap = {
        'DS': ['Burn', 'Mustafar', 'Geonosis', 'Dathomir', 'Haven-class Medical Station', 'Malachor', 'Death Star'],
        'Mix': ['Burn', 'Corellia', 'Felucia', 'Tatooine', 'Kessel', 'Vandor', 'Hoth'],
        'LS': ['Burn', 'Coruscant', 'Bracca', 'Kashyyyk', 'Lothal', 'Ring of Kafrene', 'Scarif']
    }

    const planets = {
        "LS": ["coruscant", "bracca", "kashyyyk", "lothal", "ring-of-kafrene", "scarif"],
        "Mix": ["corellia", "felucia", "tatooine", "kessel", "vandor", "hoth"],
        "DS": ["mustafar", "geonosis", "dathomir", "haven-class-medical-station", "malachor", "death-star"]
    }

    const titleMap = {
        "LS": "Light Side",
        "Mix": "Mixed",
        "DS": "Dark Side"
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
            <List.Content floated='right' onClick={handleDeleteClick} hidden={false && !isOfficer()}>
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
        let newOperation = JSON.parse(JSON.stringify(operation))
        if(newOperation.planets[type] === planet) {
            newOperation.planets[type] = undefined
            newOperation.squadNumber[type] = 0
        } else {
            newOperation.planets[type] = planet
            newOperation.squadNumber[type] = 63
        }
        setOperation(newOperation)
    }

    const handleCheckmarkChange = (type, number) => {
        let newOperation = JSON.parse(JSON.stringify(operation))
        let newNumber = (1 << number) ^ newOperation.squadNumber[type]
        newOperation.squadNumber[type] = newNumber
        setOperation(newOperation)
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
        let skipMask = ~(operation.squadNumber["DS"] + (operation.squadNumber["Mix"] << 6) + (operation.squadNumber["LS"] << 12))
        let body = {
            guildId: guildId,
            tb: "ROTE",
            ds_phase: operation.planets["DS"],
            mix_phase: operation.planets["Mix"],
            ls_phase: operation.planets["LS"],
            skipMask: skipMask,
            session: session
          }
          let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/platoon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(body)
          })
          if(response.ok) {
            let operations = await response.json()
            operations.pivot = pivotSimulation(operations)
            setSimulation(operations)
          } else {
            let error = await response.text()
            displayMessage(error, false)
          }
          setSendingRequest(false)
    }

    const pivotSimulation = (simulation) => {
        let pivot = {
            "DS": Array.from({length: 6}, e => Array.from({length: 3}, e => Array(5).fill({}))),
            "Mix": Array.from({length: 6}, e => Array.from({length: 3}, e => Array(5).fill({}))),
            "LS": Array.from({length: 6}, e => Array.from({length: 3}, e => Array(5).fill({})))
        }
        simulation.optimalPlacement.forEach(player => {
            ["LS", "Mix", "DS"].forEach(type => {
                player.placements[type].forEach(placement => {
                    placement.playerName = player.name
                    placement.allyCode = player.allyCode
                    pivot[type][placement.operation-1][placement.row-1][placement.slot-1] = placement
                })
            })
        })
        return pivot
    }

    const displayCurrentMenu = () => {
        let panels
        switch(activeMenu) {
            case "Operation Details":
                panels = ["DS", "Mix", "LS"]
                    .map(type => {
                        return {
                            key: type,
                            title: titleMap[type],
                            content: {
                                content: <Accordion styled fluid exclusive={false} panels={simulation.pivot[type].map((operation, index) => {
                                    return {
                                        key: index,
                                        title: `Operation ${index+1}`,
                                        content: {content: displayOperation(operation)}
                                    }
                                })} />

                            
                            }
                        }
                    })
                return <Accordion styled fluid panels={panels} exclusive={false}/>
            case "Player Details":
                panels = simulation.optimalPlacement
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

    const displayOperation = (operation) => {
        return operation.map((row, index) => {
            let unitData = row.map(slot => {
                let unit = Object.keys(slot).length > 0 ? populateUnitData([guild.rosterMap[slot.allyCode].rosterMap[slot.defId]], unitsMap)[0] : {}
                unit.nameKey = slot.playerName
                return unit
            })
            return <CharacterList key={index} unitData={unitData} filter={false} size='small'/>
        })
    }

    const displayPlayerPlacements = (player) => {
        let placements = [...player.placements["LS"], ...player.placements["Mix"], ...player.placements["DS"]]
        let unitData = populateUnitData(placements.map(placement => {
            return guild.rosterMap[player.allyCode].rosterMap[placement.defId]
        }), unitsMap)
        return <CharacterList unitData={unitData} filter={false} size='small'/>
    }

	return <div>
		<Header size='huge' textAlign='center'>TB Operations</Header>
		<Grid centered>
            <Grid.Column width={4}>
                <List divided relaxed>
                    <List.Item onClick={handleNewOperationClick} value='new' disabled={false && !isOfficer()} key='new'>
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
                            disabled={false && !isOfficer()}
                        />
                        </Grid.Column>
                        <Grid.Column>
                        <Form.Dropdown
                            fluid
                            id='excluded'
                            label='Excluded Players'
                            placeholder='Excluded Players'
                            value={operation.excluded}
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
                                    ["DS", "Mix", "LS"]
                                    .map(type => {
                                        return planets[type]
                                        .map((planet, index) => {
                                            return <div key={planet} className={`planet ${planet} ${operation.planets[type] === index+1 ? 'activePlanet' : ''}`} onClick={() => setActivePlanets(type, index+1)}></div>
                                        })
                                    }).flat()

                                }
                            </div>
                        </div>
                        </Grid.Column>
                        <Grid.Column computer={8} tablet={8} mobile={16}>
                            {
                                ["DS", "Mix", "LS"]
                                .filter(type => operation.planets[type] !== undefined)
                                .map(type => {
                                    return <Grid.Row key={type}>
                                        <Header>
                                            {`${planetNameMap[type][operation.planets[type]]} (${titleMap[type]})`}
                                        </Header>
                                        <Form>
                                        <Form.Group>
                                        {
                                            [0,1,2,3,4,5]
                                            .map(number => {
                                                return <Form.Checkbox key={`${type}:${number}`} label={number+1} checked={((1 << number) & operation.squadNumber[type]) !== 0} onClick={() => handleCheckmarkChange(type, number)}/>
                                            })
                                        }
                                        </Form.Group>
                                        </Form>
                                    </Grid.Row>
                                })
                                
                            }
                        </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Button color='green' loading={sendingRequest} disabled={(false && !isOfficer()) || sendingRequest} onClick={submitOperation}><Icon name='save'></Icon> Save</Button>
                    <Button color='grey' loading={sendingRequest} disabled={(false && !isOfficer()) || sendingRequest} onClick={runOperation}><Icon name='play'/>Run</Button>
                </Grid.Row>
                {
                    Object.keys(simulation).length > 0
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
                                    ["DS", "Mix", "LS"]
                                    .map(type => {
                                        return <Grid.Column width={5} key={type}>
                                            <Grid.Row>
                                                <Header as={'h4'}>
                                                    {titleMap[type]}
                                                </Header>
                                            </Grid.Row>
                                            <Grid.Row>
                                                <Grid>
                                                {
                                                    [1,4,2,5,3,6] 
                                                    .map(number => {
                                                        let iconDetails = 
                                                            operation.squadNumber[type] & (1 << (number-1))
                                                            ?
                                                            simulation.operations[type].includes(number)
                                                            ?
                                                            {name: 'check circle', color: 'green'}
                                                            :
                                                            {name: 'times circle', color: 'red'}
                                                            :
                                                            {name: 'warning circle', color: 'yellow'}
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
                    Object.keys(simulation).length > 0
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
	</div>
}

export default TBOperations;