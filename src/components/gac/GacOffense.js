import React, { useState } from 'react';
import { Button, Form, Grid, Header, Icon, Input, Menu, Message, Modal, Segment, TextArea } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from '../profile/CharacterList';
import ShipList from '../profile/ShipList';
import './Gac.css'
import Datacron from '../profile/Datacron';
import { getBonus } from '../../utils/datacrons';

function GacOffense ({account, opponent, active, setActive, categories, units, activeGac, setActiveGac, getCurrentSquadDatacron, getDatacronsMenu, datacrons, nicknames, addToSquad, removeFromSquad, isFleet, getOwner, getSquadId, getSquadData, getRemainingCharacters, getPresetSquadMenu}){

	const [modalOpen, setModalOpen] = useState(false)
	const [win, setWin] = useState(true)
	const [banner, setBanner] = useState('')
	const [comment, setComment] = useState('')
	const [killList, setKillList] = useState([])
	const [logModalOpen, setLogModalOpen] = useState(false)
	const [activeMenu, setActiveMenu] = useState('Custom Squad')

	const handleBannerChange = (e, obj) => {
		setBanner(obj.value)
	}

	const handleCommentChange = (e, obj) => {
		setComment(obj.value)
	}

	const getCustomSquadMenu = () => {
		if(isFleet()) {
			return <ShipList size='small' unitData={getShipData(getRemainingCharacters('homeStatus'), units)} onClick={addToSquad} categories={categories} defaultSort='power' nicknames={nicknames}/>
		} else {
			return <CharacterList size='small' unitData={getCharacterData(getRemainingCharacters('homeStatus'), units)} onClick={addToSquad} categories={categories} defaultSort='power' nicknames={nicknames}/>
		}
	}

	const displayAttackTeam = () => {
		if(active) {
			if(isFleet()) {
                return <ShipList size='small' unitData={getShipData(getAttackTeamData(), units)} onClick={removeFromSquad} categories={categories} filter={false} center={true}/>
            } else {
                return <CharacterList size='small' unitData={getCharacterData(getAttackTeamData(), units)} onClick={removeFromSquad} categories={categories} filter={false} center={true} displayDatacron={() => getCurrentSquadDatacron('planStatus')}/>
            }
		}
	}

	const getAttackTeamData = () => {
		if(active) {
			let squadId = getSquadId()
			let squadData = getSquadData('planStatus', squadId)
			if(squadData === undefined) {
                return []
            }
			// eslint-disable-next-line
			let unitsMap = account.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
			return squadData.squad.map(unit => unitsMap[unit.baseId])
		}
	}

	const displayDefenseTeam = () => {
        if(active) {
            if(isFleet()) {
                return <ShipList size='small' unitData={getShipData(getDefenseTeamData(), units)} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList size='small' unitData={getCharacterData(getDefenseTeamData(), units)} filter={false} center={true} categories={categories} displayDatacron={getCurrentSquadDatacron}/>
            }
        }
    }

	const getDefenseTeamData = (squadData = getSquadData()) => {
		if(active) {
			if(squadData === undefined) {
                return []
            }
			// eslint-disable-next-line
			let unitsMap = opponent.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
			return squadData.squad.map(unit => {
				return {...unitsMap[unit.baseId], ...unit}
			})
		}
	}

	// display squad within battle log
	const getLogTeam = (user, squadData) => {
		// eslint-disable-next-line
		let unitsMap = user.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
		return squadData.squad.map(unit => {
			return {...unitsMap[unit.baseId], ...unit}
		})
	}


	const displayDefenseTeamInBattleReportModal = () => {
		let squadData = {squad: JSON.parse(JSON.stringify(killList))}
		if(active) {
            if(isFleet()) {
                return <ShipList unitData={getShipData(getDefenseTeamData(squadData), units)} onClick={toggleKillStatus} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList unitData={getCharacterData(getDefenseTeamData(squadData), units)} onClick={toggleKillStatus} filter={false} center={true} categories={categories} displayDatacron={getCurrentSquadDatacron}/>
            }
        }
	}

	const toggleKillStatus = (baseId) => {
		let squadId = getSquadId()
		let index = activeGac.awayStatus[squadId].squad.findIndex(unit => unit.baseId === baseId)
		let unit = activeGac.awayStatus[squadId].squad.find(unit => unit.baseId === baseId)
		if(!unit.isAlive) { // if already dead from previous attack, don't flip back
			return
		}
		let newKillList = JSON.parse(JSON.stringify(killList))
		newKillList[index].isAlive = !newKillList[index].isAlive
		if(newKillList.every(val => !val.isAlive)) {
			setWin(true)
		} else {
		}
		setKillList(newKillList)
		

	}

	const attack = () => {
		if(active) {
			let currentKillList = JSON.parse(JSON.stringify(getSquadData().squad))
			setKillList(currentKillList)
			setWin(false)
			setBanner('')
			setComment('')
			setModalOpen(true)
		}	
	}

	const toggleWin = () => {
		let newWinStatus = !win
		if(newWinStatus) {
			let newKillList = JSON.parse(JSON.stringify(killList))
			newKillList.forEach(unit => {
				unit.isAlive = false
			})
			setKillList(newKillList)
		} else {
			let currentKillList = JSON.parse(JSON.stringify(getSquadData().squad))
			setKillList(currentKillList)
		}
		setWin(newWinStatus)
	}

	const reportAttack = async () => {
		let squadId = getSquadId()
		let squadData = getSquadData()
		let defenseTeam = {squad: JSON.parse(JSON.stringify(killList)), datacron: squadData.datacron}
		let attackTeam = JSON.parse(JSON.stringify(getSquadData('planStatus', squadId)))
		let attackLog = {
			attackTeam,
			defenseTeam,
			result: win,
			banner: win ? banner : 0,
			comment: comment,
			isToon: !isFleet(),
			squadId: getSquadId()
		}
		let newActiveGac = JSON.parse(JSON.stringify(activeGac))

		newActiveGac.battleLog = [...activeGac.battleLog, attackLog]
		delete newActiveGac.planStatus[squadId]
		newActiveGac.awayStatus[squadId].squad = JSON.parse(JSON.stringify(killList))

		setActiveGac(newActiveGac)
		setModalOpen(false)
		setActive('')
	}

	const openBattleLog = () => {
		setLogModalOpen(true)
	}

	const displayBattleLog = () => {
		return activeGac.battleLog.map((log, index) => {
			const isLast = activeGac.battleLog.length - 1 === index
			return (
				<Message positive={log.result} negative={!log.result} key={index}>
					<Grid>
						<Grid.Row>
							<Grid.Column floated='left'>
							<Header floated='left' size='huge' textAlign='center'>{log.result ? 'Victory' : 'Defeat'}</Header>
							</Grid.Column>
							<Grid.Column>
							{
							isLast && log.squadId
							?
							<Icon link name='delete' onClick={removeBattleLogItem}></Icon>
							:
							""
							}
							</Grid.Column>
						</Grid.Row>
						<Grid.Row centered>
						{
						log.isToon
						?
						<CharacterList unitData={getCharacterData(getLogTeam(account, log.attackTeam), units)} filter={false} center={true} categories={categories} displayDatacron={() => <Datacron datacron={log.attackDatacron} datacrons={datacrons} modal/>}/>
						:
						<ShipList unitData={getShipData(getLogTeam(account, log.attackTeam), units)} filter={false} center={true} categories={categories}/>
						}
						</Grid.Row>
						<Grid.Row centered>
						<Header textAlign='center' size='huge'>vs.</Header>
						</Grid.Row>
						<Grid.Row centered>
						{
						log.isToon
						?
						<CharacterList killList={log.killList} unitData={getCharacterData(getLogTeam(opponent, log.defenseTeam), units)} filter={false} center={true} categories={categories} displayDatacron={() => <Datacron datacron={log.defenseDatacron} datacrons={datacrons} modal/>}/>
						:
						<ShipList killList={log.killList} unitData={getShipData(getLogTeam(opponent, log.defenseTeam), units)} filter={false} center={true} categories={categories}/>
						}
						</Grid.Row>
						<Grid.Row>
						{log.result ? `For ${log.banner} banners.` : ''}
						</Grid.Row>
						<Grid.Row>
						{log.comment}
						</Grid.Row>
					</Grid>
				</Message>
			)
		})
	}

	const findCounter = async () => {
		if(active) {
			let owner = getOwner()
			let squadId = getSquadId()
			let squadData = getSquadData(owner, squadId)

			let route = isFleet() ? 'ship-counters' : 'counters'
			let url = `https://swgoh.gg/gac/${route}`
			let leader = '', member ='', reinforcement = ''
			squadData.squad.forEach(({baseId}, index) => {
				if(index === 0) {
					leader += baseId
				} else if(isFleet() && index > 3) {
					reinforcement += `${baseId}%2C`
				} else {
					member += `${baseId}%2C`
				}
			})
			window.open(`${url}/${leader}?d_member=${member}&d_reinforcement=${reinforcement}`, '_blank')
		}
	}

	const findInsightCounter = () => {
		let enemySquadData = getSquadData()
		let enemySquad = enemySquadData?.squad || []
		let enemyDatacronId = enemySquadData === undefined ? undefined : enemySquadData.datacron
		let enemyDatacron = opponent.datacron.find(datacron => datacron.id === enemyDatacronId)
		let enemySquadBaseIdList = enemySquad.map(unit => unit.baseId)

		let allySquadData = getSquadData('planStatus')
		let allySquad = allySquadData?.squad || []
		let allyDatacronId = allySquadData === undefined  ? undefined : allySquadData.datacron
		let allyDatacron = account.datacron.find(datacron => datacron.id === allyDatacronId)
		let allySquadBaseIdList = allySquad.map(unit => unit.baseId)

		let url = 'https://swgoh.gg/gac/insight/battles'
		let base = {key: 'g', value: 1}
		let combatType = isFleet() ? {key: 'combat_type', value: 2} : undefined
		let league = {key: 'league', value: activeGac.league}
		let squadSize = isFleet() ? undefined : {key: 'squad_size', value: activeGac.mode}
		let showCleanups = {key: 'show_cleanups', value: false}
		let isEnemyLeaderDead = enemySquad.length > 0 && !enemySquad[0].isAlive ? {key: 'd_is_lead', value: true} : undefined

		let enemyLeader = getLeader(enemySquad, 'd')
		let enemySquadMembers = getSquadMembers(enemySquad, 'd')
		let enemyReinforcements = getReinforcements(enemySquad, 'd')
		let enemyDatacronQuery = getDatacron(enemyDatacron, 'd', enemySquadBaseIdList)

		let allyLeader = getLeader(allySquad, 'a')
		let allySquadMembers = getSquadMembers(allySquad, 'a')
		let allyReinforcements = getReinforcements(allySquad, 'a')
		let allyDatacronQuery = getDatacron(allyDatacron, 'a', allySquadBaseIdList)

		let query = '?' + [
				base,
				combatType,
				league,
				squadSize, 
				showCleanups,
				isEnemyLeaderDead, 
				enemyLeader,
				enemySquadMembers,
				enemyReinforcements,
				enemyDatacronQuery,
				allyLeader,
				allySquadMembers,
				allyReinforcements,
				allyDatacronQuery,
			]
			.filter(query => query !== undefined)
			.map(({key, value}) => `${key}=${encodeURIComponent(value)}`)
			.join('&')
		window.open(`${url}/${query}`, '_blank')

	}

	const getLeader = (squad, side) => {
		return squad.length > 0 ? {key: `${side}_lead`, value: squad[0].baseId} : undefined
	}

	const getSquadMembers = (squad, side) => {
		let value
		if(isFleet()) {
			value = squad.slice(1,4).filter(unit => unit.isAlive === undefined ? true : unit.isAlive).map(unit => unit.baseId).join(',')
		} else {
			value = squad.slice(1).filter(unit => unit.isAlive === undefined ? true : unit.isAlive).map(unit => unit.baseId).join(',')
		}
		if(value) {
			return {key: `${side}_member`, value}
		}
	}

	const getReinforcements = (squad, side) => {
		let value = isFleet() ? squad.slice(4).filter(unit => unit.isAlive).map(unit => unit.baseId).join(',') : ''
		if(value) {
			return {key: `${side}_reinforcement`, value}
		}
	}

	const getDatacron = (datacron, side, squadBaseIdList = []) => {
		if(isFleet()) {
			return undefined
		}
		if(datacron === undefined) {
			return undefined
		}
		let alignment, faction, character
		if(datacron.affix.length > 2) {
			let affix = datacron.affix[2]
			let bonus = getBonus(datacrons, affix.targetRule, affix.abilityId)
			let categoryId = bonus.categoryId
			let charactersInSquadWithCategory = units.some(unit => squadBaseIdList.includes(unit.baseId) && unit.categoryId.includes(categoryId))
			if(charactersInSquadWithCategory) {
				alignment = `${datacron.affix[2].targetRule}:${datacron.affix[2].abilityId}`
			}
		}
		if(datacron.affix.length > 5) {
			let affix = datacron.affix[5]
			let bonus = getBonus(datacrons, affix.targetRule, affix.abilityId)
			let categoryId = bonus.categoryId
			let charactersInSquadWithCategory = units.some(unit => squadBaseIdList.includes(unit.baseId) && unit.categoryId.includes(categoryId))
			if(charactersInSquadWithCategory) {
				faction = `${datacron.affix[5].targetRule}:${datacron.affix[5].abilityId}`
			}
		}
		if(datacron.affix.length > 8) {
			let affix = datacron.affix[8]
			let bonus = getBonus(datacrons, affix.targetRule, affix.abilityId)
			let categoryId = bonus.categoryId
			let charactersInSquadWithName = units.some(unit => squadBaseIdList.includes(unit.baseId) && unit.categoryId.includes(categoryId))
			if(charactersInSquadWithName) {
				character = `${datacron.affix[8].targetRule}:${datacron.affix[8].abilityId}`
			}
		}
		let value = [alignment, faction, character].filter(str => str !== undefined).join(',')
		if(value) {
			return {key: `${side}_datacron_pkeys`, value}
		}
	}

	const displayButtons = () => {
		let squadId = getSquadId()
		let attackTeam, opponentTeam
		if(active) {
			attackTeam = activeGac.planStatus[squadId]
			opponentTeam = activeGac.awayStatus[squadId]
		}

		return <div className='offense-button-group'>
			<Button primary disabled={attackTeam === undefined || attackTeam.squad.length === 0} onClick={attack}><Icon name='bolt'></Icon>Battle</Button>
			<Button color='yellow' disabled={opponentTeam === undefined || opponentTeam.squad.length === 0} onClick={findCounter}><Icon name='search'></Icon>Find Counter</Button>
			<Button color='blue' disabled={opponentTeam === undefined || opponentTeam.squad.length === 0} onClick={findInsightCounter}><Icon name='eye'></Icon>Insights</Button>
			<Button secondary onClick={openBattleLog}><Icon name='book'></Icon>Show Battle History</Button>
		</div>
	}

    const handleMenuClick = (e, obj) => {
        let tabName = obj.name
        setActiveMenu(tabName)
    }

	const displayCurrentMenu = () => {
		switch(activeMenu) {
			case 'Custom Squad':
				return getCustomSquadMenu()
			case 'Preset Squad':
				return getPresetSquadMenu()
			case 'Datacrons':
				return getDatacronsMenu('homeStatus')
			default:
				return <Header>Unknown</Header>
		}
	}

	const removeBattleLogItem = () => {
		let newActiveGac = JSON.parse(JSON.stringify(activeGac))
		let battleLogEntryToRemove = newActiveGac.battleLog.pop()

		let previousAttacksOnThisTeam = newActiveGac.battleLog.filter(log => battleLogEntryToRemove.squadId === log.squadId)

		let squadId = battleLogEntryToRemove.squadId
		let newSquadData
		if( previousAttacksOnThisTeam.length > 0) {
			newSquadData = previousAttacksOnThisTeam[previousAttacksOnThisTeam.length-1].defenseTeam
		} else {
			battleLogEntryToRemove.defenseTeam.squad.forEach(unit => {
				unit.isAlive = true
			})
			newSquadData = battleLogEntryToRemove.defenseTeam
		}

		newActiveGac.awayStatus[squadId] = newSquadData
		newActiveGac.planStatus[squadId] = battleLogEntryToRemove.attackTeam
		setActiveGac(newActiveGac)
	}

	return <Grid centered columns={1}>
		<Modal
			onOpen={() => setModalOpen(true)}
			onClose={() => setModalOpen(false)}
			open={modalOpen}
		>
		<Modal.Header>Report Attack</Modal.Header>
			<Form>
				<Header textAlign='center'>
					<Button.Group>
						<Button active={win} onClick={toggleWin}>Win</Button>
						<Button.Or />
						<Button active={!win} onClick={toggleWin}>Loss</Button>
					</Button.Group>
				</Header>
			{
				win
				?
				<Header textAlign='center'>
				<Form.Field inline label='Banners' control={Input} type='number' value={banner} onChange={handleBannerChange}/>
				</Header>
				:
				<div>
				<Header textAlign='center'>Which toons did you defeat?</Header>
				{displayDefenseTeamInBattleReportModal()}
				</div>
			}
			<br></br>
			<Form.Field label='Comments' control={TextArea} placeholder='Comments' value={comment} onChange={handleCommentChange}/>
			</Form>

			<Modal.Actions>
				<Button negative onClick={() => setModalOpen(false)}>
					<Icon name='times'></Icon>
				Cancel
				</Button>
				<Button
				content="Confirm"
				labelPosition='right'
				icon='checkmark'
				onClick={() => reportAttack()}
				positive
				/>
      		</Modal.Actions>
		</Modal>

		<Modal
			onOpen={() => setLogModalOpen(true)}
			onClose={() => setLogModalOpen(false)}
			open={logModalOpen}
		>
			<Modal.Header>
				Battle Log
			</Modal.Header>
			<Modal.Content scrolling>
				{displayBattleLog()}
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={() => setLogModalOpen(false)}>
					Close
				</Button>
			</Modal.Actions>
		</Modal>
		<Grid.Row>
			<Grid stackable columns={2}>
			<Grid.Column>
				<Header textAlign='center'>Your Squad</Header>
				{displayAttackTeam()}
			</Grid.Column>
			<Grid.Column>
				<Header textAlign='center'>Enemy Squad</Header>
				{displayDefenseTeam()}
			</Grid.Column>
			</Grid>
		</Grid.Row>
		<Grid.Row centered>
			{displayButtons()}
		</Grid.Row>
		<Grid.Row centered>
			<Menu attached='top' tabular>
                <Menu.Item name='Custom Squad' active={activeMenu === 'Custom Squad'} onClick={handleMenuClick}/>
                <Menu.Item name='Preset Squad' active={activeMenu === 'Preset Squad'} onClick={handleMenuClick}/>
				<Menu.Item name='Datacrons' active={activeMenu === 'Datacrons'} onClick={handleMenuClick}/>
            </Menu>
            <Segment attached='bottom' >
                {displayCurrentMenu()}
            </Segment>
		</Grid.Row>
	</Grid>
}

export default GacOffense;