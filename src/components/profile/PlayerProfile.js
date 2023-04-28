import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, List } from 'semantic-ui-react';

function PlayerProfile ({account, redirect}){

	useEffect(() => {
		redirect('playerProfile')
	})

	const inGuild = () => {
		return account?.guildId !== ''
	}

	return <div>
		<Header size='huge' textAlign='center'>{account?.name}</Header>

		<List horizontal>
			<List.Item>
				<List.Content>
					<List.Header>AllyCode</List.Header>
					<List.Description>{account?.allyCode}</List.Description>
				</List.Content>
			</List.Item>
			<List.Item>
				<List.Content>
					<List.Header as={Link} to='/guild' disabled={!inGuild()} state={{guildId: account?.guildId}}>Guild</List.Header>
					<List.Description>{account?.guildName}</List.Description>
				</List.Content>
			</List.Item>
			<List.Item>
				<List.Content>
					<List.Header>League</List.Header>
					<List.Description>{account?.playerRating?.playerRankStatus?.leagueId}</List.Description>
				</List.Content>
			</List.Item>
			<List.Item>
				<List.Content>
					<List.Header>Skill Rating</List.Header>
					<List.Description>{account?.playerRating?.playerSkillRating?.skillRating}</List.Description>
				</List.Content>
			</List.Item>
			<List.Item>
				<List.Content>
					<List.Header>Squad Arena Rank</List.Header>
					<List.Description>{account?.pvpProfile?.[0]?.rank}</List.Description>
				</List.Content>
			</List.Item>
			<List.Item>
				<List.Content>
					<List.Header>Fleet Arena Rank</List.Header>
					<List.Description>{account?.pvpProfile?.[1]?.rank}</List.Description>
				</List.Content>
			</List.Item>
		</List>
	</div>
}

export default PlayerProfile;
