import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from 'semantic-ui-react';
import { timeSince } from '../../utils';
import SortableTable from '../displays/SortableTable';

function GuildProfile ({redirect, guild}){

	const getColumns = () => {
		return [
			{text: "Name", key: 'playerName'},
			{text: "AllyCode", key: 'allyCode'},
			{text: "Galactic Power", key: 'galacticPower'},
			{text: "Guild Rank", key: 'memberLevel'},
			{text: "Latest Raid Score", key: 'raidScore'}
		]
	}

	const getCellRenders = () => {
		return {
			'galacticPower': ({galacticPower}) => {
				return (Number(galacticPower) || 0).toLocaleString("en-US")
			},
			'memberLevel': ({memberLevel}) => {
				return memberLevel === 4 ? 'Leader' : memberLevel === 3 ? 'Officer' : 'Member'
			},
			'raidScore': ({raidScore}) => {
				return (Number(raidScore) || 0).toLocaleString("en-US")
			},
			"playerName": ({playerName, allyCode}) => {
				return <Header size='tiny' as={Link} color='blue' to={`/profile/${allyCode}`}>{playerName}</Header>
			}
		}
	}

	return <div>
		<Header size='huge' textAlign='center'>
			{guild?.profile?.name}
			<Header.Subheader>
			{guild?.lastRefreshed ? timeSince(guild.lastRefreshed) : ''}
			</Header.Subheader>
		</Header>
		<Header size='small' textAlign='center' color='grey'>{guild?.profile?.externalMessageKey}</Header>

		<SortableTable fixed sortable meta={getColumns()} row={guild?.member} render={getCellRenders()} defaultSort={{column: 'galacticPower', direction: 'descending'}} />
	</div>
}

export default GuildProfile;