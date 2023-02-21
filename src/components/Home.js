import React, { useEffect } from 'react';
import { Container, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom'

function Home ({allyCode, name, guildId, inGuild}){

	useEffect(() => {
		// props.redirect('home')
	})

	return <Container text>
		<Header size='huge' textAlign='center'>Home</Header>

		<div>Welcome to QuigBot, {name}! I have no clue what to do with this homepage, so for now here are some links to things you may be here for.</div>
		<ul>
		<li>Click <Link to={`profile`} state={{allyCode: allyCode, tab: 'gacPlanner'}}>here</Link> to go to the GAC planner.</li>
		{
			inGuild()
			?
			<li>Click <Link to={`guild`} state={{guildId: guildId}}>here</Link> to go to your guild page.</li>
			:
			''
		}
		</ul>
	</Container>
}

export default Home;
