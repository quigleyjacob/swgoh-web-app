import React, { useEffect, useState } from 'react';
import { Card, Grid, Header, Icon } from 'semantic-ui-react';

function GacBoard ({step, account, opponent, active, setActive, showBackWall, units, activeGac}){

    const [baseIdToThumbnail, setBaseIdToThumbnail] = useState({})

	useEffect(() => {
        // eslint-disable-next-line
        setBaseIdToThumbnail(units.reduce((map, obj) => (map[obj.baseId] = obj.thumbnailName, map), {}))
	}, [units])

    const getImage = (units) => {
        if(units.length === 0) {
            return '/plus-sign.png'
        }
        let baseId = units[0]
        let thumbnail = baseIdToThumbnail[baseId]
        if(thumbnail) {
            return `https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${thumbnail}.png`
        } else {
            return '/plus-sign.png'
        }
    }

    const teamDisabled = (owner, zone, squad, step) => {
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
        if(teamDisabled(owner, zone, squad, step)) {
            return
        }
        if(newId === active) {
            setActive('')
        } else {
            setActive(newId)
        }
    }

    const setZone = (owner, accountMap, zone) => {
        return <Card.Group centered>
            {
                accountMap[zone].map((units, squad) => {
                    let id = `${owner}:${zone}:${squad}`
                    let attackTeam = activeGac.planMap[zone][squad]
                    return <div key={id} className='squadContainer'>
                        <span key={id} className='squad'>
                       
                        <img id={id} src={getImage(units)} className={`circular squadImage ${active === id ? 'activeTeam' : ''} ${teamDisabled(owner, zone, squad, step) ? 'disabled': ''}`} onClick={setActiveTeam} alt={`Defense Team ${units[0]}`}/>
                        {
                            owner === 'opponent' && attackTeam.length > 0
                            ?
                            <img className='attackingTeam' src={getImage(attackTeam)} alt={`Attacking Team: ${attackTeam[0]}`}/>
                            :
                            ''
                        }
                        </span>
                        </div>
                })
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
                <Grid.Column>{setZone('player', activeGac.playerMap, 'fleet')}</Grid.Column>
                :
                <Grid.Column></Grid.Column>
                }
                <Grid.Column>{setZone('player', activeGac.playerMap, 'top')}</Grid.Column>
                <Grid.Column>{setZone('opponent', activeGac.opponentMap, 'top')}</Grid.Column>
                <Grid.Column>{setZone('opponent', activeGac.opponentMap, 'fleet')}</Grid.Column>
            </Grid.Row>
            <Grid.Row columns={4}>
                {
                showBackWall
                ?
                <Grid.Column>{setZone('player', activeGac.playerMap, 'back')}</Grid.Column>
                :
                <Grid.Column></Grid.Column>
                }
                <Grid.Column>{setZone('player', activeGac.playerMap, 'bottom')}</Grid.Column>
                <Grid.Column>{setZone('opponent', activeGac.opponentMap, 'bottom')}</Grid.Column>
                <Grid.Column>{setZone('opponent', activeGac.opponentMap, 'back')}</Grid.Column>
            </Grid.Row>
        </Grid>
        </Grid.Column>
    </Grid.Row>
</Grid>
}

export default GacBoard;