// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
import { useLocation } from "react-router-dom"
import PlayerProfile from './profile/PlayerProfile';
import Characters from './profile/Characters';
import Ships from './profile/Ships';

function Profile ({redirect, displayMessage, units, skills, images, session}){

  const location = useLocation()
  const { allyCode } = location.state

  const [activeItem, setActiveItem] = useState('overview')
  const [account, setAccount] = useState({})

	useEffect(() => {
		redirect('profile')
    const getPlayerData = async () => {
      let body = {
        payload: {
          allyCode: allyCode
        },
        session: session
      }
      let player = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(player.ok) {
        let account = await player.json()
        setAccount(account)
      } else {
        let error = await player.text()
        displayMessage('Unable to get account data for selected account.', false)
        console.log(error)
      }
    }
    getPlayerData()
	}, [allyCode, displayMessage, redirect])

  const handleItemClick = (e, obj) => {
      setActiveItem(obj.name)
  }

  const getActiveItem = () => {
      switch(activeItem) {
          case 'overview':
              return <PlayerProfile account={account} redirect={redirect} />
          case 'characters':
              return <Characters account={account} redirect={redirect} units={units} skills={skills} images={images}/>
          case 'ships':
              return <Ships account={account} redirect={redirect} units={units} images={images}/>
          default:
            return <Header>Unknown</Header>
      }
  }

	return <div>
		<Header size='huge' textAlign='center'>Profile</Header>

        <Grid>
        <Grid.Column width={4}>
          <Menu fluid vertical tabular>
            <Menu.Item
              name='overview'
              active={activeItem === 'overview'}
              onClick={handleItemClick}
            />
            <Menu.Item
              name='characters'
              active={activeItem === 'characters'}
              onClick={handleItemClick}
            />
            <Menu.Item
              name='ships'
              active={activeItem === 'ships'}
              onClick={handleItemClick}
            />
          </Menu>
        </Grid.Column>

        <Grid.Column stretched width={12}>
          <Segment>
            {getActiveItem()}
          </Segment>
        </Grid.Column>
      </Grid>
	</div>
}

export default Profile;