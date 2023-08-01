// @ts-nocheck
import React, { useState } from 'react';
import './Datacrons.css'
import { List, Grid, Modal, Button, Item } from 'semantic-ui-react';
import { stats } from '../../utils/constants';

function Datacron ({datacron, size='md', datacrons, onClick=()=>{}, simple=true, modal=false}){

    const [open, setOpen] = useState(false)

    const statCell = () => {
        let statMap = {}
        datacron.affix.forEach(affix => {
            let statType = String(affix.statType)
            if(statType === '1') return
            if(statMap[statType]) {
                statMap[statType] += Number(affix.statValue)
            } else {
                statMap[statType] = Number(affix.statValue)
            }
        })
        let statsArray = Object.keys(statMap).map(key => {
            let statName = stats[key].name
            let statValue = Math.round(statMap[key]/10000)/100
            return {
                statName: statName,
                statValue: statValue
            }
        })
        return statsArray.map(({statName, statValue}, index) => {
            return <div className="datacron-card__stat" key={index}>
                    <span className="datacron-card__stat-value">{statValue}%</span>
                    <span className="datacron-card__stat-label">{statName}</span>
                </div>
        })
    }

    const bonusCell = (level) => { // used for levels 2, 5 and 8
        let tierDetails = datacron.affix[level]
        let datacronDetails = [].concat(...datacrons.find(elt => elt.id === datacron.setId).tier[level].bonuses)
        let bonusId = `${tierDetails.abilityId}:${tierDetails.targetRule}`
        let bonus = datacronDetails.find(elt => elt.key === bonusId)
        let scope = tierDetails.scopeIcon
        let icon = level === 8 ? `https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${scope}.png` : `${scope}.png`
        let title = bonus.categoryName
        let text = bonus.value

        let image = () => {
            return <div className="datacron-card__tier-scope">
            <div className="datacron-primary-icon">
                <div className="datacron-primary-icon__selected-ring"></div>
                <img className="datacron-primary-icon__img datacron-primary-icon__img--is-active" src={icon} alt="" loading="lazy"/>
            </div>
        </div>
        }


        return <Item>
            <Item.Image size='tiny' content={image()}/>
            <Item.Content>
                <Item.Header>{title}</Item.Header>
                <Item.Description>{text}</Item.Description>
            </Item.Content>
        </Item>
    }

    const datacronDetails = () => {
        return <Grid>
            <Grid.Column computer={4} mobile={16}>
                <Grid.Row>
                {overviewCell()}
                </Grid.Row>
                <Grid.Row>
                <div className="datacron-card__stats">
                {statCell()}
                </div>
                </Grid.Row>
            </Grid.Column>
            <Grid.Column computer={12} mobile={16}>
                <Item.Group divided>
                {[3,6,9].filter(level => getLevel() >= level).map((level => bonusCell(level-1)))}
                </Item.Group>

            </Grid.Column>
        </Grid>
    }

    const getLevel = () => {
        return datacron.affix.length
    }

    const overviewCell = () => {
        let image = datacrons.find(elt => elt.id === datacron.setId).icon
        let tiers = datacron.affix
        let level = tiers.length
        let tier = level < 3 ? 0 : level < 6 ? 1 : level < 9 ? 2 : 3
        let suffix = level === 0 ? '_empty' : level === 9 ? '_max' : ''

        let icon = ''
        switch(tier) {
            case 0:
                icon = ''
                break
            case 1:
                icon = `${tiers[2].scopeIcon}.png`
                break
            case 2:
                icon = `${tiers[5].scopeIcon}.png`
                break
            case 3:
                icon = `https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${tiers[8].scopeIcon}.png`
                break
            default:
                icon=''
        }


        return <List.Item onClick={onClick}>
        <div className="datacron-card__icon">
                <div className={`datacron-icon datacron-icon--size-${size}`}>
                <div className={`datacron-icon__icon datacron-icon__icon--size-${size}`}>
                    {
                        icon !== ''
                        ?
                        <div className="datacron-icon__callout-affix datacron-icon__callout-affix--size-lg">
                        <img className="datacron-icon__callout-affix-img" src={icon} alt="" loading="lazy"/>
                        </div>
                        :
                        ''
                    }

                    <div className={`datacron-icon__bg datacron-icon__bg--tier-${tier}`}></div>
                    <div className="datacron-icon__box">
                        <img className="datacron-icon__box-img" src={`${image}${suffix}.png`} alt="" loading="lazy"/>
                    </div>
                    <div className="datacron-icon__primaries datacron-icon__primaries--size-lg">
                        <div className={`datacron-icon__primary datacron-icon__primary--size-lg datacron-icon__primary--first datacron-icon__primary${tier > 0 ? '--is-active' : ''}`}></div>
                        <div className={`datacron-icon__primary datacron-icon__primary--size-lg datacron-icon__primary--second datacron-icon__primary${tier > 1 ? '--is-active' : ''}`}></div>
                        <div className={`datacron-icon__primary datacron-icon__primary--size-lg datacron-icon__primary--third datacron-icon__primary${tier > 2 ? '--is-active' : ''}`}></div>
                    </div>
                </div>
                <div className="datacron-icon__level">
                    Level {level}
                </div>
                </div>
            </div>
            </List.Item>
    }

    const datacronDetailsModal = () => {
        return <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        <Modal.Header>Datacron Details</Modal.Header>
        <Modal.Content>
			{datacronDetails()}
        </Modal.Content>
        <Modal.Actions>
          <Button
            content="Close"
            onClick={() => setOpen(false)}
            color='black'
          />
        </Modal.Actions>
      </Modal>
    }

    const displayDatacron = () => {
        if(typeof datacron !== 'object' || Object.keys(datacron).length === 0) return
        if(typeof datacrons !== 'object' || datacrons.length === 0) return
        if(datacron.setId === 0) return
        return simple ? overviewCell() : datacronDetails()
    }

    return <div onClick={() => open ? {} : setOpen(modal)}>
        {modal && open ? datacronDetailsModal() : ""}
        {displayDatacron()}
    </div>
}

export default Datacron;