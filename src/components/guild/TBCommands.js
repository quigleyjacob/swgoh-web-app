// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Input, TextArea, Form, Button, Icon, List } from 'semantic-ui-react';
import '../../App.css'
import { toHTML } from 'discord-markdown'
import { emojify } from 'node-emoji'
import { addCommand, deleteCommand, getCommand, getCommands, updateCommand } from '../../server/command';

function TBCommands ({redirect, guildId, session, displayMessage, displayModal, isOfficer}){

	useEffect(() => {
		(async () => {
			redirect('tbcommands')
			if(session === '') {
				return
			}
			getCommands(guildId, session, 'tb', displayMessage, setCommandList)
		})()
	}, [redirect, guildId, session, displayMessage])

	const defaultCommandState = {title: '', description: ''}

	const [command, setCommand] = useState(defaultCommandState)
	const [currentCommand, setCurrentCommand] = useState('new')
	const [commandList, setCommandList] = useState([])
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

	const onDeleteCommandClick = async (id) => {
		if(id === currentCommand) {
			setCommand(defaultCommandState)
			setCurrentCommand('new')
		}
		deleteCommand(id, guildId, session, displayMessage, commandList, setCommandList)
	}

	const handleDeleteClick = async (e) => {
		setSendingRequest(true)
		let commandToDeleteId = e.target.id
		await displayModal('Delete Command. This action cannot be reversed', false, () => onDeleteCommandClick(commandToDeleteId))
		setSendingRequest(false)

	}


	const listCommands = () => commandList.sort((a,b) => a.title.localeCompare(b.title)).map(command => {
		return <List.Item key={command._id}>
		<List.Content as='a' onClick={displayCommand} id={command._id}>
			<b id={command._id}>{command.title}</b>
		</List.Content>
		<List.Content floated='right' onClick={handleDeleteClick} hidden={!isOfficer()}>
			<Icon link name='trash alternate' id={command._id}></Icon>
		</List.Content>
		</List.Item>
	})

	const displayCommand = (e, obj) => {
		let id = e.target.id
		getCommand(id, guildId, session, displayCommand, setCommand, setCurrentCommand)
	}

	const handleSubmit = async (e) => {
		if(command.title.length === 0 || command.description.length === 0) {
			displayMessage('Title and description cannot be empty.')
			return
		}
		setSendingRequest(true)
		let newCommand = currentCommand === "new"
		if(newCommand) {
			await addCommand(guildId, session, command.title, command.description, 'tb', displayMessage, commandList, setCommandList, setCurrentCommand)
		} else {
			await updateCommand(currentCommand, guildId, session, command.title, command.description, 'tb', displayMessage)
		}
		setSendingRequest(false)
	}

	return <div>
		<Header size='huge' textAlign='center'>TB Commands</Header>
		<Grid>

		<Grid.Column width={4}>
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
		<Grid>
		<Grid.Column computer={8} mobile={16}>
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
		<Grid.Column computer={8} mobile={16}>
			<Header as={'h5'}>Preview</Header>
			<div style={{backgroundColor: '#DCDCDC', margin: '0 auto', padding: "10px", borderRadius: "10px"}} dangerouslySetInnerHTML={{__html: toHTML(emojify(command.description))}}></div>
		</Grid.Column>
		</Grid>
		</Grid.Column>
		</Grid>
	</div>
}

export default TBCommands;