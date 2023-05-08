// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Form, Button, Icon, List } from 'semantic-ui-react';
import '../../App.css'
import './Rote.css'

function TBOperations({redirect, guildId, session, displayMessage, isOfficer, guild}){

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

	const defaultOperationState = {
        title: '',
        planets: {
            'ls': '',
            'mix': '',
            'ds': ''
        },
        squadNumber: {
            'ls': 63,
            'mix': 63,
            'ds': 63
        },
        excluded: []
    }

	const [operation, setOperation] = useState(defaultOperationState)
    const [operationId, setOperationId] = useState('new')
    const [operationsList, setOperationsList] = useState([])
	const [sendingRequest, setSendingRequest] = useState(false)

    const planets = {
        "ls": ["coruscant", "bracca", "kashyyyk", "lothal", "ring-of-kafrene", "scarif"],
        "mix": ["corellia", "felucia", "tatooine", "kessel", "vandor", "hoth"],
        "ds": ["mustafar", "geonosis", "dathomir", "haven-class-medical-station", "malachor", "death-star"]
    }

    const titleMap = {
        "ls": "Light Side",
        "mix": "Mixed",
        "ds": "Dark Side"
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
        console.log(e, target)
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
        return guild?.member.map(member => {
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
            newOperation.planets[type] = ''
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

	return <div>
		<Header size='huge' textAlign='center'>TB Operations</Header>
		<Grid>

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
		<Form align='left'>
            <Form.Group widths={'equal'}>
			<Form.Input
                id='title'
                label='Title'
                placeholder='Title'
                value={operation.title}
                onChange={handleChange}
                disabled={false && !isOfficer()}
            />
            <Form.Dropdown
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
            </Form.Group>
        </Form>
            <Grid>
                <Grid.Column computer={8} tablet={8} mobile={16}>
                <div className="wrapper">
                    <div className="roteMap">
                        {
                            ["ds", "mix", "ls"]
                            .map(type => {
                                return planets[type]
                                .map(planet => {
                                    return <div key={planet} className={`planet ${planet} ${operation.planets[type] === planet ? 'activePlanet' : ''}`} onClick={() => setActivePlanets(type, planet)}></div>
                                })
                            }).flat()

                        }
                    </div>
                </div>
                </Grid.Column>
                <Grid.Column computer={8} tablet={8} mobile={16} >
                    <Grid.Row></Grid.Row>
                    {
                        ["ds", "mix", "ls"]
                        .filter(type => operation.planets[type] !== '')
                        .map(type => {
                            return <Grid.Row key={type}>
                                <Header>
                                    {titleMap[type]}
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
            </Grid>
			<Form.Field>
			<Button color='green' loading={sendingRequest} disabled={(false && !isOfficer()) || sendingRequest} onClick={submitOperation}><Icon name='save'></Icon> Save</Button>
			</Form.Field>
		</Grid.Column>
		</Grid>
	</div>
}

export default TBOperations;