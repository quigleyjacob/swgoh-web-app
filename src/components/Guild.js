// @ts-nocheck
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Header, Menu, Segment, Button, Icon, Progress } from 'semantic-ui-react';
import GuildProfile from './guild/GuildProfile.js';
import TBCommands from './guild/TBCommands.js';
import TBOperations from './guild/TBOperations.js';
import DatacronChecklist from './guild/DatacronChecklist.js';
import { useLocation } from "react-router-dom"
import GuildDatacronCompliance from './guild/GuildDatacronCompliance.js';
import { getGuild, getIsGuildBuild, createGuildRefreshJob } from '../server/guild.js';
import GuildUnits from './guild/GuildUnits.js';
import ActiveRaid from './guild/ActiveRaid.js';

const tabItems = [
  {tab: 'Guild', requiresGuildBuild: false, ownGuildOnly: false},
  {tab: 'Guild Units', requiresGuildBuild: false, ownGuildOnly: false},
  {tab: 'Raid', requiresGuildBuild: false, ownGuildOnly: true},
  {tab: 'TB Commands', requiresGuildBuild: true, ownGuildOnly: true},
  {tab: 'TB Operations', requiresGuildBuild: true, ownGuildOnly: true},
  // {tab: 'Datacron Checklist', requiresGuildBuild: true, ownGuildOnly: true},
  // {tab: 'Guild Datacron Compliance', requiresGuildBuild: true, ownGuildOnly: true}
]

