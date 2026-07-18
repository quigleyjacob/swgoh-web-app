// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { Message, Transition, Modal, Button, Dimmer, Loader, Item } from 'semantic-ui-react'
import './App.css'
import 'semantic-ui-css/semantic.min.css'
import Home from './components/Home.js'
import Login from './components/Login.js'
import Authenticate from './components/Authenticate.js'
import AccountSelect from './components/AccountSelect.js'
import Guild from './components/Guild.js'
import Navbar from './components/Navbar.js'
import Profile from './components/Profile.js'
import Privacy from './components/Privacy'
import Settings from './components/Settings.js'
import Terms from './components/Terms'
import Footer from './components/Footer'
import Contact from './components/Contact'
import Infographics from './components/Infographics'
import EraData from './components/EraData.js'
import { refreshPlayerData, getPlayerData, getPlayerNameAndGuildId, getAuthStatus } from './server/player.js'
import { getNicknames, getPlayableUnits, getVisibleCategories, getActiveDatacrons } from './server/data.js'
import { expireCookie, getCookieValue } from './utils/cookie.js'
import Leaderboard from './components/Leaderboard.js'

function App() {
  const navigate = useNavigate()

  const fxn = () => {}

  let [session, setSession] = useState('')
  let [allyCode, setAllyCode] = useState('')
  let [name, setName] = useState('')
  let [guildId, setGuildId] = useState('')
  const [account, setAccount] = useState({})
  const [guild, setGuild] = useState({})
  const [authStatus, setAuthStatus] = useState(false)
  const [authStatusError, setAuthStatusError] = useState('')

  // message State
  let [messageVisible, setMessageVisible] = useState(false)
  let [messagePositive, setMessagePositive] = useState(false)
  let [messageContent, setMessageContent] = useState('')

  // modal state
  let [modalVisible, setModalVisible] = useState(false)
  let [modalContent, setModalContent] = useState('')
  let [modalAction, setModalAction] = useState(() => () => fxn())
  let [modalPositive, setModalPositive] = useState(false)
  let [showAltAction, setShowAltAction] = useState(true)

  // loader state
  let [loaderVisible, setLoaderVisible] = useState(false)
  let [loaderMessage, setLoaderMessage] = useState('')

  // units state
  let [units, setUnits] = useState([])
  let [categories, setCategories] = useState({})
  let [datacrons, setDatacrons] = useState([])
  let [affixTextMap, setAffixTextMap] = useState({})
  let [nicknames, setNicknames] = useState({})

  const displayMessage = useCallback((message, positive) => {
    setMessageContent(message)
    setMessagePositive(positive)
    setMessageVisible(true)
    setTimeout(() => {
      setMessageVisible(false)
    }, 3000)
  }, [])

  const getUnits = useCallback(async () => {
      getPlayableUnits(displayMessage, setUnits)
  }, [displayMessage])

  const getCategories = useCallback(async () => {
      getVisibleCategories(displayMessage, setCategories)
  }, [displayMessage])

  const getDatacrons = useCallback(async () => {
      getActiveDatacrons(displayMessage, setDatacrons, setAffixTextMap)
  }, [displayMessage])

  const getNicknamesCallback = useCallback(async () => {
      getNicknames(displayMessage, setNicknames)
  }, [displayMessage])

  const getPlayerDataCallback = useCallback(async () => {
    if(session && allyCode) {
      getPlayerNameAndGuildId(session, allyCode, displayMessage, setName, setGuildId)
    }
  }, [displayMessage, session, allyCode])

  useEffect(() => {
    (async () => {
      let session = getCookieValue('session')
      let allyCode = getCookieValue('allyCode')
      if(session && !allyCode) {
        navigate('/accountSelect')
      }
      setSession(session)
      if(session === '') {
        setAllyCode('')
      } else {
        setAllyCode(allyCode)
      }
      getUnits()
      getCategories()
      getDatacrons()
      getPlayerDataCallback()
      getNicknamesCallback()
    })()
  }, [getUnits, getCategories, getDatacrons, getPlayerDataCallback, getNicknamesCallback, session, navigate])

  const isAuthenticated = useCallback(() => {
    return session !== ''
  }, [session])

  const inGuild = useCallback(() => guildId !== '', [guildId])

  const redirect = useCallback((from) => {
    if(!isAuthenticated()) {
      if(from !== 'login') {
        navigate('/login')
      }
    }
    else if(allyCode === '') {
      if(from !== 'accountSelect') {
        navigate('/accountSelect')
      }
    } else if(!inGuild() && from === 'guild') {
      navigate('/')
    }
  }, [isAuthenticated, allyCode, inGuild, navigate])

  const logout = () => {
    expireCookie("session")
    expireCookie("allyCode")
    setSession('')
    setAllyCode('')
    setName('')
    setGuildId('')
    setAuthStatus(false)
    setAuthStatusError('')
    navigate('/login')
  }

  const accountSelect = () => {
    setAllyCode('')
    setGuildId('')
    navigate('/accountSelect')
  }

  const displayModal = (content, positive, confirmAction = () => {}, showAltAction = true) => {
    setModalContent(content)
    setModalPositive(positive)
    setModalAction(() => () => confirmAction())
    setShowAltAction(showAltAction)
    setModalVisible(true)
  }

  const refreshData = async () => {
    setLoaderMessage('Refreshing data.')
    setLoaderVisible(true)
   
    let response = await refreshPlayerData(session, allyCode, displayMessage)

    if(response.success && allyCode === account.allyCode) {
      await getPlayerData(session, allyCode, displayMessage, setAccount)
    }

    setLoaderVisible(false)
    displayMessage('Data successfully refreshed.', true)
  }

  const getAuthStatusCallback = useCallback(async () => {
      if(session && allyCode) {
          getAuthStatus(session, allyCode, setAuthStatus, setAuthStatusError)
      } else {
          setAuthStatus(false)
          setAuthStatusError('')
      }
  }, [session, allyCode])

  useEffect(() => {
      getAuthStatusCallback()
  }, [getAuthStatusCallback])

  return (
    <div className="App">
      <div className='App-content'>
        <Navbar 
          session={session} 
          authStatus={authStatus} 
          authStatusError={authStatusError} 
          refreshData={refreshData} 
          name={name} 
          allyCode={allyCode} 
          guildId={guildId} 
          inGuild={inGuild} 
          accountSelect={accountSelect} 
          logout={logout} 
        />

      <Dimmer active={loaderVisible} page>
        <Loader>{loaderMessage}</Loader>
      </Dimmer>

      <Transition visible={messageVisible} animation='scale' duration={500}>
        <Message
          floating
          positive={messagePositive}
          negative={!messagePositive}
          hidden={!messageVisible}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1100,
            width: '340px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}
        >
          {messageContent}
        </Message>
      </Transition>

      <Modal
        onClose={() => setModalVisible(false)}
        onOpen={() => setModalVisible(true)}
        open={modalVisible}
        >
        <Modal.Header>Confirm Action</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <Item.Group>
              {modalContent}
            </Item.Group>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          {
            showAltAction
            ?
            <Button color='black' onClick={() => setModalVisible(false)}>
              Nope
            </Button>
            :
            ''
          }
          <Button
            content="Confirm"
            labelPosition='right'
            icon={modalPositive ? 'checkmark' : 'times'}
            onClick={async () => {
              modalAction()
              setModalVisible(false)
            }}
            positive={modalPositive}
            negative={!modalPositive}
          />
        </Modal.Actions>
      </Modal>

      <Routes>
        <Route exact path='/' element={< Home session={session} allyCode={allyCode} name={name} guildId={guildId} isAuthenticated={isAuthenticated} inGuild={inGuild}/>}/>
        <Route exact path='/login' element={< Login redirect={redirect} />}/>
        <Route exact path='/accountSelect' element={< AccountSelect redirect={redirect} session={session} navigate={navigate} setAllyCode={setAllyCode} setGuildId={setGuildId} setName={setName} displayMessage={displayMessage}/>}/>
        <Route exact path='/authenticate' element={< Authenticate setSession={setSession} />}/>
        <Route exact path='/guild/:guildId' element={< Guild loggedInGuildId={guildId} loggedInAllyCode={allyCode} redirect={redirect} session={session} displayMessage={displayMessage} displayModal={displayModal} name={name} units={units} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} datacrons={datacrons} affixTextMap={affixTextMap} guild={guild} setGuild={setGuild} authStatus={authStatus}/>}/>
        <Route exact path='/profile/:allyCode' element={< Profile loggedInAllyCode={allyCode} session={session} redirect={redirect} displayMessage={displayMessage} displayModal={displayModal} units={units} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} categories={categories} datacrons={datacrons} affixTextMap={affixTextMap} account={account} setAccount={setAccount} nicknames={nicknames} authStatus={authStatus}/>}/>
        <Route exact path='/privacy' element={< Privacy />}/>
        <Route exact path='/terms' element={< Terms />}/>
        <Route exact path='contact' element={< Contact displayMessage={displayMessage} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} />}/>
        <Route exact path='/infographics' element={<Infographics />}/>
        <Route exact path='/era-data' element={<EraData session={session} displayMessage={displayMessage} units={units} />}/>
        <Route exact path='/leaderboard' element={<Leaderboard displayMessage={displayMessage} />}/>
        <Route exact path='/settings' element={<Settings session={session} displayMessage={displayMessage} allyCode={allyCode} />}/>
        <Route exact path='/profile' element={<Navigate to='/login'/>}/>
        <Route exact path='/guild' element={<Navigate to='/login'/>}/>
      </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
