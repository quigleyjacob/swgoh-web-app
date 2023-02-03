import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, Item, Table } from 'semantic-ui-react';

function GuildProfile (props){

	useEffect(() => {
		props.redirect('guildprofile')
	})

	return <div>
		<Header size='huge' textAlign='center'>{props.guild?.profile?.name}</Header>
		<Header size='small' textAlign='center' color='grey'>{props.guild?.profile?.externalMessageKey}</Header>

		<Table striped celled fixed>
			<Table.Header>
				<Table.Row>
				<Table.HeaderCell>
					Name
				</Table.HeaderCell>
				<Table.HeaderCell>
					AllyCode
				</Table.HeaderCell>
				<Table.HeaderCell>
					Galactic Power
				</Table.HeaderCell>
				<Table.HeaderCell>
					Guild Status
				</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{props.guild?.member?.sort((a,b) => a.playerName.localeCompare(b.playerName)).map(({ playerName, galacticPower, memberLevel, allyCode }) => (
				<Table.Row key={playerName}>
					<Table.Cell><Item as={Link} to='/profile' state={{allyCode: allyCode}}>{playerName}</Item></Table.Cell>
					<Table.Cell>{allyCode}</Table.Cell>
					<Table.Cell>{galacticPower}</Table.Cell>
					<Table.Cell>{memberLevel === 2 ? 'Member' : memberLevel === 3 ? 'Officer' : 'Leader'}</Table.Cell>
				</Table.Row>
				))}
			</Table.Body>
		</Table>
	</div>
}

export default GuildProfile;