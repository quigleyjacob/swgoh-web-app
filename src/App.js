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

function App() {
  const navigate = useNavigate()

  const fxn = () => {}

  let [session, setSession] = useState('')
  let [allyCode, setAllyCode] = useState('')
  let [name, setName] = useState('')
  let [guildId, setGuildId] = useState('')

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
  let [skills, setSkills] = useState({})
  let [images, setImages] = useState({})
  let [categories, setCategories] = useState({})

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
        filter: {obtainableTime: "0", rarity: 7},
        projection: {baseId: 1, combatType: 1, forceAlignment: 1, nameKey: 1, categoryId: 1},
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

  const getSkills = useCallback(async () => {
    if(session) {
      let body = {
        session: session
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/skill`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let skills = await response.json()
        // eslint-disable-next-line
        setSkills(skills.reduce((map, obj) => (map[obj.id] = obj, map), {}))
      } else {
        displayMessage('Unable to retrieve skills data.', false)
      }
    }
  }, [displayMessage, session])

  const getImages = useCallback(async () => {
    if(session) {
      let body = {
        session: session
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/image`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      if(response.ok) {
        let images = await response.json()
        // eslint-disable-next-line
        setImages(images.reduce((map, obj) => (map[obj.baseId] = obj.image, map), {}))
      } else {
        displayMessage('Unable to retrieve images data.', false)
      }
    }
  }, [displayMessage, session])

  const getCategories = useCallback(async () => {
    if(session) {
      let body = {
        session: session
      }
      let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/category`, {
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

  useEffect(() => {
    (async () => {
      setSession(getCookieValue('session'))
      getUnits()
      getSkills()
      getImages()
      getCategories()
    })()
  }, [session, getUnits, getSkills, getImages, getCategories])

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
    setSession('')
    setAllyCode('')
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
    let playerResponse = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/refresh/player`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(playerBody)
    })
    if(!playerResponse.ok) {
      displayMessage('Unable to refresh player data.', false)
      setLoaderVisible(false)
      return
    }
    if(inGuild()) {
      let guildBody = {
        guildId: guildId,
        detailed: true,
        session: session
      }
      let guildResponse = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/refresh/guild`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(guildBody)
      })
      if(!guildResponse.ok) {
        displayMessage('Unable to refresh guild data.', false)
        setLoaderVisible(false)
        return
      }
    }
    setLoaderVisible(false)
    displayMessage('Data successfully refreshed.', true)
  }

  return (
    <div className="App">
      <Menu color='black' inverted={true}>
        <Menu.Item
          name='home'
          to='/'
          as={Link}
        />
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
            <Dropdown text={name} as={Menu.Item}>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to='/profile' state={{allyCode: allyCode}}>Profile</Dropdown.Item>
                <Dropdown.Item as={Link} to='/guild' disabled={!inGuild()} state={{guildId: guildId}}>Guild</Dropdown.Item>
                <Dropdown.Item onClick={accountSelect}>Change Account</Dropdown.Item>
                <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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
              await modalAction()
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
        <Route exact path='/guild' element={< Guild redirect={redirect} session={session} displayMessage={displayMessage} displayModal={displayModal} name={name}/>}></Route>
        <Route exact path='/profile' element={< Profile loggedInAllyCode={allyCode} session={session} redirect={redirect} displayMessage={displayMessage} units={units} skills={skills} images={images} setLoaderMessage={setLoaderMessage} setLoaderVisible={setLoaderVisible} categories={categories}/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
