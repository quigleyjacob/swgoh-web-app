// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'semantic-ui-react';
import ShipList from './ShipList.js';

function Ships ({redirect, account, units, images, addToSquad=(baseId) => {}, categories}){

    const [shipData, setShipData] = useState([])

    const buildUnitData = useCallback(() => {
        // eslint-disable-next-line
        let unitsMap = units.filter(unit => unit.combatType === 2).reduce((map, obj) => (map[obj.baseId] = obj, map), {})
        let playerUnits = account.rosterUnit.map(unit => {
            let unitBaseId = unit.definitionId.split(':')[0]
            let unitData = unitsMap[unitBaseId]
            if(unitData) {
                unit.baseId = unitData.baseId
                unit.combatType = unitData.combatType
                unit.forceAlignment = unitData.forceAlignment
                unit.nameKey = unitData.nameKey
                return unit
            }
            return null
        }).filter(unit => unit !== null)
        setShipData(playerUnits)
    }, [account.rosterUnit, units])

	useEffect(() => {
		redirect('ships')
        buildUnitData()
	}, [redirect, buildUnitData])

	return <div>
		<Header size='huge' textAlign='center'>{`${account.name}'s Ships`}</Header>

        <ShipList unitData={shipData} images={images} categories={categories}/>
	</div>
}

export default Ships;