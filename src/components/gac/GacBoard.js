import React, { useEffect, useState } from 'react';
import { Card, Grid, Header, Icon } from 'semantic-ui-react';
import { squadsPerZone } from '../../utils/constants';

function GacBoard ({step, account, opponent, active, setActive, showBackWall, units, activeGac, getSquadData, generateSquadId, getSquadId, getOwner}){

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

            return <div key={squadId} className='squadContainer'>
            <span key={squadId} className='squad'>
            
            <img id={`${owner}:${squadId}`} src={getImage(owner, squadId)} className={`circular squadImage ${isActive(owner, squadId) ? 'activeTeam' : ''} ${teamDisabled(owner, squadId) ? 'disabled': ''}`} onClick={setActiveTeam} alt={`Defense Team at ${zoneId}`}/>
            {displayAttackingTeam(owner, squadId)}
            </span>
            </div>
        })
    }

    const displayAttackingTeam = (owner, squadId) => {
        let squadData = getSquadData('planStatus', squadId)
        if(owner === 'awayStatus' && squadData !== undefined && squadData.squad.length > 0) {
            return <img className='attackingTeam' src={getImage('planStatus', squadId)} alt={`Attacking Team: ${squadId}`}/>
        }
    }

    const setZone = (owner, zone) => {
        return <Card.Group centered>
            {
                getSquadDisplayPerZone(owner, zone)
            }
            </Card.Group>
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
                <Grid.Column>{setZone('homeStatus', '4zone_phase02_conflict01')}</Grid.Column>
                :
                <Grid.Column></Grid.Column>
                }
                <Grid.Column>{setZone('homeStatus', '4zone_phase01_conflict01')}</Grid.Column>
                <Grid.Column>{setZone('awayStatus', '4zone_phase01_conflict01')}</Grid.Column>
                <Grid.Column>{setZone('awayStatus', '4zone_phase02_conflict01')}</Grid.Column>
            </Grid.Row>
            <Grid.Row columns={4}>
                {
                showBackWall
                ?
                <Grid.Column>{setZone('homeStatus', '4zone_phase02_conflict02')}</Grid.Column>
                :
                <Grid.Column></Grid.Column>
                }
                <Grid.Column>{setZone('homeStatus', '4zone_phase01_conflict02')}</Grid.Column>
                <Grid.Column>{setZone('awayStatus', '4zone_phase01_conflict02')}</Grid.Column>
                <Grid.Column>{setZone('awayStatus', '4zone_phase02_conflict02')}</Grid.Column>
            </Grid.Row>
        </Grid>
        </Grid.Column>
    </Grid.Row>
</Grid>
}

export default GacBoard;