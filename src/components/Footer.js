import React, { useEffect } from 'react';
import { Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom'

function Footer (){

	useEffect(() => {
		// props.redirect('home')
	})

	return <Segment text className='Footer' fluid color='black' inverted textAlign='center'>
        <div>QuigBot is not affiliated with EA, EA Capital Games, Disney or Lucasfilm LTD.</div>
        <div><Link to={'/privacy'}>Privacy Policy</Link></div>
		<div><Link to={'/contact'}>Contact Us</Link></div>
		<div><a href='https://discord.me/quigbot' target='_blank' rel="noreferrer">QuigBot Links</a></div>
	</Segment>
}

export default Footer;