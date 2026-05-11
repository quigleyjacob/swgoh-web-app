import React from 'react';
import { Card, Image, Grid, Header } from 'semantic-ui-react';
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
				return <Card as={Link} to={url(id)} state={{ tab }}>
					<Image src={image} />
					<Card.Content>
						<Card.Header>{title}</Card.Header>
						<Card.Description>{description}</Card.Description>
					</Card.Content>
				</Card>
			})
	}

	// const displayNewsCards = () => {
	// 	return newsCardsData
	// 		.map(({href, image, title, description}) => {
	// 			return <Card as='a' href={href} target='_blank'>
	// 				<img className='square-image' src={image} alt={image} />
	// 				<Card.Content>
	// 					<Card.Header>{title}</Card.Header>
	// 					<Card.Description>{description}</Card.Description>
	// 				</Card.Content>
	// 			</Card>
	// 		})
	// }

	return (
		<Grid centered columns={3}>
			<Grid.Column computer={6} tablet={10} mobile={6}>
				<Grid>
					<Grid.Row>
						<img className='banner' src='/welcome-banner.jfif' alt='welcome banner' />
					</Grid.Row>
					{displayGuestMessage()}
					<Grid.Row>
						<Card.Group itemsPerRow={3} stackable>
							{displayToolCards()}
						</Card.Group>
					</Grid.Row>
				</Grid>
			</Grid.Column>
			{/* <Grid.Column computer={3} tablet={4} mobile={6}>
				<Card.Group itemsPerRow={1} stackable>
					{displayNewsCards()}
				</Card.Group>
			</Grid.Column> */}
		</Grid>
	)
}

export default Home;
