// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Header, Menu, Segment, Button, Icon } from 'semantic-ui-react';
import GuildProfile from './guild/GuildProfile.js';
import TBCommands from './guild/TBCommands.js';
import TBOperations from './guild/TBOperations.js';
import DatacronChecklist from './guild/DatacronChecklist.js';
import { useLocation } from "react-router-dom"
import GuildDatacronCompliance from './guild/GuildDatacronCompliance.js';
import { getGuildData } from '../server/guild.js';

function Guild ({redirect, displayMessage, session, displayModal, name, units, setLoaderMessage, setLoaderVisible, datacrons}){

  const location = useLocation()
  const { guildId, tab } = location.state

  const [activeItem, setActiveItem] = useState(tab || 'guild')
  const [guild, setGuild] = useState({})
  const [isGuildBuild, setIsGuildBuild] = useState(false)

  const getGuild = useCallback(async () => {
    getGuildData(guildId, session, true, false, setGuild, setLoaderVisible, setLoaderMessage, displayMessage)
  }, [session, displayMessage, guildId, setLoaderMessage, setLoaderVisible])

  let activeBuilds = useCallback(async () => {
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
  }, [session, setIsGuildBuild, displayMessage, guildId])

	useEffect(() => {
		redirect('guild')
    activeBuilds()
    getGuild()
	}, [redirect, activeBuilds, getGuild])

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
              return <TBOperations redirect={redirect} guildId={guildId} session={session} isOfficer={isOfficer} displayMessage={displayMessage} displayModal={displayModal} guild={guild} units={units}/>
            } else {
              return notGuildBuild()
            }
          case 'Datacron Checklist':
            if(isGuildBuild) {
              return <DatacronChecklist redirect={redirect} guild={guild} isOfficer={isOfficer} datacrons={datacrons} session={session} displayMessage={displayMessage}/>
            } else {
              return notGuildBuild()
            }
            case 'Guild Datacron Compliance':
            if(isGuildBuild) {
              return <GuildDatacronCompliance redirect={redirect} guild={guild} isOfficer={isOfficer} datacrons={datacrons} session={session} displayMessage={displayMessage} />
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
          <Menu.Item
            name='Datacron Checklist'
            active={activeItem === 'Datacron Checklist'}
            onClick={handleItemClick}
          />
          <Menu.Item
            name='Guild Datacron Compliance'
            active={activeItem === 'Guild Datacron Compliance'}
            onClick={handleItemClick}
          />
        </Menu>
      </Grid.Column>
      <Grid.Column stretched computer={14} mobile={16}>
        <Segment>
          <Grid>
            <Grid.Row>
              <Grid.Column floated='right' fluid>
              <Button floated='right' primary disabled={!isOfficer()} onClick={() => getGuildData(guildId, session, true, true, setGuild, setLoaderVisible, setLoaderMessage, displayMessage)}><Icon name='refresh'/>Refresh Guild</Button>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {getActiveItem()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </Grid.Column>
    </Grid>
	</div>
}

export default Guild
