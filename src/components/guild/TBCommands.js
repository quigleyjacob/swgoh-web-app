// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Input, TextArea, Form, Button, Icon, List } from 'semantic-ui-react';
import '../../App.css'

function TBCommands ({redirect, guildId, session, displayMessage, displayModal, isOfficer}){

	useEffect(() => {
		(async () => {
			redirect('tbcommands')
			let body = {guildId: guildId, session: session, type: 'tb'}
			let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/command`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(body)
			})
			if(response.ok) {
				let commands = await response.json()
				// eslint-disable-next-line
				let newCommandsMap = commands.reduce((map, obj) => (map[obj._id] = obj, map), {})
				setAllCommandsMap(newCommandsMap)
			}
		})()
	}, [redirect, guildId, session])

	const defaultCommandState = {title: '', description: ''}

	const [command, setCommand] = useState(defaultCommandState)
	const [currentCommand, setCurrentCommand] = useState('new')
	const [allCommandsMap, setAllCommandsMap] = useState({})
	const [sendingRequest, setSendingRequest] = useState(false)

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

	const deleteCommand = async (commandToDeleteId) => {
		let body = {
			session: session,
			commandId: commandToDeleteId,
			guildId: guildId
		}
		let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/command/delete`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(body)
		})
		if(response.ok) {
			let newCommandsList = Object.values(allCommandsMap).filter(command => command._id !== commandToDeleteId)
			// eslint-disable-next-line
			let newCommandsMap = newCommandsList.reduce((map, obj) => (map[obj._id] = obj, map), {})
			setAllCommandsMap(newCommandsMap)
			if(commandToDeleteId === currentCommand) {
				setCommand(defaultCommandState)
				setCurrentCommand('new')
			}
			displayMessage('Successfully deleted command', true)
		} else {
			displayMessage('Unable to delete command', false)
		}
	}

	const handleDeleteClick = async (e) => {
		setSendingRequest(true)
		let commandToDeleteId = e.target.id
		await displayModal('Delete Command', false, () => deleteCommand(commandToDeleteId))
		setSendingRequest(false)

	}


	const listCommands = () => Object.values(allCommandsMap).sort((a,b) => a.title.localeCompare(b.title)).map(command => {
		return <List.Item key={command._id}>
		<List.Content as='a' onClick={displayCommand} id={command._id}>
			<b id={command._id}>{command.title}</b>
		</List.Content>
		<List.Content floated='right' onClick={handleDeleteClick} hidden={!isOfficer()}>
			<Icon link textAlign='right' name='trash alternate' id={command._id}></Icon>
		</List.Content>
		</List.Item>
	})

	const displayCommand = (e, obj) => {
		let id = e.target.id
		let command = allCommandsMap[id]
		setCurrentCommand(id)
		setCommand({
			title: command.title,
			description: command.description
		})
	}

	const handleSubmit = async (e) => {
		if(command.title.length === 0 || command.description.length === 0) {

			return
		}
		setSendingRequest(true)
		let newCommand = currentCommand === "new"
		let body = {
			session: session,
			guildId: guildId,
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
			let newCommandsList = arrayUniqueByKey([...Object.values(allCommandsMap), command], '_id')
			// eslint-disable-next-line
			let newCommandsMap = newCommandsList.reduce((map, obj) => (map[obj._id] = obj, map), {})
			setCurrentCommand(command._id)
			setAllCommandsMap(newCommandsMap)
			displayMessage(`Successfully ${newCommand ? 'add' : 'edit'}ed command.`, true)
		} else {
			displayMessage(`Unable to ${newCommand ? 'add' : 'edit'} command.`, false)
		}
		setSendingRequest(false)
	}

	const arrayUniqueByKey = (array, key) => [...new Map(array.map(item =>[item[key], item])).values()]

	return <div>
		<Header size='huge' textAlign='center'>TB Commands</Header>
		<Grid>

		<Grid.Column width={4} textAlign='left'>
		<List divided relaxed>
			<List.Item onClick={handleNewCommandClick} value='new' disabled={!isOfficer()} key='new'>
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
				<Input fluid placeholder='title' value={command.title} onChange={handleChange} disabled={!isOfficer()}></Input>
			</Form.Field>
			<Form.Field>
				<label>Commands</label>
				<TextArea className='monospace' placeholder='description' style={{ minHeight: 300 }} value={command.description} onChange={handleChange} disabled={!isOfficer()}/>
			</Form.Field>
			<Form.Field>
			<Button color='green' loading={sendingRequest} disabled={!isOfficer() || sendingRequest}><Icon name='save'></Icon> Save</Button>
			</Form.Field>
		</Form>
		</Grid.Column>
		</Grid>
	</div>
}

export default TBCommands;