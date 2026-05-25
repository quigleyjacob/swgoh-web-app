import React from 'react';
import { Card, Image, Grid, Header, Container } from 'semantic-ui-react';
import { Link } from 'react-router-dom'
import { toolCardsData } from '../static/home.js';

function Home({allyCode, guildId, isAuthenticated}) {

	const displayGuestMessage = () => {
		if (!isAuthenticated()) {
			return <Grid.Row>
				<Header size='tiny'>Hello guest user. Welcome to QuigBot! Many features are not available unless you are signed in. To view all of what QuigBot has to offer, sign in using your Discord and connect your SWGOH account to get started!</Header>
			</Grid.Row>
		}
	}

	const displayToolCards = () => {
		return toolCardsData
			.map(({ guild, title, description, url, tab, image }) => {
				let id = guild ? guildId : allyCode
				return <Card as={Link} to={url(id)} state={{ tab }} >
					<Image src={image} />
					<Card.Content>
						<Card.Header>{title}</Card.Header>
						<Card.Description>{description}</Card.Description>
					</Card.Content>
				</Card>
			})
	}

	return (
		<Container>
			<Grid centered>
				<Grid.Row>
					<img className='banner' src='/welcome-banner.jfif' alt='welcome banner' />
				</Grid.Row>
				{displayGuestMessage()}
				<Grid.Row>
					<Grid.Column>
						<Card.Group className='widescreen-menu' centered itemsPerRow={6}>
							{displayToolCards()}
						</Card.Group>
						<Card.Group className='desktop-menu' centered itemsPerRow={4}>
							{displayToolCards()}
						</Card.Group>
						<Card.Group className='tablet-menu' centered itemsPerRow={3}>
							{displayToolCards()}
						</Card.Group>
						<Card.Group className='mobile-menu' centered itemsPerRow={2}>
							{displayToolCards()}
						</Card.Group>
					</Grid.Column>

				</Grid.Row>
			</Grid>
		</Container>

	)
}

export default Home;
