// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Header, Modal, Button, Table, Grid } from 'semantic-ui-react';
import CharacterList from './CharacterList.js';
import { getCharacterData } from '../../utils/index.js';
import { stats } from '../../utils/constants.js';

function Characters ({redirect, account, units, categories, nicknames}){

    const [unitData, setUnitData] = useState([])
    const [open, setOpen] = useState(false)
    const [openUnit, setOpenUnit] = useState('')

    const buildUnitData = useCallback(() => {
        setUnitData(getCharacterData(account.rosterUnit, units))
    }, [account, units])

	useEffect(() => {
		redirect('characters')
        buildUnitData()
	}, [redirect, buildUnitData])

    const showUnitStats = (baseId) => {
        setOpen(true)
        let unit = account.rosterUnit.filter(unit => unit.baseId === baseId)[0]
        setOpenUnit(unit)
    }
    
    const formatStat = (stat, final, mods) => {
        let isPercent = ["16", "17", "18", "8", "9", "14", "15"].includes(stat)
        let finalDisplay = isPercent ? `${(final*100).toFixed(2)*1}%` : final
        let modsDisplay = isPercent ? `${(mods*100).toFixed(2)*1}%` : mods
        
        return <Table.Cell><strong>{finalDisplay}</strong> {mods > 0 ? `(${modsDisplay})` : ''}</Table.Cell>
    }

    const displayStats = () => {
        if (!open) return
        if (openUnit.stats === undefined || Object.keys(openUnit.stats).length === 0) return
        let visibleStats = ["1", "28", "5", "16", "17", "18", "6", "14","10", "8", "7", "15","11", "9"]
        let additive = {
            "14": "21",
            "15": "22"
        }
        return <Table striped celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Stat</Table.HeaderCell>
                    <Table.HeaderCell>Value (from Mods)</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    visibleStats.map(stat => {
                        let name = stats[stat].name
                        let final = (openUnit.stats.final[stat] || 0)
                        let mods = (openUnit.stats.mods[stat] || openUnit.stats.mods[additive[stat]] || 0)
                        return <Table.Row key={stat}>
                            <Table.Cell>{name}</Table.Cell>
                            {formatStat(stat, final, mods)}
                        </Table.Row>
                    })
                }
            </Table.Body>
        </Table>
    }

	return <div>
		<Header size='huge' textAlign='center'>{`${account?.name}'s Characters`}</Header>

        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
        >
            <Modal.Header>{openUnit.nameKey}</Modal.Header>
            <Grid columns={2}>
                <Grid.Column width={8}>
                <Grid centered>
                    <Grid.Row>
                    <CharacterList unitData={[openUnit]} size='normal' categories={categories} filter={false}/>
                    </Grid.Row>
                    <Grid.Row centered>
                        <strong>Power: {openUnit.gp}</strong>
                    </Grid.Row>
                    </Grid>
                </Grid.Column>
                <Grid.Column width={8}>
                    {displayStats()}
                </Grid.Column>
            </Grid>
            <Modal.Actions>
                <Button 
                    content='Close'
                    onClick={() => setOpen(false)}
                />
            </Modal.Actions>
        </Modal>

        <CharacterList unitData={unitData} onClick={showUnitStats} categories={categories} defaultSort='power' nicknames={nicknames}/>
	</div>
}

export default Characters;