// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Dropdown, Menu, Message, Transition, Modal, Button, Dimmer, Loader } from 'semantic-ui-react'
import './App.css'
import 'semantic-ui-css/semantic.min.css'
import Home from './components/Home.js'
import Login from './components/Login.js'
import Authenticate from './components/Authenticate.js'
import AccountSelect from './components/AccountSelect.js'
import Guild from './components/Guild.js'
import Profile from './components/Profile.js'
import Privacy from './components/Privacy'
import Terms from './components/Terms'
import Footer from './components/Footer'
import Contact from './components/Contact'
import Infographics from './components/Infographics'
import { refreshPlayerData, getPlayerData, getPlayerNameAndGuildId } from './server/player.js'
import { getNicknames, getPlayableUnits, getVisibleCategories } from './server/data.js'
import { getActiveDatacrons } from './server/datacrons.js'
import { expireCookie, getCookieValue } from './utils/cookie.js'

function App() {
  const navigate = useNavigate()

  const fxn = () => {}

  let [session, setSession] = useState('')
  let [allyCode, setAllyCode] = useState('')
  let [name, setName] = useState('')
  let [guildId, setGuildId] = useState('')
  const [account, setAccount] = useState({})

  // message State
  let [messageVisible, setMessageVisible] = useState(false)
  let [messagePositive, setMessagePositive] = useState(false)
  let [messageContent, setMessageContent] = useState('')

  // modal state
  let [modalVisible, setModalVisible] = useState(false)
  let [modalContent, setModalContent] = useState('')
  let [modalAction, setModalAction] = useState(() => () => fxn())
  let [modalPositive, setModalPositive] = useState(false)

  // loader state
  let [loaderVisible, setLoaderVisible] = useState(false)
  let [loaderMessage, setLoaderMessage] = useState('')

  // units state
  let [units, setUnits] = useState([])
  let [categories, setCategories] = useState({})
  let [datacrons, setDatacrons] = useState([])
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
    if(session) {
      getPlayableUnits(session, displayMessage, setUnits)
    }
  }, [displayMessage, session])

  const getCategories = useCallback(async () => {
    if(session) {
      getVisibleCategories(session, displayMessage, setCategories)
    }
  }, [displayMessage, session])

  const getDatacrons = useCallback(async () => {
    if(session) {
      getActiveDatacrons(session, displayMessage, setDatacrons)
    }
  }, [displayMessage, session])

  const getNicknamesCallback = useCallback(async () => {
    if(session) {
      getNicknames(session, displayMessage, setNicknames)
    }
  }, [displayMessage, session])

  const getPlayerDataCallback = useCallback(async () => {
    if(session && allyCode) {
      getPlayerNameAndGuildId(session, allyCode, displayMessage, setName, setGuildId)
    }
  }, [displayMessage, session, allyCode])

  useEffect(() => {
    (async () => {
      setSession(getCookieValue('session'))
      setAllyCode(getCookieValue('allyCode'))
      getUnits()
      getCategories()
      getDatacrons()
      getPlayerDataCallback()
      getNicknamesCallback()
    })()
  }, [session, getUnits, getCategories, getDatacrons, getPlayerDataCallback, getNicknamesCallback])

  const isAuthenticated = useCallback(() => {
    return getCookieValue('session') !== ''
  }, [])

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
    navigate('/login')
  }

  const accountSelect = () => {
    setAllyCode('')
    setGuildId('')
    navigate('/accountSelect')
  }

  const displayModal = (content, positive, confirmAction) => {
    setModalContent(content)
    setModalPositive(positive)
    setModalAction(() => () => confirmAction())
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

  return (
    <div className="App">
      <div className='App-content'>
      <Menu color='black' inverted>
        <Menu.Item>
        <img className='circular right-padding' src='favicon.ico' alt='QuigBot'/>
        </Menu.Item>
        <Menu.Item>
          QuigBot
        </Menu.Item>
        <Menu.Item
          name='home'
          to='/'
          as={Link}
        >
          </Menu.Item>
          {
            allyCode === ''
            ?
            <Menu.Menu position='right'>
            <Menu.Item
              name='login'
              to='/login'
              as={Link}
            />
            </Menu.Menu>
            :
            <Menu.Menu position='right'>
            <Menu.Item
              icon='refresh'
              name='refresh'
              onClick={refreshData}
            />
            <Menu.Item text={name} as={Dropdown}>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to='/profile' state={{allyCode: allyCode}}>Profile</Dropdown.Item>
                <Dropdown.Item as={Link} to='/guild' disabled={!inGuild()} state={{guildId: guildId}}>Guild</Dropdown.Item>
                <Dropdown.Item onClick={accountSelect}>Change Account</Dropdown.Item>
                <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Menu.Item>
            </Menu.Menu>
          }
      </Menu>

      <Dimmer active={loaderVisible}>
        <Loader>{loaderMessage}</Loader>
      </Dimmer>

      <Transition visible={messageVisible} animation='scale' duration={500}>
        <Message floating positive={messagePositive} negative={!messagePositive} hidden={!messageVisible}>{messageContent}</Message>
      </Transition>

      <Modal
        onClose={() => setModalVisible(false)}
        onOpen={() => setModalVisible(true)}
        open={modalVisible}
        >
        <Modal.Header>Confirm Action</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <p>Are you sure you want to perform this action?</p>
            <p>{modalContent}</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={() => setModalVisible(false)}>
            Nope
          </Button>
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
        <Route exact path='/' element={< Home redirect={redirect} allyCode={allyCode} name={name} guildId={guildId} inGuild={inGuild}/>}></Route>
        <Route exact path='/login' element={< Login redirect={redirect} />}></Route>
        <Route exact path='/accountSelect' element={< AccountSelect redirect={redirect} session={session} navigate={navigate} setAllyCode={setAllyCode} setGuildId={setGuildId} setName={setName} displayMessage={displayMessage}/>}></Route>
        <Route exact path='/authenticate' element={< Authenticate setSession={setSession} />}></Route>
        <Route exact path='/guild' element={< Guild redirect={redirect} session={session} displayMessage={displayMessage} displayModal={displayModal} name={name} units={units} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} datacrons={datacrons}/>}></Route>
        <Route exact path='/profile' element={< Profile loggedInAllyCode={allyCode} session={session} redirect={redirect} displayMessage={displayMessage} displayModal={displayModal} units={units} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} categories={categories} datacrons={datacrons} account={account} setAccount={setAccount} nicknames={nicknames}/>}></Route>
        <Route exact path='/privacy' element={< Privacy />}></Route>
        <Route exact path='/terms' element={< Terms />}></Route>
        <Route exact path='contact' element={< Contact displayMessage={displayMessage} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} />}></Route>
        <Route exact path='/infographics' element={<Infographics />}></Route>
      </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
