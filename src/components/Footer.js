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
		<div><a href='https://discord.com/api/oauth2/authorize?client_id=965933874100183100&permissions=268487680&scope=bot%20applications.commands' target='_blank' rel="noreferrer">Invite QuigBot to your Server!</a></div>
        <div><a href='https://www.patreon.com/c/QuigBot/posts' target='_blank' rel='noreferrer'>Check out my Patreon!</a></div>
		<div><Link to={'/terms'}>Terms of Service</Link></div>
		<div><Link to={'/privacy'}>Privacy Policy</Link></div>
		<div><Link to={'/contact'}>Contact Us</Link></div>
	</Segment>
}

export default Footer;