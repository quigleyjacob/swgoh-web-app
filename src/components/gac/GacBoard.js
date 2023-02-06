import React, { useEffect } from 'react';
import { Grid, Header, Image, List } from 'semantic-ui-react';

function GacBoard ({step, playerMap, opponentMap, images, account, opponent, active, setActive, getMaxSquadSize, killMap, setAttackTeam=()=>{}}){

	useEffect(() => {
		// props.redirect('home')
	})

    const getImage = (units) => {
        if(units.length === 0) {
            return '/square-image.png'
        }
        let baseId = units[0]
        if(images[baseId]) {
            return `data:image/png;base64, ${images[baseId]}`
        } else {
            return '/square-image.png'
        }
    }

    const teamDisabled = (owner, zone, squad, step) => {
        return (owner === 'player' && step === 2) 
            || (owner === 'opponent' && killMap[zone][squad].every(v => v === true) && step === 2)
            || (owner === 'opponent' && opponentMap[zone][squad].length === 0 && step === 2)
    }

    const setActiveTeam = (e, obj) => {
        let newId = obj.id
        let array = newId.split(':')
        let owner = array[0]
        let zone =  array[1]
        let squad = Number(array[2])
        if(teamDisabled(owner, zone, squad, step)) {
            return
        }
        // @ts-ignore
        setAttackTeam([])
        if(newId === active) {
            setActive('')
        } else {
            setActive(newId)
        }
    }

    const setZone = (owner, accountMap, zone) => {
        return <Image.Group>
            {
                accountMap[zone].map((units, squad) => {
                    let id = `${owner}:${zone}:${squad}`
                    return <Image key={id} disabled={teamDisabled(owner, zone, squad, step)} as={List.Item} id={id} src={getImage(units)} circular className={`zoneImage ${active === id ? 'activeTeam' : ''}`} onClick={setActiveTeam}/>
                })
            }
            </Image.Group>
    }

	return <Grid textAlign='center'>
    <Grid.Row columns={2}>
        <Grid.Column>
            <Header>{account.name}</Header>
        </Grid.Column>
        <Grid.Column>
            <Header >{opponent.name}</Header>
        </Grid.Column>
    </Grid.Row>
    <Grid.Row>
        <Grid.Column width={1}></Grid.Column>
            <Grid.Column width={14}>
                <Grid className='gacBackground'>
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
        <Grid.Column width={1}></Grid.Column>              
    </Grid.Row>
</Grid>
}

export default GacBoard;