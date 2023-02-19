// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
import { useLocation } from "react-router-dom"
import PlayerProfile from './profile/PlayerProfile';
import Characters from './profile/Characters';
import Ships from './profile/Ships';
import Gac from './gac/Gac.js'
import Squads from './profile/Squads';

function Profile ({loggedInAllyCode, redirect, displayMessage, units, skills, images, session, setLoaderVisible, setLoaderMessage, categories}){

  const location = useLocation()
  const { allyCode, tab } = location.state

  const [activeItem, setActiveItem] = useState(tab || 'overview')
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
        // define the baseId for each unit
        account.rosterUnit.forEach(unit => {
          let baseId = unit.definitionId.split(':')[0]
          unit.baseId = baseId
        })
        setAccount(account)
      } else {
        let error = await player.text()
        displayMessage('Unable to get account data for selected account.', false)
        console.log(error)
      }
    }
    getPlayerData()
	}, [allyCode, displayMessage, redirect, session])

  const handleItemClick = (e, obj) => {
      setActiveItem(obj.name)
  }

  const getActiveItem = () => {
      switch(activeItem) {
          case 'overview':
              return <PlayerProfile account={account} redirect={redirect} />
          case 'characters':
              return <Characters account={account} redirect={redirect} units={units} skills={skills} images={images} categories={categories}/>
          case 'ships':
              return <Ships account={account} redirect={redirect} units={units} images={images} categories={categories}/>
          case 'gacPlanner':
              return <Gac images={images} units={units} account={account} setLoaderVisible={setLoaderVisible} setLoaderMessage={setLoaderMessage} session={session} redirect={redirect} skills={skills} categories={categories} displayMessage={displayMessage}/>
          case 'squads':
              return <Squads units={units} account={account} skills={skills} images={images} categories={categories}/>
          default:
            return <Header>Unknown</Header>
      }
  }

	return <div>
		<Header size='huge' textAlign='center'>Profile</Header>

        <Grid>
        <Grid.Column width={2}>
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
            {
              loggedInAllyCode === allyCode
              ?
            <span>
            <Menu.Item 
              hidden={loggedInAllyCode !== allyCode}
              name='gacPlanner'
              active={activeItem === 'gacPlanner'}
              onClick={handleItemClick}
            />
            <Menu.Item
              hidden={loggedInAllyCode !== allyCode}
              name='squads'
              active={activeItem === 'squads'}
              onClick={handleItemClick}
            />
            </span>
            :
            ''
            }
          </Menu>
        </Grid.Column>

        <Grid.Column stretched width={14}>
          <Segment>
            {getActiveItem()}
          </Segment>
        </Grid.Column>
      </Grid>
	</div>
}

export default Profile;