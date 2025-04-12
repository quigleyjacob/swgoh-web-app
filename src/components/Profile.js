// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useLocation } from "react-router-dom"
import PlayerProfile from './profile/PlayerProfile';
import Characters from './profile/Characters';
import Ships from './profile/Ships';
import Gac from './gac/Gac.js'
import Squads from './profile/Squads';
import GacHistory from './profile/GacHistory';
import GacReview from './profile/GacReview';
import Datacrons from './profile/Datacrons';
import { getSquads } from '../server/squads';
import { getPlayerData } from '../server/player'
import { getGac, getGacs, updateGac } from '../server/gac';
import { getDatacronNames } from '../server/datacrons';
import { useDebounce } from 'use-debounce'
import GuildDatacronCompliance from './profile/GuildDatacronCompliance';
import Inventory from './profile/Inventory.js';

function Profile ({loggedInAllyCode, redirect, displayMessage, displayModal, units, session, setLoaderVisible, setLoaderMessage, categories, datacrons, affixTextMap, account, setAccount, nicknames}){

  const WAIT_INTERVAL = 5000
  const [activeGac, setActiveGac] = useState({})
  const [deBounceActiveGac] = useDebounce(activeGac, WAIT_INTERVAL)

  const location = useLocation()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const getAllyCodeAndTab = () => {
    return {
      allyCode: location?.state?.allyCode || params.allyCode,
      tab: location?.state?.tab || searchParams.get('tab') || 'profile'
    }
  }
  const { allyCode, tab } = getAllyCodeAndTab()

  const [activeItem, setActiveItem] = useState(tab)
  const [squads, setSquads] = useState([])
  const [datacronNames, setDatacronNames] = useState({})
  const [gacHistory, setGacHistory] = useState([])
  const [step, setStep] = useState(0)
  
  const [activeGacId, setActiveGacId] = useState('')
  const [opponent, setOpponent] = useState({})

  const getPlayerDataCallback = useCallback(async () => {
    setLoaderMessage('Retrieving player data.')
    setLoaderVisible(true)
    await getPlayerData(session, allyCode, displayMessage, setAccount)
    setLoaderVisible(false)
  }, [allyCode, session, displayMessage, setAccount, setLoaderMessage, setLoaderVisible])

  const getSquadsCallback = useCallback(async () => {
    if(allyCode !== loggedInAllyCode) {
      return
    }
    getSquads(session, allyCode, displayMessage, setSquads)
  }, [allyCode, session, displayMessage, loggedInAllyCode])

  const getDatacronNamesCallback = useCallback(async () => {
    if(allyCode !== loggedInAllyCode) {
      return
    }
    getDatacronNames(session, allyCode, displayMessage, setDatacronNames)
}, [allyCode, session, displayMessage, loggedInAllyCode])

  const getGacHistoryCallback = useCallback(async () => {
    if(allyCode !== loggedInAllyCode) {
      return
    }
    getGacs(session, allyCode, displayMessage, setGacHistory)
  }, [allyCode, session, displayMessage, loggedInAllyCode])

	useEffect(() => {
    getPlayerDataCallback()
    getSquadsCallback()
    getDatacronNamesCallback()
    getGacHistoryCallback()
	}, [getPlayerDataCallback, getSquadsCallback, getDatacronNamesCallback, getGacHistoryCallback, redirect])

  useEffect(() => {
    updateGac(activeGacId, session, allyCode, deBounceActiveGac, displayMessage, false)
    // eslint-disable-next-line
  }, [deBounceActiveGac])

  useEffect(() => {
    (async () => {
      let gacId = searchParams.get('gacId')
      let opponentAllyCode = searchParams.get('opponentAllyCode')
      if(session && allyCode && gacId && opponentAllyCode) {
        redirect('gacPlanner')
        getPlayerData(session, opponentAllyCode, displayMessage, setOpponent)
        getGac(gacId, session, allyCode, displayMessage, setActiveGac, setActiveGacId, step, setStep)
      }
    })()
    // eslint-disable-next-line
  }, [session, allyCode])

  const handleItemClick = (e, obj) => {
      setActiveItem(obj.name)
  }

  const getActiveItem = () => {
      switch(activeItem) {
          case 'profile':
              return <PlayerProfile account={account} redirect={redirect} session={session} units={units}/>
          case 'characters':
              return <Characters account={account} redirect={redirect} units={units} categories={categories} nicknames={nicknames}/>
          case 'ships':
              return <Ships account={account} redirect={redirect} units={units} categories={categories} nicknames={nicknames}/>
          case 'gacPlanner':
              return <Gac
                loggedInAllyCode={loggedInAllyCode}
                units={units}
                account={account}
                setLoaderVisible={setLoaderVisible}
                setLoaderMessage={setLoaderMessage}
                session={session}
                redirect={redirect}
                categories={categories}
                displayMessage={displayMessage}
                squads={squads}
                gacHistory={gacHistory}
                activeGac={activeGac}
                setActiveGac={setActiveGac}
                activeGacId={activeGacId}
                setActiveGacId={setActiveGacId}
                opponent={opponent}
                setOpponent={setOpponent}
                setGacHistory={setGacHistory}
                displayModal={displayModal}
                datacrons={datacrons}
                datacronNames={datacronNames}
                nicknames={nicknames}
                setSquads={setSquads}
                step={step}
                setStep={setStep}
              />
          case 'squads':
              return <Squads session={session} units={units} account={account} categories={categories} squads={squads} setSquads={setSquads} displayMessage={displayMessage} nicknames={nicknames}/>
          case 'gacHistory':
              return <GacHistory session={session} units={units} account={account} categories={categories} gacHistory={gacHistory} datacrons={datacrons} displayMessage={displayMessage}/>
          case 'gacReview':
              return <GacReview session={session} redirect={redirect} datacrons={datacrons} account={account} displayMessage={displayMessage} units={units}/>
          case 'datacrons':
              return <Datacrons session={session} redirect={redirect} datacrons={datacrons} affixTextMap={affixTextMap} account={account} displayMessage={displayMessage} datacronNames={datacronNames} setDatacronNames={setDatacronNames} isEditable={true}/>
          case 'guildDatacronCompliance':
              return <GuildDatacronCompliance session={session} redirect={redirect} account={account} displayMessage={displayMessage} datacrons={datacrons}/>
          case 'inventory':
              return <Inventory session={session} redirect={redirect} account={account} displayMessage={displayMessage} displayModal={displayModal} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} datacrons={datacrons}/>
          default:
            return <Header>Unknown</Header>
      }
  }

  const getTabs = () => {
    return [
      {name: 'profile', locked: false},
      {name: 'characters', locked: false},
      {name: 'ships', locked: false},
      {name: 'datacrons', locked: false},
      {name: 'gacPlanner', locked: true},
      {name: 'squads', locked: true},
      {name: 'gacHistory', locked: true},
      {name: 'gacReview', locked: true},
      {name: 'guildDatacronCompliance', locked: true},
      {name: 'inventory', locked: true}
    ].map(({name, locked}) => {
      return <Menu.Item
        name={name}
        active={activeItem === name}
        onClick={handleItemClick}
        disabled={locked && allyCode !== loggedInAllyCode}
      />
    })
  }

	return <div>
        <Grid>
        <Grid.Column computer={2} mobile={16}>
          <Menu fluid vertical tabular>
            {getTabs()}
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

export default Profile;