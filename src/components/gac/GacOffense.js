import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Icon, Input, Menu, Message, Modal, Segment, TextArea } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from '../profile/CharacterList';
import ShipList from '../profile/ShipList';
import SquadsList from '../profile/SquadsList';

function GacOffense ({account, opponent, opponentMap, images, active, setActive, getMaxSquadSize, categories, battleLog, setBattleLog, skills, units, killMap, setKillMap, getToonsInBattleLog, saveGAC, planMap, setPlanMap, getToonsInPlayerDefense, getToonsInPlanMap, squads, mode, session, setSquads}){

	useEffect(() => {
		// props.redirect('home')
	})

	// const [attackTeam, setAttackTeam] = useState([])
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
			let attackTeam = planMap[zone][squad]
			if(attackTeam.length < getMaxSquadSize()) {
				let newAttackTeam = [...attackTeam, e]
				let newPlanMap = JSON.parse(JSON.stringify(planMap))
				newPlanMap[zone][squad] = newAttackTeam
				setPlanMap(newPlanMap)
			}
		}
	}

	const removeFromAttackTeam = (e,obj) => {
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = array[2]
			let attackTeam = planMap[zone][squad]
			let newAttackTeam = attackTeam.filter(id => id !== e)
			let newPlanMap = JSON.parse(JSON.stringify(planMap))
			newPlanMap[zone][squad] = newAttackTeam
			setPlanMap(newPlanMap)
		}
	}

	const displayAttackTeam = () => {
		if(active) {
			let array = active.split(':')
            let isFleet = array[1] === 'fleet'
			if(isFleet) {
                return <ShipList unitData={getShipData(getAttackTeamData(), units)} images={images} addToSquad={removeFromAttackTeam} categories={categories} filter={false} center={true}/>
            } else {
                return <CharacterList unitData={getCharacterData(getAttackTeamData(), units)} addToSquad={removeFromAttackTeam} skills={skills} images={images} categories={categories} filter={false} center={true}/>
            }
		}
	}

	const getAttackTeamData = () => {
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = array[2]
			let attackTeam = planMap[zone][squad]
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
                return <ShipList unitData={getShipData(getRemainingCharacters(), units)} images={images} addToSquad={addToAttackTeam} categories={categories}/>
            } else {
                return <CharacterList unitData={getCharacterData(getRemainingCharacters(), units)} addToSquad={addToAttackTeam} skills={skills} images={images} categories={categories}/>
            }
		}
	}

	const getActiveTeam = (squad=null) => {
		if(active) {
			let array = active.split(':')
			let combatType = array[1]
            let squadNumber = Number(array[2])
			let squadList = squad || opponentMap[combatType][squadNumber]
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
                return <ShipList killList={killMap[zone][squad]} unitData={getShipData(getActiveTeam(), units)} images={images} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList killList={killMap[zone][squad]} unitData={getCharacterData(getActiveTeam(), units)} skills={skills} images={images} filter={false} center={true} categories={categories}/>
            }
        }
    }

	const displayAttackedTeam = () => {
		if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            if(isFleet) {
                // @ts-ignore
                return <ShipList killList={killList} unitData={getShipData(getActiveTeam(), units)} addToSquad={toggleKillStatus} images={images} filter={false} center={true} categories={categories}/>
            } else {
                // @ts-ignore
                return <CharacterList killList={killList} unitData={getCharacterData(getActiveTeam(), units)} addToSquad={toggleKillStatus} skills={skills} images={images} filter={false} center={true} categories={categories}/>
            }
        }
	}

	const toggleKillStatus = (e, obj) => {
		let array = active.split(':')
		let zone = array[1]
		let squad = Number(array[2])
		let index = opponentMap[zone][squad].indexOf(e)
		if(killMap[zone][squad][index]) { // if already dead from previous attack, don't flip back
			return
		}
		let newKillList = [...killList]
		newKillList[index] = !newKillList[index]
		if(newKillList.every(v => v === true)) {
			setWin(true)
			// @ts-ignore
			setKillList(new Array(killList.length).fill(false))
		} else {
			// @ts-ignore
			setKillList(newKillList)
		}
		

	}

	const attack = () => {
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = Number(array[2])
			let currentKillList = killMap[zone][squad]
			setKillList(currentKillList)
			setBanner('')
			setComment('')
			setModalOpen(true)
		}	
	}

	const reportAttack = () => {
		let array = active.split(':')
		let zone = array[1]
		let squad = Number(array[2])
		let defendingTeam = opponentMap[zone][squad]
		let attackTeam = planMap[zone][squad]
		let placedKillList = win ? new Array(defendingTeam.length).fill(true) : killList
		let attackLog = {
			attackTeam: attackTeam,
			defenseTeam: defendingTeam,
			result: win,
			banner: win ? banner : 0,
			comment: comment,
			killList: placedKillList,
			isToon: zone !== 'fleet'
		}
		let newBattleLog = [...battleLog, attackLog]
		setBattleLog(newBattleLog)
		setModalOpen(false)
		setActive('')
		let newPlanMap = JSON.parse(JSON.stringify(planMap))
		newPlanMap[zone][squad] = []
		setPlanMap(newPlanMap)
		// @ts-ignore
		let newKillMap = JSON.parse(JSON.stringify(killMap))
		newKillMap[zone][squad] = placedKillList
		setKillMap(newKillMap)
		saveGAC()
	}

	const openBattleLog = () => {
		setLogModalOpen(true)
	}

	const displayBattleLog = () => {
		return battleLog.map((log, index) => {
			return (
				<Message positive={log.result} negative={!log.result} key={index}>
					<Grid>
						<Grid.Row>
						<Header floated='left' size='huge' textAlign='center'>{log.result ? 'Victory' : 'Defeat'}</Header>
						</Grid.Row>
						<Grid.Row centered>
						{
						log.isToon
						?
						<CharacterList unitData={getCharacterData(getLogTeam(account, log.attackTeam), units)} skills={skills} images={images} filter={false} center={true} categories={categories}/>
						:
						// @ts-ignore
						<ShipList unitData={getShipData(getLogTeam(account, log.attackTeam), units)} images={images} filter={false} center={true} categories={categories}/>
						}
						</Grid.Row>
						<Grid.Row centered>
						<Header textAlign='center' size='huge'>vs.</Header>
						</Grid.Row>
						<Grid.Row centered>
						{
						log.isToon
						?
						<CharacterList killList={log.killList} unitData={getCharacterData(getLogTeam(opponent, log.defenseTeam), units)} skills={skills} images={images} filter={false} center={true} categories={categories}/>
						:
						// @ts-ignore
						<ShipList killList={log.killList} unitData={getShipData(getLogTeam(opponent, log.defenseTeam), units)} images={images} filter={false} center={true} categories={categories}/>
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
			let opponentTeam = opponentMap[zone][squad]
			let url = `https://swgoh.gg/gac/counters/`
			opponentTeam.forEach((baseId, index) => {
				url += index === 0 ? `${baseId}/?` : `d_unit=${baseId}&`
			})
			window.open(url, '_blank')
		}
	}

	const displayButtons = () => {
		let attackTeam = []
		let opponentTeam = []
		if(active) {
			let array = active.split(':')
			let zone = array[1]
			let squad = array[2]
			attackTeam = planMap[zone][squad]
			opponentTeam = opponentMap[zone][squad]
		}

		return <div>
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
			default:
				return <Header>Unknown</Header>
		}
	}

	const getPresetSquadMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            let remainingToonsBaseId = getRemainingCharacters().map(toon => toon.baseId)
            return <SquadsList remainingToonsBaseId={remainingToonsBaseId} account={account} units={units} toon={!isFleet} squads={squads} skills={skills} images={images} categories={categories} isFor3={mode === 3} isFor5={mode === 5} session={session} setSquads={setSquads} displayDelete={false} onSquadClick={onSquadClick}/>
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
			let newPlanMap = JSON.parse(JSON.stringify(planMap))
			newPlanMap[zone][squadNumber] = squad
			setPlanMap(newPlanMap)
        }
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
						<Button active={win} onClick={() => setWin(true)}>Win</Button>
						<Button.Or />
						<Button active={!win} onClick={() => setWin(false)}>Loss</Button>
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
            </Menu>
            <Segment attached='bottom' >
                {displayCurrentMenu()}
            </Segment>
		</Grid.Row>
	</Grid>
}

export default GacOffense;