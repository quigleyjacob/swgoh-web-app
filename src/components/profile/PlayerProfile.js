import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, List } from 'semantic-ui-react';
import { timeSince } from '../../utils';
import './PlayerProfile.css'

function PlayerProfile ({account, redirect, session}){

	const getPortrait = useCallback(async () => {
		if(account !== undefined && Object.keys(account).length !== 0) {
			let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/portrait`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({session: session, id: account?.selectedPlayerPortrait?.id})
			})
			if(response.ok) {
				let portrait = await response.json()
				account.selectedPlayerPortrait.icon = portrait.icon
			}
		}
	}, [account, session])

	useEffect(() => {
		getPortrait()
		redirect('playerProfile')
	}, [getPortrait, redirect])

	const inGuild = () => {
		return account?.guildId !== ''
	}

	const getGACPowerScore = () => {
		if(account === undefined) {
			return 0
		}
		return (account?.playerRating?.playerSkillRating?.skillRating / (account.galacticPower / 100000)).toFixed(2)
	}

	return <div>
		

		{/* <Grid>
			<Grid.Column width={4}>
			<Grid.Row>
				<div className="container">
				<img
					className="imageOne"
					src={account === undefined ? '' : `https://game-assets.swgoh.gg/${account?.selectedPlayerPortrait?.icon}.png`}
					alt="Player Portrait"
				/>
				<img 
					className="imageTwo"
					src={account === undefined ? '' : `https://game-assets.swgoh.gg/tex.vanity_portrait_league_${account?.playerRating?.playerRankStatus?.leagueId.toLowerCase()}.png`}
					alt="GAC League Overlay"
				/>
				</div>
			</Grid.Row>
			<Grid.Row>
			<Header size='huge' textAlign='center'>{account?.name}</Header>
			<strong>Last Refreshed: </strong> {account?.lastRefreshed === undefined ? 'No record' : timeSince(account?.lastRefreshed)}
			</Grid.Row>
			</Grid.Column>
			<Grid.Column width={12}>

		</Grid.Column>
		</Grid> */}

<Header size='huge' textAlign='center'>{account?.name}</Header>

		<List horizontal>
		<List.Item>
				<List.Content>
					<List.Header>Galactic Power</List.Header>
					<List.Description>{account?.galacticPower?.toLocaleString("en-US")}</List.Description>
				</List.Content>
			</List.Item>
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
			<List.Item>
				<List.Content>
					<List.Header>Last Refreshed</List.Header>
					<List.Description>{account?.lastRefreshed === undefined ? 'No record' : timeSince(account?.lastRefreshed)}</List.Description>
				</List.Content>
			</List.Item>
			<List.Item>
				<List.Content>
					<List.Header>Last Active</List.Header>
					<List.Description>{account?.lastRefreshed === undefined ? 'No record' : timeSince(account?.lastActivityTime)}</List.Description>
				</List.Content>
			</List.Item>
			<List.Item>
				<List.Content>
					<List.Header>GAC Power Score</List.Header>
					<List.Description>{getGACPowerScore()}</List.Description>
				</List.Content>
			</List.Item>
		</List>
	</div>
}

export default PlayerProfile;
