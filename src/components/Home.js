import React, { useEffect } from 'react';
import { Card, Container, Header, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom'

function Home ({allyCode, name, guildId, inGuild}){

	useEffect(() => {
		// props.redirect('home')
	})

	return <Container text>
		<Header size='huge' textAlign='center'>Welcome to QuigBot.</Header>

		<div>QuigBot is a SWGOH web app/bot servicing a variety of needs for the community. Below are the currently available services for the web app. Note that some services require you to be logged into the website.</div>
		<div>For more information, please join our Discord server (Link in the footer).</div>

		<Card.Group itemsPerRow={3}>
			<Card as={Link} to='/profile' state={{tab: 'GAC Planner'}}>
				<Image src='gac-map-preview.png' className='square'/>
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
					Keep your TB Commands in one place and use the QuigBot Discord Bot to directly write them out in your annoncements channel.
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
		</Card.Group>
	</Container>
}

export default Home;
