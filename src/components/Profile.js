// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
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
import { getPlayerData, getPlayerGACHistory, saveGac } from '../server/player'
import { getDatacronNames } from '../server/datacrons';
import { useDebounce } from 'use-debounce'

function Profile ({loggedInAllyCode, redirect, displayMessage, displayModal, units, session, setLoaderVisible, setLoaderMessage, categories, datacrons, account, setAccount}){

  const WAIT_INTERVAL = 5000
  const [activeGac, setActiveGac] = useState({})
  const [deBounceActiveGac] = useDebounce(activeGac, WAIT_INTERVAL)

  const location = useLocation()
  const { allyCode, tab } = location.state

  const [activeItem, setActiveItem] = useState(tab || 'profile')
  const [squads, setSquads] = useState([])
  const [datacronNames, setDatacronNames] = useState({})
  const [gacHistory, setGacHistory] = useState([])
  
  const [activeGacId, setActiveGacId] = useState('')
  const [opponent, setOpponent] = useState({})

  const getPlayerDataCallback = useCallback(async () => {
    let account = await getPlayerData(session, allyCode, displayMessage)
    setAccount(account)
  }, [allyCode, session, displayMessage, setAccount])

  const getSquadsCallback = useCallback(async () => {
    let squads = await getSquads(session, allyCode, displayMessage)
    setSquads(squads)
  }, [allyCode, session, displayMessage])

  const getDatacronNamesCallback = useCallback(async () => {
    let datacronNames = await getDatacronNames(session, allyCode, displayMessage)
    setDatacronNames(datacronNames)
}, [allyCode, session, displayMessage])

  const getGacHistoryCallback = useCallback(async () => {
    let gacHistory = await getPlayerGACHistory(session, allyCode, displayMessage)
    setGacHistory(gacHistory)
  }, [allyCode, session, displayMessage])

	useEffect(() => {
		redirect('profile')
    getPlayerDataCallback()
    getSquadsCallback()
    getDatacronNamesCallback()
    getGacHistoryCallback()
	}, [getPlayerDataCallback, getSquadsCallback, getDatacronNamesCallback, getGacHistoryCallback, redirect])

  useEffect(() => {
    saveGac(session, deBounceActiveGac, activeGacId, displayMessage, false)
  }, [deBounceActiveGac, activeGacId, displayMessage, session])

  const handleItemClick = (e, obj) => {
      setActiveItem(obj.name)
  }

  const getActiveItem = () => {
      switch(activeItem) {
          case 'profile':
              return <PlayerProfile account={account} redirect={redirect} session={session} />
          case 'characters':
              return <Characters account={account} redirect={redirect} units={units} categories={categories}/>
          case 'ships':
              return <Ships account={account} redirect={redirect} units={units} categories={categories}/>
          case 'gacPlanner':
              return <Gac
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
              />
          case 'squads':
              return <Squads session={session} units={units} account={account} categories={categories} squads={squads} setSquads={setSquads}/>
          case 'gacHistory':
              return <GacHistory session={session} units={units} account={account} categories={categories} gacHistory={gacHistory} datacrons={datacrons}/>
          case 'gacReview':
              return <GacReview session={session} redirect={redirect} datacrons={datacrons} account={account} displayMessage={displayMessage} units={units}/>
          case 'datacrons':
              return <Datacrons session={session} redirect={redirect} datacrons={datacrons} account={account} displayMessage={displayMessage} datacronNames={datacronNames} setDatacronNames={setDatacronNames} isEditable={true}/>
          default:
            return <Header>Unknown</Header>
      }
  }

	return <div>
        <Grid>
        <Grid.Column computer={2} mobile={16}>
          <Menu fluid vertical tabular>
            <Menu.Item
              name='profile'
              active={activeItem === 'profile'}
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
            <Menu.Item 
              hidden={loggedInAllyCode !== allyCode}
              name='gacHistory'
              active={activeItem === 'gacHistory'}
              onClick={handleItemClick}
            />
            <Menu.Item
              hidden={loggedInAllyCode !== allyCode}
              name='gacReview'
              active={activeItem === 'gacReview'}
              onClick={handleItemClick}
            />
            <Menu.Item 
              hidden={loggedInAllyCode !== allyCode}
              name='datacrons'
              active={activeItem === 'datacrons'}
              onClick={handleItemClick}
            />
            </span>
            :
            ''
            }
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