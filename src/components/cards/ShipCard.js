import React from 'react'
import { List } from 'semantic-ui-react'

function ShipCard({disabled=false, size, unit, image, addToSquad=(baseId) => {}}) {

    let rarity = unit.currentRarity
    let baseId = unit.baseId
    const handleClick = () => {
        addToSquad(baseId)
    }

    return (
        <List.Item as={'a'} className={disabled ? 'red-border' : ''}>
            <List.Content onClick={handleClick}>
        <div className='collection-ship'>
            <div className={`ship-child ship-portrait ship-portrait--size-${size}`}>
                <div className={`ship-portrait__image-group`}>
                    <div className={`ship-portrait__image-frame ship-portrait__image-frame--size-${size}`}>
                    <img className={`ship-portrait__img ship-portrait__img--size-${size}`} src={`data:image/png;base64, ${image}`} alt=""></img></div>
                    <div className={`ship-portrait__level ship-portrait__level--size-${size}`}>85</div>
                    {
                    unit.baseId.startsWith("CAPITAL")
                    ?
                    <div className={`ship-portrait__frame ship-portrait__frame--size-${size} ship-portrait__frame-capital ship-portrait__frame-capital--size-${size}`}></div>
                    :
                    <div className={`ship-portrait__frame ship-portrait__frame--size-${size}`}></div>
                    }
                </div>
                <div className={`ship-portrait__stars`}>
                    <div className={`ship-portrait__star${rarity >= 1 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                    <div className={`ship-portrait__star${rarity >= 2 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                    <div className={`ship-portrait__star${rarity >= 3 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                    <div className={`ship-portrait__star${rarity >= 4 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                    <div className={`ship-portrait__star${rarity >= 5 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                    <div className={`ship-portrait__star${rarity >= 6 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                    <div className={`ship-portrait__star${rarity >= 7 ? '' : '--inactive'} ship-portrait__star--size-${size}`}></div>
                </div>
                <div className="collection-ship-name">
                    <List.Header as={'a'}>
                    {unit.nameKey}
                    </List.Header>
                </div>
            </div>
        </div>
        </List.Content>
        </List.Item>
    )
}

export default ShipCard