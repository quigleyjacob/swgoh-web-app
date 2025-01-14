import React from 'react'
import './Cards.css'

function ModSlicingMatCard({url, rarity}) {

    return (
        <div className={`stat-mod-slicing-mat-icon stat-mod-slicing-mat-icon--rarity-${rarity}`}>
        <div className='stat-mod-slicing-mat-icon__bg'></div>
        <div className="stat-mod-slicing-mat-icon__inner">
            <img className="stat-mod-slicing-mat-icon__img" src={url} alt=""/>
        </div>
        <div className="stat-mod-slicing-mat-icon__overlay"></div>
        </div>
    )
}

export default ModSlicingMatCard