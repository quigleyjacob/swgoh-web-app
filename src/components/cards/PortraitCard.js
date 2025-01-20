import React from 'react'
import './Cards.css'

function PortraitCard({icon, league}) {
    return (
        <div className='profile-portrait'>
            <div className='profile-portrait-inner'>
                <img className='profile-portrait-image' src={`https://game-assets.swgoh.gg/textures/${icon}.png`} alt={icon}/>
            </div>
            
            <div className={`profile-portrait-league profile-portrait-league-${league.toLowerCase()}`}></div>
            
        </div>
       
    )
}

export default PortraitCard