function Guild ({loggedInAllyCode, loggedInGuildId, redirect, displayMessage, session, displayModal, name, units, setLoaderMessage, setLoaderVisible, datacrons, affixTextMap, guild, setGuild, authStatus}){

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
  const [initialPageLoading, setInitialPageLoading] = useState(false)
  const [displayNotGuildBuildMessage, setDisplayNotGuildBuildMessage] = useState(false)
  const [activeRaid, setActiveRaid] = useState({})
  const [refreshJobId, setRefreshJobId] = useState(null)
  const [refreshJobProgress, setRefreshJobProgress] = useState(0)
  const [refreshJobStatus, setRefreshJobStatus] = useState('')
  const [refreshJobLoading, setRefreshJobLoading] = useState(false)
  const refreshJobInterval = useRef(null)

  const isOwnGuild = loggedInGuildId === guildId

  const getGuildCallback = useCallback(async () => {
    // only want to load guild data on first load of guild page, anytime after let user decide when to, unless you are accessing a new guild, then pull new data
    if(Object.keys(guild).length === 0 || guild?.profile?.id !== guildId) {
      try {
        setInitialPageLoading(true)
        await getGuild(guildId, session, setGuild, displayMessage, guild, false, false)
        await getGuild(guildId, session, setGuild, displayMessage, guild, false, true)
      } finally {
        setInitialPageLoading(false)
      }
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
	}, [isGuildBuildCallback, getGuildCallback])

  useEffect(() => {
    const activeTab = tabItems.find(item => item.tab === activeItem)
    if(activeTab?.ownGuildOnly && !isOwnGuild) {
      setActiveItem('Guild')
    }
  }, [activeItem, isOwnGuild])

  const clearRefreshJobInterval = () => {
    if (refreshJobInterval.current) {
      try {
        if (typeof refreshJobInterval.current.close === 'function') {
          refreshJobInterval.current.close()
        } else if (typeof refreshJobInterval.current.cancel === 'function') {
          // reader from fetch stream
          try { refreshJobInterval.current.cancel() } catch(e) {}
        } else {
          clearInterval(refreshJobInterval.current)
        }
      } catch (e) {
        // ignore
      }
      refreshJobInterval.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearRefreshJobInterval()
    }
  }, [])

  const startGuildRefreshJob = useCallback(async () => {
    if (!isOwnGuild || refreshJobLoading) {
      return
    }

    setRefreshJobLoading(true)
    setRefreshJobProgress(0)
    setRefreshJobStatus('Submitting refresh job...')

    try {
      const job = await createGuildRefreshJob(guildId, session, true)
      setRefreshJobId(job.id)
      setRefreshJobProgress(job.progress || 0)
      setRefreshJobStatus(job.message || 'Queued')
      displayMessage('Guild refresh job started.', true)

      // Use fetch streaming so we can set the session header
      const streamUrl = `${process.env.REACT_APP_SERVER_BASE_URL}/api/jobs/${job.id}/stream`
      const resp = await fetch(streamUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'text/event-stream', session }
      })

      if (!resp.ok || !resp.body) {
        throw new Error('Unable to open job stream')
      }

      const reader = resp.body.getReader()
      refreshJobInterval.current = reader

      const utf8Decoder = new TextDecoder('utf-8')
      let buffer = ''

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += utf8Decoder.decode(value, { stream: true })

          let parts = buffer.split('\n\n')
          buffer = parts.pop() || ''
          for (const part of parts) {
            const line = part.split('\n').find(l => l.startsWith('data:'))
            if (!line) continue
            const payload = line.replace(/^data:\s*/, '')
            try {
              const status = JSON.parse(payload)
              setRefreshJobProgress(status.progress || 0)
              setRefreshJobStatus(status.message || status.status || '')

              if (status.status === 'completed' || status.status === 'failed') {
                clearRefreshJobInterval()
                setRefreshJobLoading(false)
                setRefreshJobId(null)

                if (status.status === 'completed') {
                  setRefreshJobProgress(100)
                  setRefreshJobStatus('Refresh job complete')
                  await getGuild(guildId, session, setGuild, displayMessage, guild, false, true)
                } else {
                  displayMessage(`Guild refresh job failed: ${status.error || status.message}`, false)
                }
                return
              }
            } catch (err) {
              clearRefreshJobInterval()
              setRefreshJobLoading(false)
              setRefreshJobStatus('Job stream parse error')
              displayMessage(err.message || 'Job stream parse error', false)
              return
            }
          }
        }
      }

      pump().catch(err => {
        clearRefreshJobInterval()
        setRefreshJobLoading(false)
        setRefreshJobStatus('Job stream error')
        displayMessage(err.message || 'Job stream error', false)
      })
    } catch (err) {
      setRefreshJobLoading(false)
      setRefreshJobStatus('Failed to start job')
      displayMessage(err.message || 'Failed to start guild refresh job', false)
    }
  }, [displayMessage, guild, guildId, isOwnGuild, refreshJobLoading, session, setGuild])

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
          case 'Guild Units':
            return <GuildUnits guild={guild} units={units} />
          case 'Raid':
            return <ActiveRaid redirect={redirect} session={session} displayMessage={displayMessage} guild={guild} loggedInAllyCode={loggedInAllyCode} loggedInGuildId={loggedInGuildId} displayModal={displayModal} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} activeRaid={activeRaid} setActiveRaid={setActiveRaid} authStatus={authStatus}/>
          case 'TB Commands':
              return <TBCommands redirect={redirect} guildId={guildId} session={session} isOfficer={isOfficer} displayMessage={displayMessage} displayModal={displayModal}/>
          case 'TB Operations':
              return <TBOperations redirect={redirect} guildId={guildId} session={session} isOfficer={isOfficer} displayMessage={displayMessage} displayModal={displayModal} guild={guild} units={units}/>
          case 'Datacron Checklist':
              return <DatacronChecklist redirect={redirect} guildId={guildId} guild={guild} isOfficer={isOfficer} datacrons={datacrons} affixTextMap={affixTextMap} session={session} displayMessage={displayMessage}/>
            case 'Guild Datacron Compliance':
              return <GuildDatacronCompliance redirect={redirect} guildId={guildId} guild={guild} isOfficer={isOfficer} datacrons={datacrons} affixTextMap={affixTextMap} session={session} displayMessage={displayMessage} />
          default:
            return <Header>Unknown</Header>
      }
  }

  const getTabs = () => {
    return tabItems.map(({tab, requiresGuildBuild, ownGuildOnly}) => {
      const isDisabled = (ownGuildOnly && !isOwnGuild) || (requiresGuildBuild && !isGuildBuild)
      return <Menu.Item
        key={tab}
        name={tab}
        active={activeItem === tab}
        onClick={handleItemClick}
        disabled={isDisabled}
        title={ownGuildOnly && !isOwnGuild ? `${tab} is only available for your own guild` : undefined}
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
                <Button loading={initialPageLoading || refreshJobLoading} floated='right' primary disabled={!isOwnGuild || refreshJobLoading || initialPageLoading} onClick={startGuildRefreshJob} style={{ marginRight: '10px' }}><Icon name='refresh'/>Refresh Guild Data</Button>
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

    {(refreshJobId || refreshJobLoading) &&
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        zIndex: 1100,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.98)',
        padding: '12px',
        color: '#1b1c1d'
      }}>
        <Header as='h5' style={{ margin: '0 0 8px 0' }}>
          Guild Refresh Status
        </Header>
        <Progress
          percent={refreshJobProgress}
          indicating={refreshJobLoading}
          progress
          size='small'
        />
        <div style={{ fontSize: '0.95rem', minHeight: '1.25rem', marginTop: '6px' }}>
          {refreshJobStatus || 'Pending...'}
        </div>
      </div>
    }
	</div>
}

export default Guild
