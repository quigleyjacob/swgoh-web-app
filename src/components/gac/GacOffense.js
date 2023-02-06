import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Icon, Input, Message, Modal, Segment, TextArea } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from '../profile/CharacterList';
import ShipList from '../profile/ShipList';
import GacBoard from './GacBoard';

function GacOffense ({account, opponent, playerMap, opponentMap, images, active, setActive, getMaxSquadSize, categories, step, battleLog, setBattleLog, skills, units, killMap, setKillMap, getToonsInBattleLog}){

	useEffect(() => {
		// props.redirect('home')
	})

	const [attackTeam, setAttackTeam] = useState([])
	const [modalOpen, setModalOpen] = useState(false)
	const [win, setWin] = useState(true)
	const [banner, setBanner] = useState('')
	const [comment, setComment] = useState('')
	const [killList, setKillList] = useState([])
	const [logModalOpen, setLogModalOpen] = useState(false)

	const handleBannerChange = (e, obj) => {
		setBanner(obj.value)
	}

	const handleCommentChange = (e, obj) => {
		setComment(obj.value)
	}


	const addToAttackTeam = (e, obj) => {
		if(attackTeam.length < getMaxSquadSize()) {
			let newAttackTeam = [...attackTeam, e]
			// @ts-ignore
			setAttackTeam(newAttackTeam)
		}
		
	}

	const removeFromAttackTeam = (e,obj) => {
		let newAttackTeam = attackTeam.filter(id => id !== e)
		// @ts-ignore
		setAttackTeam(newAttackTeam)
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
            let alreadyPlacedUnits = [...playerMap.top.flat(1), ...playerMap.bottom.flat(1), ...playerMap.back.flat(1), ...playerMap.fleet.flat(1), ...attackTeam.flat(1), ...getToonsInBattleLog()]
            return account.rosterUnit.filter(unit => !alreadyPlacedUnits.includes(unit.baseId))
        }
    }

	const getRemainingToons = () => {
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
			console.log(currentKillList)
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
		setAttackTeam([])
		// @ts-ignore
		let newKillMap = JSON.parse(JSON.stringify(killMap))
		newKillMap[zone][squad] = placedKillList
		setKillMap(newKillMap)
	}

	const openBattleLog = () => {
		setLogModalOpen(true)
	}

	const displayBattleLog = () => {
		return battleLog.map((log, index) => {
			return (
				<Message positive={log.result} negative={!log.result} key={index}>
					<div>
						{
							log.isToon
							?
							<CharacterList unitData={getCharacterData(getLogTeam(account, log.attackTeam), units)} skills={skills} images={images} filter={false} center={true} categories={categories}/>
							:
							// @ts-ignore
							<ShipList unitData={getShipData(getLogTeam(account, log.attackTeam), units)} images={images} filter={false} center={true} categories={categories}/>
						}
					</div>
					<br></br>
					<Header textAlign='center' size='huge'>vs.</Header>
					<br></br>
					<div>
						{
							log.isToon
							?
							<CharacterList killList={log.killList} unitData={getCharacterData(getLogTeam(opponent, log.defenseTeam), units)} skills={skills} images={images} filter={false} center={true} categories={categories}/>
							:
							// @ts-ignore
							<ShipList killList={log.killList} unitData={getShipData(getLogTeam(opponent, log.defenseTeam), units)} images={images} filter={false} center={true} categories={categories}/>
						}
					</div>
					<br></br>
					<br></br>
					<div>{log.result ? `For ${log.banner} banners.` : ''}</div>
					<div>{log.comment}</div>
				</Message>
			)
		})
	}

	
	

	return <div>
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
		<Header size='huge' textAlign='center'>GAC Offense</Header>
        <GacBoard step={step} playerMap={playerMap} opponentMap={opponentMap} images={images} account={account} opponent={opponent} active={active} setActive={setActive} getMaxSquadSize={getMaxSquadSize} killMap={killMap} 
		// @ts-ignore
        setAttackTeam={setAttackTeam}/>
		<Grid columns={2}>
			<Grid.Column>
				<Header textAlign='center'>Your Squad</Header>
				{displayAttackTeam()}
			</Grid.Column>
			<Grid.Column>
				<Header textAlign='center'>Enemy Squad</Header>
				{displayCurrentSquad()}
			</Grid.Column>
		</Grid>
		<Button primary disabled={!active || attackTeam.length === 0} onClick={attack}><Icon name='bolt'></Icon>Battle</Button>
		<Button secondary onClick={openBattleLog}><Icon name='book'></Icon>Show Battle History</Button>
		<Header textAlign='center'>Remaining Characters</Header>
        <Segment attached='bottom'>
        {getRemainingToons()}
        </Segment>
	</div>
}

export default GacOffense;