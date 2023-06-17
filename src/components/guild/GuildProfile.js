import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, Item, Table, Image } from 'semantic-ui-react';

function GuildProfile ({redirect, guild}){

	useEffect(() => {
		redirect('guildprofile')
	})

	return <div>
		<Image centered src={`https://swgoh.gg/static/img/assets/tex.${guild?.profile?.bannerLogoId}.png`}></Image>
		<Header size='huge' textAlign='center'>{guild?.profile?.name}</Header>
		<Header size='small' textAlign='center' color='grey'>{guild?.profile?.externalMessageKey}</Header>

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
				{guild?.member?.sort((a,b) => a.playerName.localeCompare(b.playerName)).map(({ playerName, galacticPower, memberLevel, allyCode }) => (
				<Table.Row key={playerName}>
					<Table.Cell><Item as={Link} to='/profile' state={{allyCode: allyCode}}>{playerName}</Item></Table.Cell>
					<Table.Cell>{allyCode}</Table.Cell>
					<Table.Cell>{Number(galacticPower).toLocaleString("en-US")}</Table.Cell>
					<Table.Cell>{memberLevel === 2 ? 'Member' : memberLevel === 3 ? 'Officer' : 'Leader'}</Table.Cell>
				</Table.Row>
				))}
			</Table.Body>
		</Table>
	</div>
}

export default GuildProfile;