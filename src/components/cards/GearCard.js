import React from 'react'
import './Cards.css'

function GearCard({url, mark, tier}) {

    return (
        <div className={`equipment-icon equipment-icon-gear-tier-${tier}`}>
        <div className="equipment-icon__overlay"></div>
        <div className="equipment-icon__inner">
            <img className="equipment-icon__img" src={url} alt=""/>
            <div className="equipment-icon__mark">
                {mark}
            </div>
        </div>
        </div>        
    )
}

export default GearCard