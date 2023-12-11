// @ts-nocheck
import React, { useState } from 'react';
import './Datacrons.css'
import { List, Grid, Modal, Button, Item, Message, Header } from 'semantic-ui-react';
import { stats } from '../../utils/constants';

function Datacron ({datacron, size='md', datacrons, onClick=()=>{}, simple=true, modal=false, test=undefined, result=undefined}){

    const levelToBonusType = {
        2: 'alignment',
        5: 'faction',
        8: 'character'
    }

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
                statKey: key,
                statName: statName,
                statValue: statValue
            }
        })
        let includedStats = statsArray.map(item => item.statKey)
        let failedStats = test?.stats?.filter(obj => !includedStats.includes(obj.stat))?.map(obj => {
            return {
                statKey: obj.stat,
                statName: stats[obj.stat].name,
                statValue: 0
            }
        }) || []
        return [...statsArray, ...failedStats].map(({statName, statValue, statKey}, index) => {
            let testStatValue = result?.testCases?.stats?.find(obj => obj.statTest.stat === statKey)
            if(testStatValue) {
                // return <Message positive={testStatValue.score === 1} negative={testStatValue.score !== 1} size='small' compact>
                let testResultClass = testStatValue.score === 1 ? 'positive' : 'negative'
                   return  <Item key={index} className={`${testResultClass}`}>
                        <Item.Description>
                            <strong>{statValue}%</strong> {statName}
                        </Item.Description>
                    </Item>
                // </Message>
            } else {
                return <Item key={index}>
                    <Item.Description>
                        <strong>{statValue}%</strong> {statName}
                    </Item.Description>
                </Item>
            }
        })
    }

    const testResults = () => {
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
            {[3,6,9].map((level => testBonusCell(level-1)))}
            </Item.Group>
        </Grid.Column>
    </Grid>
    }

    const testBonusCell = (level) => {
        let datacronLevel = datacron.affix.length || 0
        let expectedBonusId = test[levelToBonusType[level]]
        let passed = result.passed || result.testCases[levelToBonusType[level]]
        let datacronDetails = [].concat(...datacrons.find(elt => elt.id === datacron.setId).tier[level].bonuses)
        let expectedBonus = datacronDetails.find(elt => elt.key === expectedBonusId)

        let image = (scope) => {
            let icon = level === 8 && scope !== "square-image" ? `https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${scope}.png` : `${scope}.png`
            return <div className="datacron-card__tier-scope">
            <div className="datacron-primary-icon">
                <div className="datacron-primary-icon__selected-ring"></div>
                <img className="datacron-primary-icon__img datacron-primary-icon__img--is-active" src={icon} alt="" loading="lazy"/>
            </div>
        </div>
        }
        if(datacronLevel <= level && expectedBonusId === '') {
            return
        }
        if(datacronLevel <= level && expectedBonusId !== '') {
            let title = expectedBonus.categoryName
            let text = expectedBonus.value
            return <Message size='tiny' negative>
                <Item>
                    <Item.Image size='tiny' content={image("square-image")}/>
                    <Item.Content>
                        <Item.Header>Expected: {title}, Actual: None</Item.Header>
                        <Item.Description><div><div><strong>Expected:</strong> {text}</div><div><strong>Actual:</strong> None</div></div></Item.Description>
                    </Item.Content>
                </Item>
            </Message>
        }
        if(datacronLevel > level && expectedBonusId !== '') {
            let tierDetails = datacron.affix[level]

            let expectedTitle = expectedBonus.categoryName
            let expectedText = expectedBonus.value
            
        
            let bonusId = `${tierDetails.abilityId}:${tierDetails.targetRule}`
            let bonus = datacronDetails.find(elt => elt.key === bonusId)
            let title = bonus.categoryName
            let text = bonus.value
            
            let scope = title === expectedTitle ? tierDetails.scopeIcon : 'square-image'
    
            return <Message size='tiny' positive={passed} negative={!passed}>
                <Item>
                    <Item.Image size='tiny' content={image(scope)}/>
                    <Item.Content>
                        <Item.Header>{title === expectedTitle ? title : <span>Expected: {expectedTitle}; Actual {title}</span>}</Item.Header>
                        <Item.Description>{text === expectedText ? text : <div> <div><strong>Expected:</strong> {expectedText}</div> <div><strong>Actual: </strong>{text}</div></div>}</Item.Description>
                    </Item.Content>
                </Item>
            </Message>
        }
        if(datacronLevel > level && expectedBonusId === '') {
            return bonusCell(level, true)
        }

    }

    const bonusCell = (level, disabled=false) => { // used for levels 2, 5 and 8
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

        return <Item className={disabled ? 'opacitygrayscale' : ''} key={level}>
            
            <Item.Content>
            <Item.Image size='tiny' content={image()}/>
                <Item.Header>{title}</Item.Header>
                <Item.Description disabled={disabled}>{text}</Item.Description>
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
                    <Header as={'h5'} textAlign='center'>
                        Rerolls: {datacron.rerollCount}
                    </Header>
                
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

    const expired = () => {
        let activeSets = datacrons.map(set => set.id)
        return !activeSets.includes(datacron.setId)
    }

    const displayDatacron = () => {
        if(typeof datacron !== 'object' || Object.keys(datacron).length === 0) return
        if(typeof datacrons !== 'object' || datacrons.length === 0) return
        if(datacron.setId === 0) return
        if(expired()) {
            return <div>
                Expired DC from Set {datacron.setId}
            </div>
        }
        if(test && result) {
            return testResults()
        }
        return simple ? overviewCell() : datacronDetails()
    }

    return <div onClick={() => open ? {} : setOpen(modal)}>
        {modal && open ? datacronDetailsModal() : ""}
        {displayDatacron()}
    </div>
}

export default Datacron;