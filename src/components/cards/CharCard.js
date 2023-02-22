import React from 'react'
import { List } from 'semantic-ui-react'
import './Cards.css'
import './swgoh.css'

function CharCard({addToSquad=(baseId) => {}, unit, size, skills, image, disabled=false}) {

    const getZetas = () => {
        let count = 0
        unit.skill?.forEach(({id, tier}) => {
            let skill = skills[id]
            for(let i = 0; i <= tier; ++i) {
                count += skill.tier[i].isZetaTier && !skill.tier[i].isOmicronTier ? 1 : 0
            }
        })
        return count
    }

    const getOmis = () => {
        let count = 0
        unit.skill?.forEach(({id, tier}) => {
            let skill = skills[id]
            for(let i = 0; i <= tier; ++i) {
                count += skill.tier[i].isOmicronTier ? 1 : 0
            }
        })
        return count
    }

    let baseId = unit.baseId
    let gearLevel = unit?.gear?.level || unit?.currentTier
    let alignment = unit?.forceAlignment
    let relicTier = unit?.relic?.currentTier - 2
    let level = unit?.currentLevel
    let rarity = unit?.currentRarity
    let zetaCount = getZetas()
    let omiCount = getOmis()

    const handleClick = () => {
        addToSquad(baseId)
    }

    return (
        <List.Item as={'a'} className={`${disabled ? 'disabled' : ''}`}>
            <List.Content onClick={handleClick}>
        <div className={`collection-char`}>
        <div className={`child-${size} ${disabled ? '' : ''}`}>
        <div className={`character-portrait character-portrait--size-${size}`}>
            <div className={`character-portrait__primary character-portrait__primary--size-${size}`}>
                {/* IMAGE */}
                <div className={`character-portrait__image-frame character-portrait__image-frame--size-${size}`}>
                    <img className={`character-portrait__img character-portrait__img--size-${size}`} src={`data:image/png;base64, ${image}`} alt=""></img>
                </div>
                {/* RELIC LEVEL */}
                {
                    !gearLevel
                    ?
                    ''
                    :
                    gearLevel === 13
                    ?
                    <div className={`character-portrait__relic character-portrait__relic--size-${size} character-portrait__relic--alignment-${alignment}`}>{relicTier}</div>
                    :
                    <div className={`character-portrait__level character-portrait__level--size-${size}`}>{level}</div>  
                }
                {/* ZETA */}
                {
                    zetaCount > 0
                    ?
                    <div className={`character-portrait__zeta character-portrait__zeta--size-${size}`}>{zetaCount}</div>
                    :
                    ''
                }
                {/* OMICRON */}
                {
                    omiCount > 0
                    ?
                    <div className={`character-portrait__omicron character-portrait__omicron--size-${size}`}>
                        <span className={`character-portrait__omicron-count`}>{omiCount}</span>
                    </div>
                    :
                    ''
                }
                {/* GEAR LEVEL */}
                {   
                    !gearLevel ?
                    ''
                    :
                    gearLevel === 13
                    ?
                    <span onClick={handleClick}>
                        <div className={`character-portrait__rframe character-portrait__rframe--size-${size} character-portrait__rframe--alignment-${alignment}`}></div>
                        <div className={`character-portrait__rframe character-portrait__rframe--right character-portrait__rframe--size-${size} character-portrait__rframe--alignment-${alignment}`}></div>
                    </span>
                    :
                    <div className={`character-portrait__gframe character-portrait__gframe--size-${size} character-portrait__gframe--tier-${gearLevel}`}></div>
                }
                </div>
            {/* STARS */}
            {
                rarity
                ?
                <div className={`character-portrait__footer character-portrait__footer--size-${size}`}>
                    <div className={`character-portrait__stars`}>
                        <div className={`character-portrait__star${rarity >= 1 ? '' : '--inactive'} character-portrait__star--size-${size}`}></div>
                        <div className={`character-portrait__star${rarity >= 2 ? '' : '--inactive'} character-portrait__star--size-${size}`}></div>
                        <div className={`character-portrait__star${rarity >= 3 ? '' : '--inactive'} character-portrait__star--size-${size}`}></div>
                        <div className={`character-portrait__star${rarity >= 4 ? '' : '--inactive'} character-portrait__star--size-${size}`}></div>
                        <div className={`character-portrait__star${rarity >= 5 ? '' : '--inactive'} character-portrait__star--size-${size}`}></div>
                        <div className={`character-portrait__star${rarity >= 6 ? '' : '--inactive'} character-portrait__star--size-${size}`}></div>
                        <div className={`character-portrait__star${rarity >= 7 ? '' : '--inactive'} character-portrait__star--size-${size}`}></div>
                    </div>
                </div>
                :
                ''
            }
            <div className=' collection-char-name'><List.Header as={'a'} >{unit.nameKey}</List.Header></div>
        </div>
        </div>
        </div>
        </List.Content>
        </List.Item>
    )
}

export default CharCard