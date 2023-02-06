// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'semantic-ui-react';
import CharacterList from './CharacterList.js';

function Characters ({redirect, account, units, skills, images, addToSquad=() => {}, categories}){

    const [unitData, setUnitData] = useState([])

    const buildUnitData = useCallback(() => {
        // eslint-disable-next-line
        let unitsMap = units.filter(unit => unit.combatType === 1).reduce((map, obj) => (map[obj.baseId] = obj, map), {})
        let playerUnits = account?.rosterUnit?.map(unit => {
            let unitBaseId = unit.definitionId.split(':')[0]
            let unitData = unitsMap[unitBaseId]
            if(unitData) {
                unit.baseId = unitData.baseId
                unit.combatType = unitData.combatType
                unit.forceAlignment = unitData.forceAlignment
                unit.nameKey = unitData.nameKey
                unit.categoryId = unitData.categoryId
                return unit
            }
            return null
        }).filter(unit => unit !== null)
        setUnitData(playerUnits)
    }, [account, units])

	useEffect(() => {
		redirect('characters')
        buildUnitData()
	}, [redirect, buildUnitData])

	return <div>
		<Header size='huge' textAlign='center'>{`${account?.name}'s Characters`}</Header>

        <CharacterList unitData={unitData} addToSquad={addToSquad} skills={skills} images={images} categories={categories}/>
	</div>
}

export default Characters;