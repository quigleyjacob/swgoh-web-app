import { useEffect, useState } from 'react'
import { Grid, Header, Form, Dropdown, Menu, Segment } from 'semantic-ui-react';
import { modes, leagues, squadsPerZone } from '../../utils/constants';
import { setZone } from '../gac/board/utils/gacBoardUtils';
import { getSquadsPerZone } from '../gac/board/utils/gacBoardUtils';
import CharacterList from './CharacterList';
import ShipList from './ShipList';
import SquadsList from './SquadsList';
import { getShipData, getCharacterData } from '../../utils';

function Defense({session, account, defenseIdList, defenseMap, redirect, units, categories, nicknames, squads}) {

    const [activeDefense, setActiveDefense] = useState('new')
    const [baseIdToThumbnail, setBaseIdToThumbnail] = useState({})
    const [active, setActive] = useState('')
    const [activeMenu, setActiveMenu] = useState('Custom Squad')

    const [currentDefense, setCurrentDefense] = useState({
        title: "Test",
        league: 'KYBER',
        mode: 5,
        map: getSquadsPerZone(squadsPerZone[5]['KYBER'])
    })

	useEffect(() => {
        // eslint-disable-next-line
        setBaseIdToThumbnail(units.reduce((map, obj) => (map[obj.baseId] = obj.thumbnailName, map), {}))
	}, [units])

    useEffect(() => {
        redirect('defense')
    })

    const setActiveTeam = (e, obj) => {
        let newId = e.target.id
        let array = newId.split(':')
        let owner = array[0]
        let zone =  array[1]
        let squad = Number(array[2])
        if(teamDisabled(owner, zone, squad)) {
            return
        }
        if(newId === active) {
            setActive('')
        } else {
            setActive(newId)
        }
    }

    const teamDisabled = () => {
        return false
    }

    const displayCurrentSquad = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            if(isFleet) {
                return <ShipList unitData={getShipData(getCharactersInSquad(), units)} onClick={removeFromSquad} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList unitData={getCharacterData(getCharactersInSquad(), units)} onClick={removeFromSquad} filter={false} center={true} categories={categories} displayDatacron={getCurrentSquadDatacron}/>
            }
        }
    }

    const getToonsInPlayerDefense = () => {
        return [...currentDefense.map.top.flat(1), ...currentDefense.map.bottom.flat(1), ...currentDefense.map.back.flat(1), ...currentDefense.map.fleet.flat(1)]
    }

    const getMaxSquadSize = (zone=null) => {
        if(active !== '') {
            let array = active.split(':')
            let isFleet = (zone || array[1]) === 'fleet'
            return isFleet ? 8 : 5
        }
        return -1
    }

    const addToSquad = (baseId) => {
        if(active) {
            let array = active.split(':')
            let newCurrentDefense = JSON.parse(JSON.stringify(currentDefense))
            let zone = array[1]
            let squadNumber = Number(array[2])
            let currentSquad = newCurrentDefense.map[zone][squadNumber]
            if(currentSquad.length < getMaxSquadSize()) {
                currentSquad.push(baseId)
                setCurrentDefense(newCurrentDefense)
            }
        }
    }

    const removeFromSquad = (baseId) => {
        if(active) {
            let array = active.split(':')
            let newCurrentDefense = JSON.parse(JSON.stringify(currentDefense))
            let zone = array[1]
            let squadNumber = Number(array[2])
            let newSquadList = newCurrentDefense.map[zone][squadNumber].filter(unit => unit !== baseId)
            newCurrentDefense.map[zone][squadNumber] = newSquadList
            setCurrentDefense(newCurrentDefense)
        }
    }

    const getCurrentSquadDatacron = (simple=true, planned=false) => {
        if(active) {
            // let array = active.split(':')
            // let isSelf = array[0] === 'player'
            // let zone = array[1]
            // let squadNumber = Number(array[2])
            // let datacron
            // if(planned) {
            //     if(!activeGac.planDatacronMap) {
            //         activeGac.planDatacronMap = getSquadsPerZone(activeGac.squadsPerZone)
            //     }
            //     datacron = activeGac.planDatacronMap[zone][squadNumber]
            // } else if(isSelf) {
            //     if(!activeGac.playerDatacronMap) {
            //         activeGac.playerDatacronMap = getSquadsPerZone(activeGac.squadsPerZone)
            //     }
            //     datacron = activeGac.playerDatacronMap[zone][squadNumber]
            // } else {
            //     if(!activeGac.opponentDatacronMap) {
            //         activeGac.opponentDatacronMap = getSquadsPerZone(activeGac.squadsPerZone)
            //     }
            //     datacron = activeGac.opponentDatacronMap[zone][squadNumber]
            // }
            return <div></div>
        }
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

    const getCustomSquadMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            return isFleet
                ?
                <ShipList unitData={getShipData(getRemainingCharacters(), units)} onClick={addToSquad} categories={categories} defaultSort='power' nicknames={nicknames}/>
                :
                <CharacterList unitData={getCharacterData(getRemainingCharacters(), units)} onClick={addToSquad} categories={categories} defaultSort='power' nicknames={nicknames}/>
                
        }
    }

    const getRemainingCharacters = () => {
        if(active) {
            let placements = getToonsInPlayerDefense()
            return account.rosterUnit.filter(unit => !placements.includes(unit.baseId))
        }
    }

    const getPresetSquadMenu = () => {
        if(active) {
            let array = active.split(':')
            let isFleet = array[1] === 'fleet'
            let remainingToonsBaseId = getRemainingCharacters().map(toon => toon.baseId)
            return <SquadsList remainingToonsBaseId={remainingToonsBaseId} account={account} units={units} toon={!isFleet} squads={squads} categories={categories} isFor3={false} isFor5={true} session={session} displayDelete={false} onSquadClick={onSquadClick}/>
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
            let player = array[0]
            let zone = array[1]
            let squadNumber = Number(array[2])
            if(player === 'player') {
                let newCurrentDefense = JSON.parse(JSON.stringify(currentDefense))
                newCurrentDefense.map[zone][squadNumber] = squad
                setCurrentDefense(newCurrentDefense)
            }
        }
    }

    const getCharactersInSquad = () => {
        if(active) {
            let array = active.split(':')
            let player = account
            let placements = currentDefense.map
            let combatType = array[1]
            let squadNumber = Number(array[2])
            let squadList = placements[combatType][squadNumber]
            player.rosterUnit.forEach(unit => {
                let baseId = unit.definitionId.split(':')[0]
                unit.baseId = baseId
            })
            // eslint-disable-next-line
            let playerUnitsMap = player.rosterUnit.reduce((map, obj) => (map[obj.baseId] = obj, map), {})
            return squadList.map(baseId => playerUnitsMap[baseId])
        }
    }

    const handleMenuClick = (e, obj) => {
        let tabName = obj.name
        setActiveMenu(tabName)
    }

    return <div>
        <Header size='huge' textAlign='center'>Defense</Header>
        <Grid>
            <Grid.Column width={4}>
                list all defenses created
            </Grid.Column>
            <Grid.Column width={12}>
                <Grid>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Form.Input
                                fluid
                                id='title'
                                placeholder='Title'
                                label='Title'
                                // value={}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <Form.Input
                                fluid
                                id={'league'}
                                label={'League'}
                                control={Dropdown}
                                placeholder={'League'}
                                selection
                                options={leagues}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <Form.Input
                                fluid
                                id={'mode'}
                                label={'GAC Mode'}
                                control={Dropdown}
                                placeholder='Mode'
                                selection
                                options={modes}
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column computer={8} mobile={16}>
                            <Grid>
                                <Grid.Column width={15}>
                                <Grid relaxed className=' gacBackground gacBackgroundLeft' textAlign='center' verticalAlign='middle'>
                                    <Grid.Row columns={2}>
                                        <Grid.Column>{setZone('player', currentDefense.map, 'fleet', teamDisabled, setActiveTeam, baseIdToThumbnail, null, active)}</Grid.Column>
                                        <Grid.Column>{setZone('player', currentDefense.map, 'top', teamDisabled, setActiveTeam, baseIdToThumbnail, null, active)}</Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row columns={2}>
                                        <Grid.Column>{setZone('player', currentDefense.map, 'back', teamDisabled, setActiveTeam, baseIdToThumbnail, null, active)}</Grid.Column>
                                        <Grid.Column>{setZone('player', currentDefense.map, 'bottom', teamDisabled, setActiveTeam, baseIdToThumbnail, null, active)}</Grid.Column>
                                    </Grid.Row>
                                </Grid>
                                </Grid.Column>
                                <Grid.Column width={1}></Grid.Column>
                            </Grid>

                        </Grid.Column>

                        <Grid.Column computer={8} mobile={16}>
                            <Grid.Row>
                            <Grid centered columns={1}>
                            <Grid.Row centered className='toonList'>
                                {displayCurrentSquad()}
                            </Grid.Row>

                            <Grid.Row>
                                <Menu attached='top' tabular>
                                    <Menu.Item name='Custom Squad' active={activeMenu === 'Custom Squad'} onClick={handleMenuClick}/>
                                    <Menu.Item name='Preset Squad' active={activeMenu === 'Preset Squad'} onClick={handleMenuClick}/>
                                </Menu>
                                <Segment attached='bottom'>
                                    {displayCurrentMenu()}
                                </Segment>
                            </Grid.Row>

                            </Grid>
                            </Grid.Row>

                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Grid.Column>
        </Grid>
    </div>
}

export default Defense