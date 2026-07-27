import React from 'react'
import { List, Popup } from 'semantic-ui-react'

function ShipCard({disabled=false, size, unit, onClick=(baseId) => {}, simple=false, showLife=false}) {

    let rarity = unit?.currentRarity
    let baseId = unit?.baseId
    let level = unit?.currentLevel
    let thumbnail = unit?.thumbnail
    let isAlive = unit?.isAlive === undefined ? true : unit?.isAlive

    let health = unit?.remainingLife?.health
    let protection = unit?.remainingLife?.protection
    let dead = showLife && (health === 0)
    let lifeBarColor = showLife ? (health > 50 ? '' : health > 20 ? 'gac-unit__bar-inner--hp-low' : 'gac-unit__bar-inner--hp-critical') : ''

    const handleClick = () => {
        onClick(baseId)
    }

    const renderShipCard = () => {
        return (
            <List.Item className={!isAlive || disabled || dead ? 'disabled' : ''}>
                <List.Content onClick={handleClick}>
            {/* <div className='collection-ship'> */}
            {
                    showLife
                    ?
                    <div className="gac-unit__bars">
                    <div className="gac-unit__bar gac-unit__bar--prot">
                    <div className="gac-unit__bar-inner gac-unit__bar-inner--prot" style={{width: protection + '%'}}></div>
                    </div>
                    <div className="gac-unit__bar gac-unit__bar--hp">
                    <div className={`gac-unit__bar-inner gac-unit__bar-inner--hp ${lifeBarColor}`} style={{width: health + '%'}}></div>
                    </div>
                    </div>
                    :
                    ''
                }
                <div className={`ship-child ship-portrait ship-portrait--size-${size}`}>
                    <div className={`ship-portrait__image-group`}>
                        <div className={`ship-portrait__image-frame ship-portrait__image-frame--size-${size}`}>
                        <img className={`ship-portrait__img ship-portrait__img--size-${size}`} src={`https://swgoh-images.s3.us-east-2.amazonaws.com/charui/${thumbnail}.png`} alt=""></img></div>
                        {
                        simple
                        ?
                        ""
                        :
                        <div className={`ship-portrait__level ship-portrait__level--size-${size}`}>{level}</div>
                        }

                        {
                        unit.baseId.startsWith("CAPITAL")
                        ?
                        <div className={`ship-portrait__frame ship-portrait__frame--size-${size} ship-portrait__frame-capital ship-portrait__frame-capital--size-${size}`}></div>
                        :
                        <div className={`ship-portrait__frame ship-portrait__frame--size-${size}`}></div>
                        }
                    </div>
                    {
                    simple
                    ?
                    ""
                    :
                    <div className={`ship-portrait__stars`}>
                        <div className={`ship-portrait__star${rarity >= 1 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                        <div className={`ship-portrait__star${rarity >= 2 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                        <div className={`ship-portrait__star${rarity >= 3 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                        <div className={`ship-portrait__star${rarity >= 4 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                        <div className={`ship-portrait__star${rarity >= 5 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                        <div className={`ship-portrait__star${rarity >= 6 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                        <div className={`ship-portrait__star${rarity >= 7 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                    </div>
                    }
                    {
                    simple || showLife
                    ?
                    ""
                    :
                    <div className="collection-ship-name">
                        <List.Header as={'a'}>
                        {unit.nameKey}
                        </List.Header>
                    </div>
                    }

                </div>
            {/* </div> */}
            </List.Content>
            </List.Item>
        )
    }

    return <Popup content={unit.nameKey} trigger={renderShipCard()} position='top center' />
}

export default ShipCard