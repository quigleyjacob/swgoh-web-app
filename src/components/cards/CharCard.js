import React from 'react'
import './Cards.css'
import './swgoh.css'

function CharCard({id='', onClick=(baseId) => {}, unit, size, disabled=false, simple=false, requirement=false, showLife=false}) {

    const requiredRelic = {
        "Bonus": [0, 9, 10],
        "LS": [0, 7, 8, 9, 10, 11, 11],
        "Mix": [0, 7, 8, 9, 10, 11, 11],
        "DS": [0, 7, 8, 9, 10, 11, 11]
    }

    // unit details
    let baseId = unit.baseId
    let gearLevel = unit?.gear?.level || unit?.currentTier
    let alignment = unit?.forceAlignment
    let relicTier = unit?.relic?.currentTier - 2
    let rarity = unit?.currentRarity
    let zetaCount = unit?.zetaCount
    let omiCount = unit?.omicronCount
    let thumbnail = unit?.thumbnail
    let combatType = unit?.combatType
    let isAlive = unit?.isAlive === undefined ? true : unit?.isAlive

    // gac review unit details
    let health = unit?.remainingLife?.health
    let protection = unit?.remainingLife?.protection
    let dead = showLife && (health === 0)
    let lifeBarColor = showLife ? (health > 50 ? '' : health > 20 ? 'gac-unit__bar-inner--hp-low' : 'gac-unit__bar-inner--hp-critical') : ''

    const hasUltimate = () => unit?.purchasedAbilityId?.length > 0

    const unitIsAtRelic = () => gearLevel === 13

    const getAlignment = () => {
        switch(alignment) {
            case 1:
                return "neutral"
            case 2:
                return "light"
            case 3:
                return "dark"
            default:
                return ''
        }
    }

    let isChar = () => combatType === 1

    let getGearType = () => {
        if(hasUltimate()) {
            return "ult"
        }
        return getAlignment()
    }

    const handleClick = () => {
        if(baseId) {
            onClick(baseId)
            return
        }
        if(unit.tb) {
            let platoonId = `${unit.alignment}:${unit.phase}:${unit.operation}:${unit.row}:${unit.slot}`
            onClick(platoonId)
            return
        }

        onClick(baseId)
    }

    const displayZetas =() => {
        if(zetaCount === 0) {
            return ''
        }
        return <div className={`zeta zeta-${size}`}>{zetaCount}</div>
    }

    const displayOmis = () => {
        if(omiCount === 0) {
            return ''
        }
        return <div className={`omicron omicron-${size}`}>{omiCount}</div>
    }

    const displayGear = () => {
        if(!isChar()) return ''
        if(unitIsAtRelic()) {
            return <div className={`gear gear-${getGearType()} gear-${size}`}>{relicTier}</div>
        }
        return <div className={`low-gear low-gear-${getGearType()} low-gear-${size}`}>G{gearLevel}</div>
    }

    const displayRequirementGear = () => {
        if(isChar()) {
            return <div className={`gear-req`}>{requiredRelic[unit.alignment][unit.phase]-2}</div>
        }
    }

    const displayStars = () => {
        if(rarity === 7) {
            return ''
        }
        return <div className={`star`}>{rarity}</div>
    }

    const displayName = () => {
        return <span className={`caption`}>{unit.nameKey}</span>
    }

    const displayDetails = () => {
        if(simple) return ''
        if(unit.requirement || requirement) return displayRequirementGear()
        return <span>
            {displayZetas()}
            {displayOmis()}
            {displayGear()}
            {displayStars()}
            {displayName()}
        </span>
    }

    const isDisabled = () => {
        if(!isAlive || disabled || dead) {
            return 'disabled'
        }
    }

    const displayHealth = () => {
        if(showLife) {
            return <div className="gac-unit__bars">
                <div className="gac-unit__bar gac-unit__bar--prot">
                    <div className="gac-unit__bar-inner gac-unit__bar-inner--prot" style={{width: protection + '%'}}></div>
                </div>
                <div className="gac-unit__bar gac-unit__bar--hp">
                    <div className={`gac-unit__bar-inner gac-unit__bar-inner--hp ${lifeBarColor}`} style={{width: health + '%'}}></div>
                </div>
            </div>
        }
    }

    return (
        <div className={`toon ${isDisabled()}`} id={id} onClick={handleClick}>
            {id}
            <div className={`toon-menu toon-menu-${size}`}>
                {displayHealth()}
                <img className={`toon-portrait toon-portrait-${size} border-${getAlignment()}`} src={`https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${thumbnail}.png`} alt={unit.nameKey}/>
                {displayDetails()}
            </div>
        </div>
    )
}

export default CharCard