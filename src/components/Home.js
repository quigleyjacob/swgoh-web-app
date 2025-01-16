import React, { useEffect } from 'react';
import { Card, Image, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom'

function Home ({allyCode, guildId}){

	useEffect(() => {
		// props.redirect('home')
	})

	const stuff = <Grid>
		<Grid.Row>
			<img className='banner' src='/welcome-banner.jfif' alt='welcome banner'/>
		</Grid.Row>
		<Grid.Row>
		<Card.Group itemsPerRow={3} stackable>
			<Card as={Link} to={`/profile/${allyCode}`} state={{tab: 'gacPlanner'}}>
				<Image src='/gac-preview.png' className='square'/>
				<Card.Content>
					<Card.Header>GAC Planner</Card.Header>
					<Card.Description>Allows you to strategize, prepare, and record your attacks against your GAC opponent.</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to={`/guild/${guildId}`} state={{tab: 'TB Commands'}}>
			<Image src='/tb-map.png'/>
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
				<Image src='/reva-preview.png'/>
				<Card.Content>
					<Card.Header>Infographics</Card.Header>
					<Card.Description>Access a variety of infographics related to TB, Datacrons, and more!</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to={`/profile/${allyCode}`} state={{tab: 'datacrons'}}>
				<Image src='/datacron-preview.png'/>
				<Card.Content>
					<Card.Header>Datacrons</Card.Header>
					<Card.Description>Easily find the perfect datacron for your squad with the advanced filtering options found nowhere else!</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to={`/profile/${allyCode}`} state={{tab: 'gacHistory'}}>
				<Image src='/gac-history-preview.png'/>
				<Card.Content>
					<Card.Header>GAC History</Card.Header>
					<Card.Description>Quickly find your previous GAC attacks to find a team that you know works.</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to={`/guild/${guildId}`} state={{tab: 'TB Operations'}}>
				<Image src='/tb-operations.png'/>
				<Card.Content>
					<Card.Header>TB Operations</Card.Header>
					<Card.Description>Determine which operations your guild is capable of filling as well as which toons are needed to fill more operations.</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to={`/profile/${allyCode}`} state={{tab: 'inventory'}}>
				<Image src='/inventory_v2.png'/>
				<Card.Content>
					<Card.Header>Inventory</Card.Header>
					<Card.Description>From one menu, have a bird's-eye view of all gear, relics, and currencies in your roster.</Card.Description>
				</Card.Content>
			</Card>
			<Card as={Link} to='/leaderboard'>
				<Image src='/leaderboard.png'/>
				<Card.Content>
					<Card.Header>Leaderboard</Card.Header>
					<Card.Description>View the GAC Server Leaderboard to see who is leading the pack!</Card.Description>
				</Card.Content>
			</Card>
		</Card.Group>
		</Grid.Row>
	</Grid>

return (
	<Grid centered columns={3}>
	  <Grid.Column computer={6} tablet={10} mobile={6}>
		  {stuff}
	  </Grid.Column>
	  <Grid.Column computer={3} tablet={4} mobile={6}>
	  <Card.Group itemsPerRow={1} stackable>
				<Card as='a' href='https://forums.ea.com/blog/swgoh-game-info-hub-en/era-of-the-cavalry---bad-batch/5049853' target='_blank'>
					<img className='square-image' src='tex.purchase_era02_front.png' alt='tex.purchase_era02_front.png'/>
					<Card.Content>
						<Card.Header>Era of the Cavalry has begun!</Card.Header>
						<Card.Description>Click to learn more.</Card.Description>
					</Card.Content>
				</Card>
				<Card as='a' target='_blank' href='https://forums.ea.com/blog/swgoh-game-info-hub-en/kit-reveal-omega-fugitive/5050956'>
					<img className='square-image' src='tex.events_omegas3.png' alt='tex.events_omegas3.png'/>
					<Card.Content>
						<Card.Header>Omega (Fugitive) is now in-game</Card.Header>
						<Card.Description>See her kit reveal here.</Card.Description>
					</Card.Content>
				</Card>
				</Card.Group>
	  </Grid.Column>
	</Grid>
  )
}

export default Home;
