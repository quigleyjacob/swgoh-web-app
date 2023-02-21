import React, { useEffect } from 'react';
import { Card, Grid, Header, Icon } from 'semantic-ui-react';

function GacBoard ({step, playerMap, opponentMap, images, account, opponent, active, setActive, killMap, planMap}){

	useEffect(() => {
		// props.redirect('home')
	})

    const getImage = (units) => {
        if(units.length === 0) {
            return '/plus-sign.png'
        }
        let baseId = units[0]
        if(images[baseId]) {
            return `data:image/png;base64, ${images[baseId]}`
        } else {
            return '/plus-sign.png'
        }
    }

    const teamDisabled = (owner, zone, squad, step) => {
        return (owner === 'player' && step === 2) 
            || (owner === 'opponent' && killMap[zone][squad].every(v => v === true) && step === 2)
            || (owner === 'opponent' && opponentMap[zone][squad].length === 0 && step === 2)
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
                    let attackTeam = planMap[zone][squad]
                    // console.log(planMap[zone][squad])
                     //  disabled={teamDisabled(owner, zone, squad, step)}
                    return <div className='squadContainer'>
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
            <Header>{account.name}</Header>
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
                <Grid.Column>{setZone('player', playerMap, 'fleet')}</Grid.Column>
                <Grid.Column>{setZone('player', playerMap, 'top')}</Grid.Column>
                <Grid.Column>{setZone('opponent', opponentMap, 'top')}</Grid.Column>
                <Grid.Column>{setZone('opponent', opponentMap, 'fleet')}</Grid.Column>
            </Grid.Row>
            <Grid.Row columns={4}>
                <Grid.Column>{setZone('player', playerMap, 'back')}</Grid.Column>
                <Grid.Column>{setZone('player', playerMap, 'bottom')}</Grid.Column>
                <Grid.Column>{setZone('opponent', opponentMap, 'bottom')}</Grid.Column>
                <Grid.Column>{setZone('opponent', opponentMap, 'back')}</Grid.Column>
            </Grid.Row>
        </Grid>
        </Grid.Column>
    </Grid.Row>
</Grid>
}

export default GacBoard;