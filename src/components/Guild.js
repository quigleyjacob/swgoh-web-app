import React, { useEffect, useState } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
import GuildProfile from './guild/GuildProfile';
import TBCommands from './guild/TBCommands';

function Guild (props){

  const [activeItem, setActiveItem] = useState('overview')

	useEffect(() => {
		props.redirect('guild')
	})

  const handleItemClick = (e, obj) => {
      setActiveItem(obj.name)
  }

  const getActiveItem = () => {
      switch(activeItem) {
          case 'overview':
              return <GuildProfile redirect={props.redirect} guild={props.guild}/>
          case 'TB Commands':
              return <TBCommands redirect={props.redirect} guildId={props.guild.id} session={props.session} allyCode={props.player.allyCode} isOfficer={props.isOfficer} displayMessage={props.displayMessage} displayModal={props.displayModal}/>
          default:
            return <Header>Unknown</Header>
      }
  }

	return <div>
    <Header size='huge' textAlign='center'>Guild</Header>
      
    <Grid>
      <Grid.Column width={4}>
        <Menu fluid vertical tabular>
          <Menu.Item
            name='overview'
            active={activeItem === 'overview'}
            onClick={handleItemClick}
          />
          <Menu.Item
            name='TB Commands'
            active={activeItem === 'TB Commands'}
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

export default Guild
