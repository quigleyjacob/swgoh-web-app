// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
import GuildProfile from './guild/GuildProfile';
import TBCommands from './guild/TBCommands';
import { useLocation } from "react-router-dom"

function Guild ({redirect, displayMessage, session, displayModal, name}){

  const location = useLocation()
  const { guildId } = location.state

  const [activeItem, setActiveItem] = useState('overview')
  const [guild, setGuild] = useState({})

	useEffect(() => {
		redirect('guild')
    const getGuildData = async () => { 
      let body = {
        guildId: guildId,
        detailed: true,
        refresh: false,
        projection: {
          name: 1,
          allyCode: 1,
          rosterUnit: {
            definitionId: 1
          }
        },
        session: session
      }
      let guild = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(guild.ok) {
        let guildData = await guild.json()
        setGuild(guildData)
      } else {
        let error = await guild.text()
        displayMessage('Unable to get guild data for selected account.', false)
        console.log(error)
      }
    }
    getGuildData()
	}, [guildId, displayMessage, redirect, session])

  const isOfficer = () => {
    let filteredGuild = guild.member.filter(member => member.playerName === name)
    if(filteredGuild.length === 0) {
      return false
    } else {
      return filteredGuild[0].memberLevel > 2
    }
  }

  const handleItemClick = (e, obj) => {
      setActiveItem(obj.name)
  }

  const getActiveItem = () => {
      switch(activeItem) {
          case 'overview':
              return <GuildProfile redirect={redirect} guild={guild}/>
          case 'TB Commands':
            if(isOfficer()) {
              return <TBCommands redirect={redirect} guildId={guildId} session={session} isOfficer={isOfficer} displayMessage={displayMessage} displayModal={displayModal}/>
            }
            break
          default:
            return <Header>Unknown</Header>
      }
  }

	return <div>
    <Header size='huge' textAlign='center'>Guild</Header>
      
    <Grid>
      <Grid.Column width={2}>
        <Menu fluid vertical tabular>
          <Menu.Item
            name='overview'
            active={activeItem === 'overview'}
            onClick={handleItemClick}
          />
          <Menu.Item
            name='TB Commands'
            active={activeItem === 'TB Commands'}
            onClick={handleItemClick}
          />
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

export default Guild
