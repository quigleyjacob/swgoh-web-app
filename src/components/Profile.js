import React, { useEffect, useState } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';

function Profile (props){

    const [activeItem, setActiveItem] = useState('overview')

	useEffect(() => {
		props.redirect('profile')
	})

    const handleItemClick = (e, obj) => {
        setActiveItem(obj.name)
    }

    const getActiveItem = () => {
        switch(activeItem) {
            case 'overview':
                return <Header>Overview</Header>
            case 'characters':
                return <Header>Characters</Header>
            case 'ships':
                return <Header>Ships</Header>
        }
    }

	return <div>
		<Header size='huge' textAlign='center'>Profile</Header>

        <Grid>
        <Grid.Column width={4}>
          <Menu fluid vertical tabular>
            <Menu.Item
              name='overview'
              active={activeItem === 'overview'}
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
          </Menu>
        </Grid.Column>

        <Grid.Column stretched width={12}>
          <Segment>
            {getActiveItem()}
          </Segment>
        </Grid.Column>
      </Grid>
	</div>
}

export default Profile;