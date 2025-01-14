import React, { useCallback, useEffect, useState } from 'react';
import { Header, List, Grid, Image } from 'semantic-ui-react';
import { getCharacterData, getShipData, timeSince } from '../../utils';
import './PlayerProfile.css'
import PortraitCard from '../cards/PortraitCard';
import CharacterList from './CharacterList';
import ShipList from './ShipList';

function PlayerProfile ({account, redirect, session, units}){

	const [portrait, setPortrait] = useState('')

	const getPortrait = useCallback(async () => {
		if(account !== undefined && Object.keys(account).length !== 0) {
			let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/portrait`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({session: session, id: account?.selectedPlayerPortrait?.id})
			})
			if(response.ok) {
				let portrait = await response.json()
				setPortrait(portrait.icon)
			}
		}
	}, [account, session])

	useEffect(() => {
		getPortrait()
		redirect('playerProfile')
	}, [redirect, account, getPortrait])

	const getGACPowerScore = () => {
		if(account === undefined) {
			return 0
		}
		return (account.gacPowerScore || 0).toLocaleString("en-US", {maximumFractionDigits: 2})
	}

	const getModScore = () => {
		if(account === undefined) {
			return 0
		}
		return (account.modScore || 0).toLocaleString("en-US", {maximumFractionDigits: 2})
	}

	const getLastActivity = () => {
		return account?.lastActivityTime === undefined ? 'No record' : timeSince(account?.lastActivityTime)
	}

	const getLastRefreshed = () => {
		return account?.lastRefreshed === undefined ? 'No record' : timeSince(Date.parse(account?.lastRefreshed))
	}

	const getGalacticPower = () => {
		return account?.galacticPower?.toLocaleString("en-US")
	}

	const getLeagueId = () => {
		return account?.playerRating?.playerRankStatus?.leagueId || ''
	}
	const getSkillRating = () => {
		return account?.playerRating?.playerSkillRating?.skillRating || ''
	}

	const getSquadArenaRank = () => {
		return `Rank ${account?.pvpProfile?.[0]?.rank || ''}`
	}

	const getSquad = () => {
		if(Object.keys(account).length === 0 || units.length === 0) {
			return
		}
		let leaderDefId = account?.pvpProfile?.[0]?.squad?.cell?.[0]?.unitDefId

		let remainingSquad = account?.pvpProfile?.[0]?.squad?.cell?.filter((_, index) => index !== 0).map(unit => unit.unitDefId)

		let leader = account.rosterUnit.find(unit => unit.definitionId === leaderDefId)
		let squad = account.rosterUnit.filter(unit => remainingSquad.includes(unit.definitionId))

		getCharacterData([...squad, leader], units)
		return (
			<div>
				<CharacterList unitData={[leader]} size='normal' filter={false} />
				<CharacterList unitData={squad} size='small' filter={false} simple />
			</div>
		)
	}

	const getFleetArenaRank = () => {
		return `Rank ${account?.pvpProfile?.[1]?.rank || ''}`
	}

	const getFleet = () => {
		if(Object.keys(account).length === 0 || units.length === 0) {
			return
		}

		let fleetDefIdList = account?.pvpProfile?.[1]?.squad?.cell.map(unit => unit.unitDefId)
		let fleetUnits = account.rosterUnit.filter(unit => fleetDefIdList.includes(unit.definitionId))
		getShipData(fleetUnits, units)

		let leader = fleetUnits.filter(unit => unit.definitionId === fleetDefIdList[0])[0]
		let starters = fleetDefIdList.slice(1,4).map(unitDefId => fleetUnits.find(unit => unit.definitionId === unitDefId))
		let reinforce = fleetDefIdList.slice(4).map(unitDefId => fleetUnits.find(unit => unit.definitionId === unitDefId))
		
		return (
			<div>
				<ShipList unitData={[leader]} filter={false} size='normal'/>
				<ShipList unitData={starters} filter={false} simple size='small'/>
				<ShipList unitData={reinforce} filter={false} simple size='small'/>
			</div>
		)
	}

	return <div>

		<Grid centered celled>
			<Grid.Row className="gradient">
				<Grid.Column computer={4} mobile={16}>
					<Grid padded centered>
						<Grid.Row>
							<PortraitCard icon={portrait} />
						</Grid.Row>
						<Grid.Row>
						<Header size='huge' textAlign='center'>{`${account?.name} (${account?.allyCode})`}</Header>
						</Grid.Row>
						<Grid.Row>
							<Header size='medium'>{`Galactic Power: ${getGalacticPower()}`}</Header>
						</Grid.Row>
						<Grid.Row>
							<Header size='medium'>{`Mod Score: ${getModScore()}`}</Header>
						</Grid.Row>
						<Grid.Row>
							<Header size='medium'>{`Quig Power Score: ${getGACPowerScore()}`}</Header>
						</Grid.Row>
						<Grid.Row>
							<Header size='medium'>{`Last Refreshed: ${getLastRefreshed()}`}</Header>
						</Grid.Row>
						<Grid.Row>
							<Header size='medium'>{`Last Active: ${getLastActivity()}`}</Header>
						</Grid.Row>
					</Grid>
					
					
				</Grid.Column>
				<Grid.Column computer={12} mobile={16}>

				<Grid centered>
					<Grid.Row>
						<Grid.Column computer={5} mobile={16}>
							<Grid centered>
								<Grid.Row>
								<Header size='huge'>Grand Arena Championships</Header>
								</Grid.Row>
								<Grid.Row>
									<Header size='huge'>Skill Rating</Header>
								</Grid.Row>
								<Grid.Row>
									<Header size='large'>{getSkillRating()}</Header>
								</Grid.Row>
								<Grid.Row>
								<Image centered size='small' src={`tex.league_icon_${getLeagueId().toLowerCase()}.png`}/>
								</Grid.Row>
							</Grid>
						
						</Grid.Column>
						<Grid.Column computer={5} mobile={16}>
							
							<Grid centered>
								<Grid.Row>
									<Header size='huge'>Squad Arena</Header>
								</Grid.Row>
								<Grid.Row>
									<Header size='huge'>{getSquadArenaRank()}</Header>
								</Grid.Row>
								<Grid.Row>
									{getSquad()}
								</Grid.Row>
							</Grid>
							
						</Grid.Column>
						<Grid.Column computer={5} mobile={16}>

							<Grid centered>
								<Grid.Row>
								<Header size='huge'>Fleet Arena</Header>
								</Grid.Row>
								<Grid.Row>
									<Header size='huge'>{getFleetArenaRank()}</Header>
								</Grid.Row>
								<Grid.Row>
									{getFleet()}
								</Grid.Row>

							</Grid>
							
						</Grid.Column>
					</Grid.Row>
				</Grid>

				</Grid.Column>
			</Grid.Row>
			<Grid.Row columns={1}>
				<Grid.Column textAlign='left'>
				<List bulleted>
					<List.Item>
						Mod Score is calculated as follows: [(# Speed 25+) * 1.6 + (# Speed 20 - 24) + (# Speed 15 - 19) * 0.8 ] / (squadGP / 100,000)
					</List.Item>
					<List.Item>
						Quig Score is calculated as follows: (Skill Rating / (Galactic Power / 100,000)) * (League Multiplier)
						<List.List>
							<List.Item>
								Where League Multiplier is as follows: Kyber 1 = 1.00, Kyber 2 = 0.96, Kyber 3 = 0.92, ... , Carbonite 1 = 0.04
							</List.Item>
						</List.List>
					</List.Item>
				</List>
				</Grid.Column>

			</Grid.Row>
		</Grid>
	</div>
}

export default PlayerProfile;
