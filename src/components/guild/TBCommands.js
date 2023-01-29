// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Input, TextArea, Form, Button, Icon, List } from 'semantic-ui-react';
import '../../App.css'

function TBCommands (props){

	useEffect(() => {
		(async () => {
			props.redirect('tbcommands')
			let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/command`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({guildId: props.guildId, session: props.session, type: 'tb'})
			})
			if(response.ok) {
				let commands = await response.json()
				// eslint-disable-next-line
				let newCommandsMap = commands.reduce((map, obj) => (map[obj._id] = obj, map), {})
				setAllCommandsMap(newCommandsMap)
			}
		})()
	}, [props])

	const defaultCommandState = {title: '', description: ''}

	const [command, setCommand] = useState(defaultCommandState)
	const [currentCommand, setCurrentCommand] = useState('new')
	const [allCommandsMap, setAllCommandsMap] = useState({})

	const handleNewCommandClick = (e, obj) => {
		setCommand(defaultCommandState)
		setCurrentCommand('new')
	}

	const handleChange = (e, obj) => {
		const { placeholder, value } = obj;
		setCommand({
			...command,
			[placeholder]: value,
		});
	}


	const listCommands = () => Object.values(allCommandsMap).sort((a,b) => a.title.localeCompare(b.title)).map(command => {
		return <List.Item disabled={!props.isOfficer()} id={command._id} onClick={displayCommand} key={command._id}>
		<List.Content>
			<List.Header as='a'>{command.title}</List.Header>
		</List.Content>
		</List.Item>
	})

	const displayCommand = (e, obj) => {
		let id = obj.id
		let command = allCommandsMap[id]
		setCurrentCommand(id)
		setCommand({
			title: command.title,
			description: command.description
		})
	}

	const handleSubmit = async (e) => {
	let body = {
		sessionId: props.session,
		allyCode: props.allyCode,
		guildId: props.guildId,
		id: currentCommand === 'new' ? null : currentCommand,
		title: command.title,
		description: command.description,
		type: 'tb'
	}
	let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/command/add`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(body)
	})
	if(response.ok) {
		let command = await response.json()
		let newCommandsList = arrayUniqueByKey([command, ...Object.values(allCommandsMap)], '_id')
		// eslint-disable-next-line
		let newCommandsMap = newCommandsList.reduce((map, obj) => (map[obj._id] = obj, map), {})
		setAllCommandsMap(newCommandsMap)

	}
	}

	const arrayUniqueByKey = (array, key) => [...new Map(array.map(item =>[item[key], item])).values()]

	return <div>
		<Header size='huge' textAlign='center'>TB Commands</Header>
		<Grid>

		<Grid.Column width={4} textAlign='left'>
		<List divided relaxed>
			<List.Item onClick={handleNewCommandClick} value='new' disabled={!props.isOfficer()} key='new'>
			<List.Content>
				<List.Header as='a'><Icon name='plus'></Icon>New</List.Header>
			</List.Content>
			</List.Item>
			{listCommands()}
		</List>
		</Grid.Column>
		<Grid.Column width={12}>
		<Form align='left' onSubmit={handleSubmit}>
			<Form.Field >
				<label>Title</label>
				<Input fluid placeholder='title' value={command.title} onChange={handleChange} disabled={!props.isOfficer()}></Input>
			</Form.Field>
			<Form.Field>
				<label>Commands</label>
				<TextArea className='monospace' placeholder='description' style={{ minHeight: 300 }} value={command.description} onChange={handleChange} disabled={!props.isOfficer()}/>
			</Form.Field>
			<Form.Field>
			<Button color='green' disabled={!props.isOfficer()}><Icon name='save'></Icon> Save</Button>
			</Form.Field>
		</Form>
		</Grid.Column>
		</Grid>
	</div>
}

export default TBCommands;