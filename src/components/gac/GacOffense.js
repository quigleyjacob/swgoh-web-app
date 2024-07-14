import React, { useState } from 'react';
import { Button, Form, Grid, Header, Icon, Input, Menu, Message, Modal, Segment, TextArea } from 'semantic-ui-react';
import { getCharacterData, getShipData, arrayEquals } from '../../utils';
import CharacterList from '../profile/CharacterList';
import ShipList from '../profile/ShipList';
import SquadsList from '../profile/SquadsList';
import './Gac.css'
import Datacron from '../profile/Datacron';

function GacOffense ({account, opponent, active, setActive, getMaxSquadSize, categories, units, getToonsInBattleLog, getToonsInPlayerDefense, getToonsInPlanMap, squads, session, activeGac, setActiveGac, getCurrentSquadDatacron, getDatacronsMenu, datacrons, nicknames}){

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


	const addToAttackTeam = (e, obj) => {
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = array[2]
			let attackTeam = activeGac.planMap[zone][squad]
			if(attackTeam.length < getMaxSquadSize()) {
				let newAttackTeam = [...attackTeam, e]
				let newActiveGac = JSON.parse(JSON.stringify(activeGac))
				newActiveGac.planMap[zone][squad] = newAttackTeam
				setActiveGac(newActiveGac)
			}
		}
	}

	const removeFromAttackTeam = (e,obj) => {
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = array[2]
			let newActiveGac = JSON.parse(JSON.stringify(activeGac))
			let attackTeam = newActiveGac.planMap[zone][squad]
			let newAttackTeam = attackTeam.filter(id => id !== e)
			
			newActiveGac.planMap[zone][squad] = newAttackTeam
			setActiveGac(newActiveGac)
		}
	}

	const displayAttackTeam = () => {
		if(active) {
			let array = active.split(':')
            let isFleet = array[1] === 'fleet'
			if(isFleet) {
                return <ShipList unitData={getShipData(getAttackTeamData(), units)} onClick={removeFromAttackTeam} categories={categories} filter={false} center={true}/>
            } else {
                return <CharacterList unitData={getCharacterData(getAttackTeamData(), units)} onClick={removeFromAttackTeam} categories={categories} filter={false} center={true} displayDatacron={() => getCurrentSquadDatacron(true, true)}/>
            }
		}
	}

	const getAttackTeamData = () => {
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = array[2]
			let attackTeam = activeGac.planMap[zone][squad]
			// eslint-disable-next-line
			let unitsMap = account.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
			account.rosterUnit.forEach(unit => {
                let baseId = unit.definitionId.split(':')[0]
                unit.baseId = baseId
            })
			return attackTeam.map(baseId => unitsMap[baseId])
		}
	}

	const getRemainingCharacters = () => {
        if(active) {
            let alreadyPlacedUnits = [...getToonsInPlayerDefense(), ...getToonsInPlanMap(), ...getToonsInBattleLog()]
            return account.rosterUnit.filter(unit => !alreadyPlacedUnits.includes(unit.baseId))
        }
    }

	const getCustomSquadMenu = () => {
		if(active) {
			let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            if(isFleet) {
                return <ShipList unitData={getShipData(getRemainingCharacters(), units)} onClick={addToAttackTeam} categories={categories} defaultSort='power' nicknames={nicknames}/>
            } else {
                return <CharacterList unitData={getCharacterData(getRemainingCharacters(), units)} onClick={addToAttackTeam} categories={categories} defaultSort='power' nicknames={nicknames}/>
            }
		}
	}

	const getActiveTeam = (squad=null) => {
		if(active) {
			let array = active.split(':')
			let combatType = array[1]
            let squadNumber = Number(array[2])
			let squadList = squad || activeGac.opponentMap[combatType][squadNumber]
			opponent.rosterUnit.forEach(unit => {
                let baseId = unit.definitionId.split(':')[0]
                unit.baseId = baseId
            })
			// eslint-disable-next-line
			let unitsMap = opponent.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
			return squadList.map(baseId => unitsMap[baseId])
		}
	}

	const getLogTeam = (user, squad) => {
		user.rosterUnit.forEach(unit => {
			let baseId = unit.definitionId.split(':')[0]
			unit.baseId = baseId
		})
		// eslint-disable-next-line
		let unitsMap = user.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
		return squad.map(baseId => unitsMap[baseId])
	}

	const displayCurrentSquad = () => {
        if(active) {
            let array = active.split(':')
			let zone = array[1]
			let squad = array[2]
            let isFleet = zone === 'fleet'
            if(isFleet) {
                return <ShipList killList={activeGac.killMap[zone][squad]} unitData={getShipData(getActiveTeam(), units)} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList killList={activeGac.killMap[zone][squad]} unitData={getCharacterData(getActiveTeam(), units)} filter={false} center={true} categories={categories} displayDatacron={getCurrentSquadDatacron}/>
            }
        }
    }

	const displayAttackedTeam = () => {
		if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            if(isFleet) {
                return <ShipList killList={killList} unitData={getShipData(getActiveTeam(), units)} onClick={toggleKillStatus} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList killList={killList} unitData={getCharacterData(getActiveTeam(), units)} onClick={toggleKillStatus} filter={false} center={true} categories={categories} displayDatacron={getCurrentSquadDatacron}/>
            }
        }
	}

	const toggleKillStatus = (e, obj) => {
		let array = active.split(':')
		let zone = array[1]
		let squad = Number(array[2])
		let index = activeGac.opponentMap[zone][squad].indexOf(e)
		if(activeGac.killMap[zone][squad][index]) { // if already dead from previous attack, don't flip back
			return
		}
		let newKillList = [...killList]
		newKillList[index] = !newKillList[index]
		if(activeGac.opponentMap[zone][squad].every((v, i) => newKillList[i])) {
			setWin(true)
			setKillList(new Array(killList.length).fill(false))
		} else {
			setKillList(newKillList)
		}
		

	}

	const attack = () => {
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = Number(array[2])
			let currentKillList = activeGac.killMap[zone][squad]
			setKillList(currentKillList)
			setBanner('')
			setComment('')
			setModalOpen(true)
		}	
	}

	const toggleWin = () => {
		let newWinStatus = !win
		if(newWinStatus) {
			setKillList(Array(getMaxSquadSize()).fill(true))
		} else {
			let array = active.split(':')
			let zone = array[1]
			let squad = Number(array[2])
			let currentKillList = activeGac.killMap[zone][squad]
			setKillList(currentKillList)
		}
		setWin(newWinStatus)
	}

	const reportAttack = async () => {
		let array = active.split(':')
		let zone = array[1]
		let squad = Number(array[2])
		let defendingTeam = activeGac.opponentMap[zone][squad]
		let attackTeam = activeGac.planMap[zone][squad]
		let attackDatacron = activeGac.planDatacronMap[zone][squad] || {}
		let defenseDatacron = activeGac.opponentDatacronMap[zone][squad] || {}
		let placedKillList = win ? new Array(defendingTeam.length).fill(true) : killList
		let attackLog = {
			attackTeam: attackTeam,
			defenseTeam: defendingTeam,
			attackDatacron: attackDatacron,
			defenseDatacron: defenseDatacron,
			result: win,
			banner: win ? banner : 0,
			comment: comment,
			killList: placedKillList,
			isToon: zone !== 'fleet'
		}
		let newActiveGac = JSON.parse(JSON.stringify(activeGac))

		newActiveGac.battleLog = [...activeGac.battleLog, attackLog]
		newActiveGac.planMap[zone][squad] = []
		newActiveGac.planDatacronMap[zone][squad] = []
		newActiveGac.killMap[zone][squad] = placedKillList

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
							isLast
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
			let array=active.split(':')
			let zone = array[1]
			let squad = array[2]
			let opponentTeam = activeGac.opponentMap[zone][squad]
			let isFleet = zone === 'fleet'
			let route = isFleet ? 'ship-counters' : 'counters'
			let url = `https://swgoh.gg/gac/${route}`
			let leader = '', member ='', reinforcement = ''
			opponentTeam.forEach((baseId, index) => {
				if(index === 0) {
					leader += baseId
				} else if(isFleet && index > 3) {
					reinforcement += `${baseId}%2C`
				} else {
					member += `${baseId}%2C`
				}
			})
			window.open(`${url}/${leader}?d_member=${member}&d_reinforcement=${reinforcement}`, '_blank')
		}
	}

	const displayButtons = () => {
		let attackTeam = []
		let opponentTeam = []
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = array[2]
			attackTeam = activeGac.planMap[zone][squad]
			opponentTeam = activeGac.opponentMap[zone][squad]
		}

		return <div className='offense-button-group'>
			<Button primary disabled={attackTeam.length === 0} onClick={attack}><Icon name='bolt'></Icon>Battle</Button>
			<Button color='yellow' disabled={opponentTeam.length === 0} onClick={findCounter}><Icon name='search'></Icon>Find Counter on swgoh.gg</Button>
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
				return getDatacronsMenu()
			default:
				return <Header>Unknown</Header>
		}
	}

	const getPresetSquadMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            let remainingToonsBaseId = getRemainingCharacters().map(toon => toon.baseId)
            return <SquadsList remainingToonsBaseId={remainingToonsBaseId} account={account} units={units} toon={!isFleet} squads={squads} categories={categories} isFor3={activeGac.mode === 3} isFor5={activeGac.mode === 5} session={session} displayDelete={false} onSquadClick={onSquadClick}/>
        }
    }

	const onSquadClick = (e, obj) => {
        let squadId = obj.id
        let squad = squads.filter(squad => squad._id === squadId)[0].squad
        let remainingToonsBaseId = getRemainingCharacters().map(toon => toon.baseId)
        let unavailableToons = squad.map(baseId => !remainingToonsBaseId.includes(baseId))
        let ableToPlace = unavailableToons.every(v => v === false)
        if(active && ableToPlace) {
            let array = active.split(':')
            let zone = array[1]
            let squadNumber = Number(array[2])
			let newActiveGac = JSON.parse(JSON.stringify(activeGac))
			newActiveGac.planMap[zone][squadNumber] = squad
			setActiveGac(newActiveGac)
        }
    }

	const removeBattleLogItem = () => {
		let newActiveGac = JSON.parse(JSON.stringify(activeGac))
		let battleLogEntryToRemove = newActiveGac.battleLog.pop()

		let previousAttacksOnThisTeam = newActiveGac.battleLog.filter(log => arrayEquals(battleLogEntryToRemove.defenseTeam, log.defenseTeam))
		let newKillList = previousAttacksOnThisTeam.length > 0 ? previousAttacksOnThisTeam[previousAttacksOnThisTeam.length-1].killList : new Array(battleLogEntryToRemove.defenseTeam.length).fill(false)

		let zones = ["top", "bottom", "back", "fleet"]
		zones.forEach(zone => {
			let squadsInZone = newActiveGac.opponentMap[zone]
			squadsInZone.forEach((squad, index) => {
				if(arrayEquals(squad, battleLogEntryToRemove.defenseTeam)) {
					newActiveGac.killMap[zone][index] = newKillList
					newActiveGac.planMap[zone][index] = battleLogEntryToRemove.attackTeam
					newActiveGac.planDatacronMap[zone][index] = battleLogEntryToRemove.attackDatacron
					setActiveGac(newActiveGac)
					return
				}
			})
		})
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
				{displayAttackedTeam()}
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
		<Grid.Row columns={2} centered>
			<Grid.Column>
			<Header textAlign='center'>Your Squad</Header>
			</Grid.Column>
			<Grid.Column>
			<Header textAlign='center'>Enemy Squad</Header>
			</Grid.Column>
		</Grid.Row>
		<Grid.Row columns={2} className='toonList'>
			<Grid.Column>
				{displayAttackTeam()}
			</Grid.Column>
			<Grid.Column>
				{displayCurrentSquad()}
			</Grid.Column>
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