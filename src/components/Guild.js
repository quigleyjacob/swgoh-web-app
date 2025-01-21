// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Header, Menu, Segment, Button, Icon, Form, Radio, Item, Modal } from 'semantic-ui-react';
import GuildProfile from './guild/GuildProfile.js';
import TBCommands from './guild/TBCommands.js';
import TBOperations from './guild/TBOperations.js';
import DatacronChecklist from './guild/DatacronChecklist.js';
import { useLocation } from "react-router-dom"
import GuildDatacronCompliance from './guild/GuildDatacronCompliance.js';
import { getGuild, getIsGuildBuild } from '../server/guild.js';

function Guild ({loggedInGuildId, redirect, displayMessage, session, displayModal, name, units, setLoaderMessage, setLoaderVisible, datacrons, guild, setGuild}){

  const location = useLocation()
  const params = useParams()
  const getGuildIdAndTab = () => {
    return {
      guildId: location?.state?.guildId || params.guildId,
      tab: location?.state?.tab || 'Guild'
    }
  }
  const { guildId, tab } = getGuildIdAndTab()

  const [activeItem, setActiveItem] = useState(tab)
  const [isGuildBuild, setIsGuildBuild] = useState(false)
  const [detailed, setDetailed] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [datacronProjection, setDatacronProjection] = useState(false)
  const [guildRefreshModalVisible, setGuildRefreshModalVisible] = useState(false)
  const [guildDataLoading, setGuildDateLoading] = useState(false)
  const [displayNotGuildBuildMessage, setDisplayNotGuildBuildMessage] = useState(false)

  const getGuildCallback = useCallback(async () => {
    // only want to load guild data on first load of guild page, anytime after let user decide when to, unless you are accessing a new guild, then pull new data
    if(Object.keys(guild).length === 0 || guild?.profile?.id !== guildId) {
      setGuildDateLoading(true)
      await getGuild(guildId, session, setGuild, displayMessage)
      setGuildDateLoading(false)
    }
  }, [session, displayMessage, guildId, guild, setGuild])

  let isGuildBuildCallback = useCallback(async () => {
    if(loggedInGuildId !== guildId) {
      return
    }
    if(session && session !== '') {
      getIsGuildBuild(session, guildId, displayMessage, setIsGuildBuild, setDisplayNotGuildBuildMessage)
    }
  }, [session, setIsGuildBuild, displayMessage, guildId, loggedInGuildId])

	useEffect(() => {
    isGuildBuildCallback()
    getGuildCallback()
	}, [redirect, isGuildBuildCallback, getGuildCallback])

  const isOfficer = () => {
    if(!session || session === '') {
      return false
    }
    if(loggedInGuildId !== guild?.profile?.id) {
      return false
    }
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

  const getActiveItem = () => {
      switch(activeItem) {
          case 'Guild':
            return <GuildProfile redirect={redirect} guild={guild}/>
          case 'TB Commands':
              return <TBCommands redirect={redirect} guildId={guildId} session={session} isOfficer={isOfficer} displayMessage={displayMessage} displayModal={displayModal}/>
          case 'TB Operations':
              return <TBOperations redirect={redirect} guildId={guildId} session={session} isOfficer={isOfficer} displayMessage={displayMessage} displayModal={displayModal} guild={guild} units={units}/>
          case 'Datacron Checklist':
              return <DatacronChecklist redirect={redirect} guildId={guildId} guild={guild} isOfficer={isOfficer} datacrons={datacrons} session={session} displayMessage={displayMessage}/>
            case 'Guild Datacron Compliance':
              return <GuildDatacronCompliance redirect={redirect} guildId={guildId} guild={guild} isOfficer={isOfficer} datacrons={datacrons} session={session} displayMessage={displayMessage} />
          default:
            return <Header>Unknown</Header>
      }
  }

  const getTabs = () => {
    return [
      {tab: 'Guild', requiresGuildBuild: false}, 
      {tab: 'TB Commands', requiresGuildBuild: true}, 
      {tab: 'TB Operations', requiresGuildBuild: true}, 
      {tab: 'Datacron Checklist', requiresGuildBuild: true}, 
      {tab: 'Guild Datacron Compliance', requiresGuildBuild: true}
    ].map(({tab, requiresGuildBuild}) => {
      return <Menu.Item
        key={tab}
        name={tab}
        active={activeItem === tab}
        onClick={handleItemClick}
        disabled={requiresGuildBuild && !isGuildBuild}
      />
    })
  }

	return <div>
    <Grid>
      <Grid.Column computer={2} mobile={16}>
        <Segment>
        <Menu fluid vertical tabular>
          {getTabs()}
        </Menu>
        </Segment>

      </Grid.Column>
      <Grid.Column stretched computer={14} mobile={16}>
        <Segment>
          <Grid>
            <Grid.Row>
              <Grid.Column floated='right' fluid>
              <Button loading={guildDataLoading} floated='right' primary disabled={guildDataLoading} onClick={() => setGuildRefreshModalVisible(true)}><Icon name='refresh'/>Refresh/Load Guild Data</Button>
              </Grid.Column>
            </Grid.Row>
            {
              displayNotGuildBuildMessage
              ?
              <Grid.Row>
                <Grid.Column>
                  <Header size='tiny'>It seems your guild is not registered to use guild features. If you think you might be interested in what tools QuigBot has to offer, please reach out to Quig on Discord by joining the Discord server (link in the footer)</Header>
                </Grid.Column>
              </Grid.Row>
              :''
            }
            <Grid.Row>
              <Grid.Column>
                {getActiveItem()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </Grid.Column>
    </Grid>

      <Modal
        onClose={() => setGuildRefreshModalVisible(false)}
        onOpen={() => setGuildRefreshModalVisible(true)}
        open={guildRefreshModalVisible}
        >
        <Modal.Header>Refresh Guild Data</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <Item.Group>
              <Item key={0} content='Please select which of the following options you would like to perform:'/>
              <Item key={1}>
              <Form>
                <Form.Field>
                  <Radio 
                    toggle
                    label='Refresh Guild Data'
                    name='radioGroup'
                    checked={refresh === true && detailed === false && datacronProjection === false}
                    onChange={() => {setRefresh(true);setDetailed(false);setDatacronProjection(false)}}
                  />
                </Form.Field>
                <Form.Field>
                  <Radio
                    toggle
                    label='Refresh Guild Member Rosters (Will take time)'
                    name='radioGroup'
                    checked={refresh === true && detailed === true && datacronProjection === false}
                    onChange={() => {setRefresh(true);setDetailed(true);setDatacronProjection(false)}}
                    disabled={!isGuildBuild || !isOfficer()}
                  />
                </Form.Field>
                <Form.Field>
                  <Radio
                    toggle
                    label='Load Guild Member Rosters (May take time if not cached)'
                    name='radioGroup'
                    checked={refresh === false && detailed === true && datacronProjection === false}
                    onChange={() => {setRefresh(false);setDetailed(true);setDatacronProjection(false)}}
                    disabled={!isGuildBuild || !isOfficer()}
                  />
                </Form.Field>
                <Form.Field>
                  <Radio
                    toggle
                    label='Refresh Guild Member Datacrons (May take time if not cached)'
                    name='radioGroup'
                    checked={refresh === true && detailed === true && datacronProjection === true}
                    onChange={() => {setRefresh(true);setDetailed(true);setDatacronProjection(true)}}
                    disabled={!isGuildBuild || !isOfficer()}
                  />
                </Form.Field>
                <Form.Field>
                  <Radio
                    toggle
                    label='Load Guild Member Datacrons (May take time if not cached)'
                    name='radioGroup'
                    checked={refresh === false && detailed === true && datacronProjection === true}
                    onChange={() => {setRefresh(false);setDetailed(true);setDatacronProjection(true)}}
                    disabled={!isGuildBuild || !isOfficer()}
                  />
                </Form.Field>
              </Form>
              </Item>
              <Item key={2} content='This operation will run in the background of this webpage, and you will be notified when it is complete.'/>
            </Item.Group>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            content='Nope'
            color='black'
            onClick={() => {
              setRefresh(false)
              setDetailed(false)
              setDatacronProjection(false)
              setGuildRefreshModalVisible(false)
            }}
          />
          <Button
            content="Confirm"
            labelPosition='right'
            icon='checkmark'
            onClick={async () => {
              setGuildDateLoading(true)
              setGuildRefreshModalVisible(false)
              await getGuild(guildId, session, setGuild, displayMessage, refresh, detailed, datacronProjection)
              setRefresh(false)
              setDetailed(false)
              setDatacronProjection(false)
              setGuildDateLoading(false)
            }}
            positive
          />
        </Modal.Actions>
      </Modal>
	</div>
}

export default Guild
