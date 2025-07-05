import React, { useEffect, useState } from 'react';
import { Card, Grid, Header, Icon, Ref } from 'semantic-ui-react';
import { squadsPerZone } from '../../utils/constants';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import { generateSquadId } from '../../utils/gac';

function GacBoard ({step, account, opponent, active, setActive, setActiveGac, showBackWall, units, activeGac, getSquadData, getSquadId, getOwner}){

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
        if(owner === 'awayStatus' && (squadData !== undefined && squadData.squad.every(elt => !elt.isAlive))) {
            return true
        }
        // if(owner === 'awayStatus' && (squadData === undefined || squadData.squad.length === 0)) {
        //     return true
        // }
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
        if (owner === '' || zoneId === '') {
            return
        }
        let numSquads = squadsPerZone[activeGac.mode][activeGac.league][zoneId]
        let array = Array.from({ length: numSquads }, (_, i) => i)
        return array.map(index => {
            let squadId = generateSquadId(zoneId, index)

            if (owner === 'homeStatus') {
                return <div key={squadId} className='squadContainer'>
                    <span key={squadId} className='squad'>
                        <img id={`${owner}:${squadId}`} src={getImage(owner, squadId)} className={`circular squadImage ${isActive(owner, squadId) ? 'activeTeam' : ''} ${teamDisabled(owner, squadId) ? 'disabled' : ''}`} onClick={setActiveTeam} alt={`Defense Team at ${zoneId}`} />
                        <div>
                            {displayAttackingTeam(owner, squadId)}
                        </div>
                    </span>
                </div>
            }

            return <Droppable droppableId={squadId} key={squadId}>
                {(provided) => (
                    <Ref innerRef={provided.innerRef}>
                        <div key={squadId} className='squadContainer' {...provided.droppableProps}>
                            <span key={squadId} className='squad'>
                                <img id={`${owner}:${squadId}`} src={getImage(owner, squadId)} className={`circular squadImage ${isActive(owner, squadId) ? 'activeTeam' : ''} ${teamDisabled(owner, squadId) ? 'disabled' : ''}`} onClick={setActiveTeam} alt={`Defense Team at ${zoneId}`} />
                                <div>
                                    {displayAttackingTeam(owner, squadId)}
                                    {provided.placeholder}
                                </div>
                            </span>
                        </div>
                    </Ref>
                )}
            </Droppable>
        })
    }

    function getStyle(style, snapshot) {
        if (!snapshot.isDropAnimating) {
          return style;
        }

        const { moveTo } = snapshot.dropAnimation;

        let squadData = activeGac.planStatus[snapshot.draggingOver]
        let empty = squadData === undefined || squadData.squad.length === 0

        let newX, newY
        if(!empty || (moveTo.x === 0 && moveTo.y === 0)) {
            newX = moveTo.x
            newY = moveTo.y
        } else {
            newX = moveTo.x
            newY = moveTo.y + 67
        }

        return {
          ...style,
          transform: `translate(${newX}px, ${newY}px)`
        };
      }

    const displayAttackingTeam = (owner, squadId) => {
        let squadData = getSquadData('planStatus', squadId)
        if(owner === 'awayStatus' && squadData !== undefined && squadData.squad.length > 0) {
            return <Draggable draggableId={`draggable-${squadId}`} index={0} key={squadId}>
            {(provided, snapshot) => (
                <Ref innerRef={provided.innerRef}>
                    <div key={squadId} {...provided.dragHandleProps} {...provided.draggableProps}  style={getStyle(provided.draggableProps.style, snapshot)}>
                        <img className='attackingTeam' src={getImage('planStatus', squadId)} alt={`Attacking Team: ${squadId}`}/>
                    </div>
                </Ref>
            )}
        </Draggable>
        }
    }

    const setZone = (owner, zone, isBackWall = false) => {
        if(step === 2 && owner === 'homeStatus') {
            return
        }
        if(isBackWall && !showBackWall) {
            return <Grid.Column></Grid.Column>
        }
        return <Grid.Column>
            <Card.Group centered>
                {getSquadDisplayPerZone(owner, zone)}
            </Card.Group>
        </Grid.Column>

    }

	return <Grid>
    <Grid.Row columns={step === 2 ? 1 : 2} textAlign='center'>
        {
            step === 2
            ?
            ''
            :
            <Grid.Column>
                <Header>{account?.name}</Header>
            </Grid.Column>
        }
        <Grid.Column>
            <a href={`https://swgoh.gg/p/${opponent.allyCode}/gac-history/`} target="_blank" rel='noreferrer'><b>{opponent.name} </b><Icon name='external'></Icon></a>
        </Grid.Column>
    </Grid.Row>
    <Grid.Row>
        <Grid.Column width={1}></Grid.Column>
        <Grid.Column width={14}>
        <DragDropContext onDragEnd={(result) => {
            let {source, destination} = result

            if(!destination) return
            
            if(source.droppableId === destination.droppableId && source.index === destination.index) return

            // let squadData = getSquadData('awayStatus', destination.droppableId)
            // if(squadData === undefined) return

            let oldList = source.droppableId
            let newList = destination.droppableId

            let newActiveGac = JSON.parse(JSON.stringify(activeGac))

            let swap = newActiveGac.planStatus[newList]
            newActiveGac.planStatus[newList] = newActiveGac.planStatus[oldList]
            newActiveGac.planStatus[oldList] = swap

            setActiveGac(newActiveGac)
        }}>
            <Grid relaxed className={`gacBackground ${step === 2 ? 'gacBackgroundRight': ''}`} textAlign='center' verticalAlign='middle'>
                <Grid.Row columns={step === 2 ? 2 : 4}>
                    {setZone('homeStatus', '4zone_phase02_conflict01_duel01', true)}
                    {setZone('homeStatus', '4zone_phase01_conflict01_duel01')}
                    {setZone('awayStatus', '4zone_phase01_conflict01_duel01')}
                    {setZone('awayStatus', '4zone_phase02_conflict01_duel01')}
                </Grid.Row>
                <Grid.Row columns={step === 2 ? 2 : 4}>
                   {setZone('homeStatus', '4zone_phase02_conflict02_duel01', true)}
                    {setZone('homeStatus', '4zone_phase01_conflict02_duel01')}
                    {setZone('awayStatus', '4zone_phase01_conflict02_duel01')}
                    {setZone('awayStatus', '4zone_phase02_conflict02_duel01')}
                </Grid.Row>
            </Grid>

        </DragDropContext>

        </Grid.Column>
    </Grid.Row>
</Grid>
}

export default GacBoard;