// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Dropdown, Menu } from 'semantic-ui-react'
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

  let [session, setSession] = useState('')
  let [activeAccount, setActiveAccount] = useState({})
  let [activeGuild, setActiveGuild] = useState({})

  useEffect(() => {
    setSession(getCookieValue('session'))
  }, [])

  const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
  )

  const isAuthenticated = () => {
    return getCookieValue('session') !== ''
  }

  const objectIsEmpty = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object
  }

  const redirect = (from) => {
    console.log(from)
    if(!isAuthenticated()) {
      if(from !== 'login') {
        navigate('/login')
      }
    }
    else if(objectIsEmpty(activeAccount)) {
      if(from !== 'accountSelect') {
        navigate('/accountSelect')
      }
    }
  }

  const isOfficer = () => {
    if(!activeGuild) {
      return false
    }
    let filteredGuild = activeGuild.member.filter(member => member.playerName === activeAccount.name)
    if(filteredGuild.length === 0) {
      return false
    } else {
      return filteredGuild[0].memberLevel > 2
    }
  }

  const logout = () => {
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setSession('')
    setActiveAccount({})
    setActiveGuild({})
    navigate('/login')
  }

  return (
    <div className="App">
      <Menu color='black' inverted={true}>
          <Menu.Item
            name='home'
            to='/'
            as={Link}
          />
          <Menu.Menu position='right'>
            {
              objectIsEmpty(activeAccount)
              ?
              <Menu.Item
                name='login'
                to='/login'
                as={Link}
              />
              :
              <Dropdown text={activeAccount.name} as={Menu.Item}>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to='/profile'>Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to='/guild'>Guild</Dropdown.Item>
                  <Dropdown.Item as={Link} to='/accountSelect'>Change Account</Dropdown.Item>
                  <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            }

          </Menu.Menu>

        </Menu>
      <Routes>
        <Route exact path='/' element={< Home redirect={redirect}/>}></Route>
        <Route exact path='/login' element={< Login redirect={redirect} />}></Route>
        <Route exact path='/accountSelect' element={< AccountSelect redirect={redirect} session={session} setActiveAccount={setActiveAccount} setActiveGuild={setActiveGuild} navigate={navigate} />}></Route>
        <Route exact path='/authenticate' element={< Authenticate setSession={setSession} />}></Route>
        <Route exact path='/guild' element={< Guild redirect={redirect} guild={activeGuild} session={session} player={activeAccount} isOfficer={isOfficer}/>}></Route>
        <Route exact path='/profile' element={< Profile redirect={redirect} player={activeAccount} />}></Route>
      </Routes>
    </div>
  );
}

export default App;
