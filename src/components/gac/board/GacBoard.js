import React, { useEffect, useState } from 'react';
import { Card, Grid, Header, Icon } from 'semantic-ui-react';
import { setZone } from './utils/gacBoardUtils';

function GacBoard ({step, account, opponent, active, setActive, showBackWall, units, activeGac}){

    const [baseIdToThumbnail, setBaseIdToThumbnail] = useState({})

	useEffect(() => {
        // eslint-disable-next-line
        setBaseIdToThumbnail(units.reduce((map, obj) => (map[obj.baseId] = obj.thumbnailName, map), {}))
	}, [units])

    const teamDisabled = (owner, zone, squad) => {
        return (owner === 'player' && step === 2) 
            || (owner === 'opponent' && activeGac.killMap[zone][squad].every(v => v === true) && step === 2)
            || (owner === 'opponent' && activeGac.opponentMap[zone][squad].length === 0 && step === 2)
    }

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
        <Grid relaxed className='gacBackground' textAlign='center' verticalAlign='middle'>
            <Grid.Row columns={4}>
                {
                showBackWall
                ?
                <Grid.Column>{setZone('player', activeGac.playerMap, 'fleet', teamDisabled, setActiveTeam, baseIdToThumbnail, activeGac, active)}</Grid.Column>
                :
                <Grid.Column></Grid.Column>
                }
                <Grid.Column>{setZone('player', activeGac.playerMap, 'top', teamDisabled, setActiveTeam, baseIdToThumbnail, activeGac, active)}</Grid.Column>
                <Grid.Column>{setZone('opponent', activeGac.opponentMap, 'top', teamDisabled, setActiveTeam, baseIdToThumbnail, activeGac, active)}</Grid.Column>
                <Grid.Column>{setZone('opponent', activeGac.opponentMap, 'fleet', teamDisabled, setActiveTeam, baseIdToThumbnail, activeGac, active)}</Grid.Column>
            </Grid.Row>
            <Grid.Row columns={4}>
                {
                showBackWall
                ?
                <Grid.Column>{setZone('player', activeGac.playerMap, 'back', teamDisabled, setActiveTeam, baseIdToThumbnail, activeGac, active)}</Grid.Column>
                :
                <Grid.Column></Grid.Column>
                }
                <Grid.Column>{setZone('player', activeGac.playerMap, 'bottom', teamDisabled, setActiveTeam, baseIdToThumbnail, activeGac, active)}</Grid.Column>
                <Grid.Column>{setZone('opponent', activeGac.opponentMap, 'bottom', teamDisabled, setActiveTeam, baseIdToThumbnail, activeGac, active)}</Grid.Column>
                <Grid.Column>{setZone('opponent', activeGac.opponentMap, 'back', teamDisabled, setActiveTeam, baseIdToThumbnail, activeGac, active)}</Grid.Column>
            </Grid.Row>
        </Grid>
        </Grid.Column>
    </Grid.Row>
</Grid>
}

export default GacBoard;