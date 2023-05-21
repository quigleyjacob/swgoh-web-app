// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
import GuildProfile from './guild/GuildProfile.js';
import TBCommands from './guild/TBCommands.js';
import TBOperations from './guild/TBOperations.js';
import { useLocation } from "react-router-dom"

function Guild ({redirect, displayMessage, session, displayModal, name, units, setLoaderMessage, setLoaderVisible}){

  const location = useLocation()
  const { guildId, tab } = location.state

  const [activeItem, setActiveItem] = useState(tab || 'guild')
  const [guild, setGuild] = useState({})
  const [isGuildBuild, setIsGuildBuild] = useState(false)

	useEffect(() => {
		redirect('guild')
    const getGuildData = async () => { 
      if(session !== '') {
        let body = {
          guildId: guildId,
          detailed: true,
          refresh: false,
          projection: {
            name: 1,
            allyCode: 1,
            rosterUnit: {
              definitionId: 1,
              currentRarity: 1,
              currentLevel: 1,
              currentTier: 1,
              zetaCount: 1,
              omicronCount: 1,
              relic: 1
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
          displayMessage(error, false)
        }
      }
    }
    let activeBuilds = async () => {
      if(session !== '') {
        let body = {
          session: session,
          guildId: guildId
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild/build`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(body)
        })
        if(response.ok) {
          let isGuildBuild = await response.text()
          setIsGuildBuild(Boolean(isGuildBuild))
        } else {
          let error = await response.text()
          displayMessage(error, false)
        }
      }
    }
    activeBuilds()
    getGuildData()
	}, [guildId, displayMessage, redirect, session])

  const isOfficer = () => {
    // return true // uncomment to do dev work, remember recomment when pushing changes
    let filteredGuild = guild?.member?.filter(member => member.playerName === name)
    if(filteredGuild && filteredGuild.length > 0) {
      return filteredGuild[0].memberLevel > 2
    } else {
      return false
    }
  }

  const handleItemClick = (e, obj) => {
      setActiveItem(obj.name)
  }

  const notGuildBuild = () => {
    return <Header>Guild is not registered with the guild build.</Header>
  }

  const getActiveItem = () => {
      switch(activeItem) {
          case 'guild':
            return <GuildProfile redirect={redirect} guild={guild}/>
          case 'TB Commands':
            if(isGuildBuild) {
              return <TBCommands redirect={redirect} guildId={guildId} session={session} isOfficer={isOfficer} displayMessage={displayMessage} displayModal={displayModal}/>
            } else {
              return notGuildBuild()
            }
            
          case 'TB Operations':
            if(isGuildBuild) {
              return <TBOperations redirect={redirect} guildId={guildId} session={session} isOfficer={isOfficer} displayMessage={displayMessage} displayModal={displayModal} guild={guild} units={units} setGuild={setGuild} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible}/>
            } else {
              return notGuildBuild()
            }
          default:
            return <Header>Unknown</Header>
      }
  }

	return <div>
    <Grid>
      <Grid.Column computer={2} mobile={16}>
        <Menu fluid vertical tabular>
          <Menu.Item
            name='guild'
            active={activeItem === 'guild'}
            onClick={handleItemClick}
          />
          <Menu.Item
            name='TB Commands'
            active={activeItem === 'TB Commands'}
            onClick={handleItemClick}
          />
          <Menu.Item
            name='TB Operations'
            active={activeItem === 'TB Operations'}
            onClick={handleItemClick}
          />
        </Menu>
      </Grid.Column>
      <Grid.Column stretched computer={14} mobile={16}>
        <Segment>
          {getActiveItem()}
        </Segment>
      </Grid.Column>
    </Grid>
	</div>
}

export default Guild
