// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Card, Header } from 'semantic-ui-react';
import CharCard from '../cards/CharCard.js'

function Characters ({redirect, account, units, skills, images}){

    const [unitData, setUnitData] = useState([])

    const buildUnitData = useCallback(() => {
        // eslint-disable-next-line
        let unitsMap = units.filter(unit => unit.combatType === 1).reduce((map, obj) => (map[obj.baseId] = obj, map), {})
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
        setUnitData(playerUnits)
    }, [account.rosterUnit, units])

	useEffect(() => {
		redirect('characters')
        buildUnitData()
	}, [redirect, buildUnitData])



	return <div>
		<Header size='huge' textAlign='center'>{`${account.name}'s Characters`}</Header>

        <Card.Group>
            {unitData.sort((a,b) => a.nameKey.localeCompare(b.nameKey)).map(unit => <CharCard key={unit.baseId} unit={unit} size='normal' skills={skills} image={images[unit.baseId]}/>)}
        </Card.Group>
	</div>
}

export default Characters;