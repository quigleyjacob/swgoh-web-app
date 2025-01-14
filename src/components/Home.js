import React, { useEffect } from 'react';
import { Card, Container, Header, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom'

function Home ({allyCode, guildId}){

	useEffect(() => {
		// props.redirect('home')
	})

	return <Container text>
		<Header size='huge' textAlign='center'>Welcome to QuigBot.</Header>

		<div>QuigBot is a SWGOH web app/bot servicing a variety of needs for the community. Below are the currently available services for the web app. Note that some services require you to be logged into the website.</div>
		<div>For more information, please join our Discord server (Link in the footer).</div>

		<Card.Group itemsPerRow={3}>
			<Card as={Link} to='/profile' state={{tab: 'gacPlanner', allyCode: allyCode}}>
				<Image src='gac-preview.png' className='square'/>
				<Card.Content>
					<Card.Header>GAC Planner</Card.Header>
					<Card.Description>Allows you to strategize, prepare, and record your attacks against your GAC opponent.</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to='/guild' state={{guildId: guildId, tab: 'TB Commands'}}>
			<Image src='tb-map.png'/>
			<Card.Content>
				<Card.Header>
					TB Commands
				</Card.Header>
				<Card.Description>
					Keep your TB Commands in one place and use the QuigBot Discord Bot to directly write them out in your announcements channel.
				</Card.Description>
			</Card.Content>
			</Card>
			<Card as={Link} to='/infographics'>
				<Image src='reva-preview.png'/>
				<Card.Content>
					<Card.Header>Infographics</Card.Header>
					<Card.Description>Access a variety of infographics related to TB, Datacrons, and more!</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to='/profile' state={{tab: 'datacrons', allyCode: allyCode}}>
				<Image src='datacron-preview.png'/>
				<Card.Content>
					<Card.Header>Datacrons</Card.Header>
					<Card.Description>Easily find the perfect datacron for your squad with the advanced filtering options found nowhere else!</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to='/profile' state={{tab: 'gacHistory', allyCode: allyCode}}>
				<Image src='gac-history-preview.png'/>
				<Card.Content>
					<Card.Header>GAC History</Card.Header>
					<Card.Description>Quickly find your preview attacks in GAC to find a team that you know works.</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to='/guild' state={{guildId: guildId, tab: 'TB Operations'}}>
				<Image src='tb-operations.png'/>
				<Card.Content>
					<Card.Header>TB Operations</Card.Header>
					<Card.Description>Determine which operations your guild is capable of filling as well as which toons are needed to fill more operations.</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to='/profile' state={{tab: 'inventory', allyCode: allyCode}}>
				<Image src='inventory.png'/>
				<Card.Content>
					<Card.Header>Inventory</Card.Header>
					<Card.Description>From one menu, have a bird's-eye view of all gear, relics, and currencies in your roster.</Card.Description>
				</Card.Content>
			</Card>
		</Card.Group>
	</Container>
}

export default Home;
