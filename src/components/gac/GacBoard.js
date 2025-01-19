import React, { useEffect, useState } from 'react';
import { Card, Grid, Header, Icon, Ref, List } from 'semantic-ui-react';
import { squadsPerZone } from '../../utils/constants';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'

function GacBoard ({step, account, opponent, active, setActive, setActiveGac, showBackWall, units, activeGac, getSquadData, generateSquadId, getSquadId, getOwner}){

    const [baseIdToThumbnail, setBaseIdToThumbnail] = useState({})

	useEffect(() => {
        // eslint-disable-next-line
        setBaseIdToThumbnail(units.reduce((map, obj) => (map[obj.baseId] = obj.thumbnailName, map), {}))
	}, [units])

    const getImage = (owner, squadId) => {
        let squadData = getSquadData(owner, squadId)
        if(squadData === undefined) {
            return '/plus-sign.png'
        }
        if(squadData.squad.length === 0) {
            return '/plus-sign.png'
        }
        let baseId = squadData.squad[0].baseId
        let thumbnail = baseIdToThumbnail[baseId]
        if(thumbnail) {
            return `https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${thumbnail}.png`
        } else {
            return '/plus-sign.png'
        }
    }

    const teamDisabled = (owner, squadId) => {
        let squadData = getSquadData(owner, squadId)
        if(step !== 2) {
            return false
        }
        if(owner === 'homeStatus') {
            return true
        }
        if(owner === 'awayStatus' && (squadData === undefined || squadData.squad.every(elt => !elt.isAlive))) {
            return true
        }
        if(owner === 'awayStatus' && (squadData === undefined || squadData.squad.length === 0)) {
            return true
        }
        return false
    }

    const setActiveTeam = (e) => {
        let newId = e.target.id
        let array = newId.split(':')
        let owner = array[0]
        let squadId =  array[1]
       
        if(teamDisabled(owner, squadId)) {
            return
        }
        if(newId === active) {
            setActive('')
        } else {
            setActive(newId)
        }
    }

    const isActive = (owner, squadId) => {
        return getOwner() === owner && getSquadId() === squadId
    }

    const getSquadDisplayPerZone = (owner, zoneId) => {
        if(owner === '' || zoneId === '') {
            return
        }
        let numSquads = squadsPerZone[activeGac.mode][activeGac.league][zoneId]
        let array = Array.from({ length: numSquads }, (_, i) => i)
        return array.map(index => {
            let squadId = generateSquadId(zoneId, index)

            return <Droppable droppableId={squadId} key={squadId}>
                    {(provided, snapshot) => (
                        <Ref innerRef={provided.innerRef}>
                            <div key={squadId} className='squadContainer' {...provided.droppableProps} style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : 'grey' }}>
                                <span key={squadId} className='squad'>
                                
                                <img id={`${owner}:${squadId}`} src={getImage(owner, squadId)} className={`circular squadImage ${isActive(owner, squadId) ? 'activeTeam' : ''} ${teamDisabled(owner, squadId) ? 'disabled': ''}`} onClick={setActiveTeam} alt={`Defense Team at ${zoneId}`}/>
                                <div>
                            
                            {displayAttackingTeam(owner, squadId)}
                            {provided.placeholder}

                            </div>
            
                            </span>
                            </div>
                        {/* <List divided relaxed {...provided.droppableProps}>
                        {group.list.map((datacron, index) => {
                            return <Draggable draggableId={`draggable-${datacron._id}`} index={index} key={datacron._id} isDragDisabled={!isOfficer()}>
                                {(provided) => (
                                    <Ref innerRef={provided.innerRef}>
                                        <List.Item key={datacron._id} {...provided.dragHandleProps} {...provided.draggableProps}>
                                            <List.Content as='a' onClick={displayDatacron} id={datacron._id}>
                                                <b id={datacron._id}>{`${datacron.title} (Set ${getSetFromTest(datacron, datacrons)[0] || 'Expired'})`}</b>
                                            </List.Content>
                                            <List.Content floated='right' onClick={handleDelete} hidden={!isOfficer()}>
                                                <Icon link name='trash alternate' id={datacron._id}></Icon>
                                            </List.Content>
                                        </List.Item>
                                    </Ref>
                                )}
                            </Draggable>
                        })}
                        {provided.placeholder}
                        </List> */}
                        </Ref>
                )}
            </Droppable>
        })
    }

    const displayAttackingTeam = (owner, squadId) => {
        let squadData = getSquadData('planStatus', squadId)
        if(owner === 'awayStatus' && squadData !== undefined && squadData.squad.length > 0) {
            return <Draggable draggableId={`draggable-${squadId}`} index={0} key={squadId}>
            {(provided) => (
                <Ref innerRef={provided.innerRef}>
                    <div key={squadId} {...provided.dragHandleProps} {...provided.draggableProps}>
                        <img className='attackingTeam' src={getImage('planStatus', squadId)} alt={`Attacking Team: ${squadId}`}/>
                    </div>
                    {/* <List.Item key={datacron._id} {...provided.dragHandleProps} {...provided.draggableProps}>
                        <List.Content as='a' onClick={displayDatacron} id={datacron._id}>
                            <b id={datacron._id}>{`${datacron.title} (Set ${getSetFromTest(datacron, datacrons)[0] || 'Expired'})`}</b>
                        </List.Content>
                        <List.Content floated='right' onClick={handleDelete} hidden={!isOfficer()}>
                            <Icon link name='trash alternate' id={datacron._id}></Icon>
                        </List.Content>
                    </List.Item> */}
                </Ref>
            )}
        </Draggable>
        // <img className='attackingTeam' src={getImage('planStatus', squadId)} alt={`Attacking Team: ${squadId}`}/>
        }
    }

    const setZone = (owner, zone, isBackWall = false) => {
        if(step === 2 && owner === 'homeStatus') {
            return
        }
        if(isBackWall && showBackWall) {
            return <Grid.Column></Grid.Column>
        }
        return <Grid.Column>
            <Card.Group centered>
                {getSquadDisplayPerZone(owner, zone)}
            </Card.Group>
        </Grid.Column>

    }

	return <Grid>
    <Grid.Row columns={2} textAlign='center'>
        <Grid.Column>
            <Header>{account?.name}</Header>
        </Grid.Column>
        <Grid.Column>
            <a href={`https://swgoh.gg/p/${opponent.allyCode}/gac-history/`} target="_blank" rel='noreferrer'><b>{opponent.name} </b><Icon name='external'></Icon></a>
        </Grid.Column>
    </Grid.Row>
    <Grid.Row>
        <Grid.Column width={1}></Grid.Column>
        <Grid.Column width={14}>
        <DragDropContext onDragEnd={(result) => {
            let {source, destination} = result

            console.log(source, destination)

            if(!destination) return
            
            if(source.droppableId === destination.droppableId && source.index === destination.index) return

            

            let oldIndex = source.index
            let newIndex = destination.index
            let oldList = source.droppableId
            let newList = destination.droppableId

            console.log(oldIndex, newIndex, oldList, newList)

            let newActiveGac = JSON.parse(JSON.stringify(activeGac))

            let swap = newActiveGac.planStatus[newList]
            newActiveGac.planStatus[newList] = newActiveGac.planStatus[oldList]
            newActiveGac.planStatus[oldList] = swap

            setActiveGac(newActiveGac)

            // let newGuildDatacronTest = JSON.parse(JSON.stringify(guildDatacronTest))

            // let elementToMove = newGuildDatacronTest[oldList].list.splice(oldIndex, 1)[0]
            // newGuildDatacronTest[newList].list.splice(newIndex, 0, elementToMove)
            // setGuildDatacronTest(newGuildDatacronTest)
        }}>
            {/* {Object.keys(guildDatacronTest).map((key, index) => {
                let group = guildDatacronTest[key]
                return <div key={index} style={{borderRadius: 5, border: '1px solid grey', margin: 5, padding: 5, backgroundColor: 'lightgrey'}}>
                    <h4 style={{margin: 0}}>{group.title}</h4>
                    <Droppable droppableId={key} key={key}>
                    {(provided) => (
                            <Ref innerRef={provided.innerRef}>
                            <List divided relaxed {...provided.droppableProps}>
                            {group.list.map((datacron, index) => {
                                return <Draggable draggableId={`draggable-${datacron._id}`} index={index} key={datacron._id} isDragDisabled={!isOfficer()}>
                                    {(provided) => (
                                        <Ref innerRef={provided.innerRef}>
                                            <List.Item key={datacron._id} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                <List.Content as='a' onClick={displayDatacron} id={datacron._id}>
                                                    <b id={datacron._id}>{`${datacron.title} (Set ${getSetFromTest(datacron, datacrons)[0] || 'Expired'})`}</b>
                                                </List.Content>
                                                <List.Content floated='right' onClick={handleDelete} hidden={!isOfficer()}>
                                                    <Icon link name='trash alternate' id={datacron._id}></Icon>
                                                </List.Content>
                                            </List.Item>
                                        </Ref>
                                    )}
                                </Draggable>
                            })}
                            {provided.placeholder}
                            </List>
                            </Ref>
                    )}
                </Droppable>
                </div>
            })} */}
            <Grid relaxed className='gacBackground' textAlign='center' verticalAlign='middle'>
                <Grid.Row columns={step === 2 ? 2 : 4}>
                    {setZone('homeStatus', '4zone_phase02_conflict01', true)}
                    {setZone('homeStatus', '4zone_phase01_conflict01')}
                    {setZone('awayStatus', '4zone_phase01_conflict01')}
                    {setZone('awayStatus', '4zone_phase02_conflict01')}
                </Grid.Row>
                <Grid.Row columns={step === 2 ? 2 : 4}>
                   {setZone('homeStatus', '4zone_phase02_conflict02', true)}
                    {setZone('homeStatus', '4zone_phase01_conflict02')}
                    {setZone('awayStatus', '4zone_phase01_conflict02')}
                    {setZone('awayStatus', '4zone_phase02_conflict02')}
                </Grid.Row>
            </Grid>

        </DragDropContext>

        </Grid.Column>
    </Grid.Row>
</Grid>
}

export default GacBoard;