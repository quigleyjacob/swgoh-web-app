import React, { useState } from 'react';
import { Grid, Header, Menu, Segment } from 'semantic-ui-react';
import { getCharacterData, getShipData } from '../../utils';
import CharacterList from '../profile/CharacterList';
import ShipList from '../profile/ShipList'

function GacDefense ({active, units, categories, getCurrentSquadDatacron, getDatacronsMenu, nicknames, getOwner, isFleet, addToSquad, removeFromSquad, getCharactersFromRoster, getRemainingCharacters, getPresetSquadMenu, getEraUnitStatus}){

	const [activeMenu, setActiveMenu] = useState('Custom Squad')

    const getCustomSquadMenu = () => {
        if(active) {
            return isFleet()
                ?
                <ShipList width={6} size='small' unitData={getShipData(getRemainingCharacters(), units)} onClick={addToSquad} categories={categories} defaultSort='power' nicknames={nicknames}/>
                :
                <CharacterList width={6} size='small' unitData={getCharacterData(getRemainingCharacters(), units)} onClick={addToSquad} categories={categories} defaultSort='power' nicknames={nicknames} eraUnitStatus={getEraUnitStatus()}/>
        }
    }

    const displayCurrentSquad = () => {
        if(active) {
            if(isFleet()) {
                return <ShipList size='small' unitData={getShipData(getCharactersFromRoster(), units)} onClick={removeFromSquad} filter={false} center={true} categories={categories}/>
            } else {
                return <CharacterList size='small' unitData={getCharacterData(getCharactersFromRoster(), units)} onClick={removeFromSquad} filter={false} center={true} categories={categories} displayDatacron={getCurrentSquadDatacron}/>
            }
        }
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
            case 'Datacrons':
                return getDatacronsMenu()
            default:
                return <Header>Unknown</Header>
        }
    }

    const selectedPlayerSquad = () => {
        if(active) {
            let isPlayer = getOwner() === 'homeStatus'
            if(activeMenu === 'Datacrons' && isFleet()) {
                setActiveMenu('Custom Squad')
            }
            if(!isPlayer && activeMenu === 'Preset Squad') {
                setActiveMenu('Custom Squad')
            }
            return isPlayer
        }
        return false
    }

	return <Grid centered columns={1}>
        <Grid.Row centered>
            <Header textAlign='center'>Selected Squad</Header>
        </Grid.Row>
        <Grid.Row centered className='toonList'>
            {displayCurrentSquad()}
        </Grid.Row>

        <Grid.Row>
            <Menu attached='top' tabular>
                <Menu.Item name='Custom Squad' active={activeMenu === 'Custom Squad'} onClick={handleMenuClick}/>
                <Menu.Item disabled={!selectedPlayerSquad()} name='Preset Squad' active={activeMenu === 'Preset Squad'} onClick={handleMenuClick}/>
                <Menu.Item disabled={active === "" || isFleet()} name='Datacrons' active={activeMenu === 'Datacrons'} onClick={handleMenuClick}/>
            </Menu>
            <Segment attached='bottom'>
                {displayCurrentMenu()}
            </Segment>
        </Grid.Row>

        </Grid>
}

export default GacDefense;