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
      let body = {
        filter: {obtainable: true, obtainableTime: "0", rarity: 7},
        projection: {baseId: 1, combatType: 1, forceAlignment: 1, nameKey: 1, categoryId: 1, thumbnailName: 1},
        session: session
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/unit/playable`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let units = await response.json()
        setUnits(units)
      } else {
        displayMessage('Unable to retrieve units data.', false)
      }
    }
  }, [displayMessage, session])

  const getCategories = useCallback(async () => {
    if(session) {
      let body = {
        session: session
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/category/visible`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let categories = await response.json()
        setCategories(categories)
      } else {
        displayMessage('Unable to retrieve categories data.', false)
      }
    }
  }, [displayMessage, session])

  const getDatacrons = useCallback(async () => {
    if(session) {
      let body = {
        session: session
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/datacron/active`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let datacrons = await response.json()
        setDatacrons(datacrons)
      } else {
        displayMessage('Unable to retrieve datacrons data.', false)
      }
    }
  }, [displayMessage, session])

  const getAccount = useCallback(async () => {
    if(session && allyCode) {
      let body = {
        session: session,
        payload: {
          allyCode: allyCode
        },
        projection: {
          guildId: 1,
          name: 1,
        }
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let player = await response.json()
        setName(player.name)
        setGuildId(player.guildId)
      } else {
        displayMessage('Unable to retrieve datacrons data.', false)
      }
    }
  }, [displayMessage, session, allyCode])

  useEffect(() => {
    (async () => {
      setSession(getCookieValue('session'))
      setAllyCode(getCookieValue('allyCode'))
      getUnits()
      getCategories()
      getDatacrons()
      getAccount()
    })()
  }, [session, getUnits, getCategories, getDatacrons, getAccount])

  const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
  )

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
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "allyCode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
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
    let playerBody = {
      payload: {
        allyCode: allyCode
      },
      session: session
    }
    let refreshPlayerResponse = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/refresh/player`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(playerBody)
    })
    if(refreshPlayerResponse.ok) {
      if(allyCode === account.allyCode) {
        let account = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({payload: {allyCode: allyCode}})
        })
        if(account.ok) {
          setAccount(await account.json())
        }
      }
    } else {
      displayMessage('Unable to refresh player data.', false)
      setLoaderVisible(false)
      return
    }
    // if(inGuild()) {
    //   let guildBody = {
    //     guildId: guildId,
    //     detailed: true,
    //     session: session
    //   }
    //   let guildResponse = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/refresh/guild`, {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify(guildBody)
    //   })
    //   if(!guildResponse.ok) {
    //     displayMessage('Unable to refresh guild data.', false)
    //     setLoaderVisible(false)
    //     return
    //   }
    // }
    setLoaderVisible(false)
    displayMessage('Data successfully refreshed.', true)
  }

  return (
    <div className="App">
      <div className='App-content'>
      <Menu color='black' inverted={true}>
        <Menu.Item>
        <img className='circular' src='favicon.ico' alt='QuigBot'/>
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
        <Route exact path='/profile' element={< Profile loggedInAllyCode={allyCode} session={session} redirect={redirect} displayMessage={displayMessage} displayModal={displayModal} units={units} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} categories={categories} datacrons={datacrons} account={account} setAccount={setAccount}/>}></Route>
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
