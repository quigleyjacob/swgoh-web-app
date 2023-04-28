import React, { useEffect } from 'react';
import { Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom'

function Footer (){

	useEffect(() => {
		// props.redirect('home')
	})

	return <Segment className='Footer' color='black' inverted textAlign='center'>
        <div>QuigBot is not affiliated with EA, EA Capital Games, Disney or Lucasfilm LTD.</div>
		<div><a href='https://discord.gg/gm7zPwSFJD' target='_blank' rel="noreferrer">Join my Discord Server!</a></div>
        <div><Link to={'/privacy'}>Privacy Policy</Link></div>
		<div><Link to={'/contact'}>Contact Us</Link></div>
		<div><a href='https://discord.me/quigbot' target='_blank' rel="noreferrer">QuigBot Links</a></div>
	</Segment>
}

export default Footer;