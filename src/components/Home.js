import React, { useEffect } from 'react';
import { Header } from 'semantic-ui-react';

function Home (props){

	useEffect(() => {
		props.redirect('home')
	})

	return <div>
		<Header size='huge' textAlign='center'>Home</Header>
	</div>
}

export default Home;
