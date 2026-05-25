import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Icon, Popup, Dropdown } from 'semantic-ui-react'

function Navbar({session, authStatus, authStatusError, refreshData, name, allyCode, guildId, inGuild, accountSelect, logout}) {

      const [visible, setVisible] = useState(false);

  const handleToggle = () => setVisible(!visible);

  const leftMenuItems = [
            <Menu.Item>
          <img className='circular right-padding' src='/favicon.ico' alt='QuigBot'/>
          </Menu.Item>,
          <Menu.Item
          name='home'
          to='/'
          as={Link}
        />
  ]

  const loggedOutRightMenuItems = [
        <Menu.Item
          name='login'
          to='/login'
          as={Link}
        />
        ]

  const loggedInRightMenuItems = [
                <Popup
              content={authStatus ? 'Authenticated connection active' : authStatusError || 'Authenticated connection not setup'}
              position='bottom right'
              inverted
              trigger={
                <Menu.Item
                  icon={authStatus ? 'check circle' : 'warning circle'}
                  name='authStatus'
                  title={authStatus ? 'Authenticated connection active' : authStatusError || 'Authenticated connection not setup'}
                  style={{ color: authStatus ? '#7fff00' : '#ffcc00' }}
                />
              }
            />,
            <Menu.Item
              icon='refresh'
              name='refresh'
              onClick={refreshData}
            />,
            <Menu.Item text={name} as={Dropdown}>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to={`/profile/${allyCode}`}>Profile</Dropdown.Item>
                <Dropdown.Item as={Link} to={`/guild/${guildId}`} disabled={!inGuild()}>Guild</Dropdown.Item>
                <Dropdown.Item onClick={accountSelect}>Change Account</Dropdown.Item>
                <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Menu.Item>
  ]

  const mobileMenuItems = [
                    <Popup
              content={authStatus ? 'Authenticated connection active' : authStatusError || 'Authenticated connection not setup'}
              position='bottom right'
              inverted
              trigger={
                <Menu.Item
                  icon={authStatus ? 'check circle' : 'warning circle'}
                  name='authStatus'
                  title={authStatus ? 'Authenticated connection active' : authStatusError || 'Authenticated connection not setup'}
                  style={{ color: authStatus ? '#7fff00' : '#ffcc00' }}
                />
              }
            />,
            <Menu.Item
              icon='refresh'
              name='refresh'
              onClick={refreshData}
            />,
                <Menu.Item as={Link} to={`/profile/${allyCode}`}>Profile</Menu.Item>,
                <Menu.Item as={Link} to={`/guild/${guildId}`} disabled={!inGuild()}>Guild</Menu.Item>,
                <Menu.Item onClick={accountSelect}>Change Account</Menu.Item>,
                <Menu.Item onClick={logout}>Logout</Menu.Item>
  ]

  const renderDesktopRightMenuItems = () => {
    if(session) {
      return loggedInRightMenuItems
    } else {
      return loggedOutRightMenuItems
    }
  }

  const stuff = () => {
    return <div>
        {name}&nbsp;&nbsp;
        <Icon name='circle' color={authStatus ? 'green' : 'yellow'} size='tiny' />
    </div>
  }

  const renderMobileRightMenuItems = () => {
    if(session) {
      return <Menu.Menu position='right' className='mobile-menu'>
            <Menu.Item as={Dropdown} text={stuff()} onClick={handleToggle}>
                <Dropdown.Menu>
                    {mobileMenuItems}
                </Dropdown.Menu>
        </Menu.Item>
      </Menu.Menu> 
    } else {
        return <Menu.Menu position='right' className='mobile-menu'>
            {loggedOutRightMenuItems}
        </Menu.Menu>
    }
  }

    return (
        <Menu inverted className='navbar'>
            {leftMenuItems}

        <Menu.Menu position='right' className='widescreen-menu'>
            {renderDesktopRightMenuItems()}
        </Menu.Menu>
                <Menu.Menu position='right' className='desktop-menu'>
            {renderDesktopRightMenuItems()}
        </Menu.Menu>
                <Menu.Menu position='right' className='tablet-menu'>
            {renderDesktopRightMenuItems()}
        </Menu.Menu>

        {renderMobileRightMenuItems()}

        </Menu>
    )
}

export default Navbar;