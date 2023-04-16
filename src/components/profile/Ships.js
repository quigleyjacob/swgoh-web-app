// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'semantic-ui-react';
import ShipList from './ShipList.js';
import { getShipData } from '../../utils/index.js';

function Ships ({redirect, account, units, images, categories}){

    const [shipData, setShipData] = useState([])

    const buildUnitData = useCallback(() => {
        setShipData(getShipData(account.rosterUnit, units))
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