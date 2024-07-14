import { Card } from "semantic-ui-react"

const getImage = (baseIdToThumbnail, units) => {
    if(units.length === 0) {
        return '/plus-sign.png'
    }
    let baseId = units[0]
    let thumbnail = baseIdToThumbnail[baseId]
    if(thumbnail) {
        return `https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${thumbnail}.png`
    } else {
        return '/plus-sign.png'
    }
}

export function getSquadsPerZone(zoneLengths) {
    // let zoneLengths = activeGac.squadsPerZone
    return {
        top: new Array(zoneLengths.top).fill([]),
        bottom: new Array(zoneLengths.bottom).fill([]),
        back: new Array(zoneLengths.back).fill([]),
        fleet: new Array(zoneLengths.fleet).fill([])
    }
}

export function setZone(owner, accountMap, zone, teamDisabled=()=>false, setActiveTeam=()=>{}, baseIdToThumbnail={}, activeGac=null, active='') {
    return <Card.Group centered>
        {
            accountMap[zone].map((units, squad) => {
                let id = `${owner}:${zone}:${squad}`
                let attackTeam = activeGac?.planMap[zone][squad]
                return <div key={id} className='squadContainer'>
                    <span key={id} className='squad'>
                   
                    <img id={id} src={getImage(baseIdToThumbnail, units)} className={`circular squadImage ${active === id ? 'activeTeam' : ''} ${teamDisabled(owner, zone, squad) ? 'disabled': ''}`} onClick={setActiveTeam} alt={`Defense Team ${units[0]}`}/>
                    {
                        owner === 'opponent' && attackTeam.length > 0
                        ?
                        <img className='attackingTeam' src={getImage(baseIdToThumbnail, attackTeam)} alt={`Attacking Team: ${attackTeam[0]}`}/>
                        :
                        ''
                    }
                    </span>
                    </div>
            })
        }
        </Card.Group>
}