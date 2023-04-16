// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'semantic-ui-react';
import CharacterList from './CharacterList.js';
import { getCharacterData } from '../../utils/index.js';

function Characters ({redirect, account, units, skills, images, categories}){

    const [unitData, setUnitData] = useState([])

    const buildUnitData = useCallback(() => {
        setUnitData(getCharacterData(account.rosterUnit, units))
    }, [account, units])

	useEffect(() => {
		redirect('characters')
        buildUnitData()
	}, [redirect, buildUnitData])

	return <div>
		<Header size='huge' textAlign='center'>{`${account?.name}'s Characters`}</Header>

        <CharacterList unitData={unitData} skills={skills} images={images} categories={categories}/>
	</div>
}

export default Characters;