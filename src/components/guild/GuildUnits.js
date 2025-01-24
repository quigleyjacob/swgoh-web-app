import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Grid, Header, Dropdown } from "semantic-ui-react"
import SortableTable from "../displays/SortableTable"
import { stats } from '../../utils/constants'

function GuildUnits({guild, units}) {

    const [selectedUnit, setSelectedUnit] = useState('')
    const [selectedStat, setSelectedStat] = useState('')

        useEffect(() => {
            // eslint-disable-next-line
            // setUnitsMap(units.reduce((map, obj) => (map[obj.baseId] = obj, map), {}))
        }, [units])

    const getUnitDropdownOptions = () => {
        return units.map(unit => {
            return {
                key: unit.baseId,
                value: unit.baseId,
                text: unit.nameKey,
                image: {avatar: true, src: `https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${unit.thumbnailName}.png`}
            }
        })
        .sort((a,b) => {
            return a.text.localeCompare(b.text)
        })
    }

    const getStatsDropdownOptions = () => {
        let options = ["1", "5", "6", "7", "8", "9", "10", "11", "14", "15", "16", "17", "18", "28"]
        return options.map(option => { return {key: option, text: stats[option].name,value: option}})
    }

    const getColumns = () => {
        return [
            {text: "Name", key: 'name'},
            {text: 'Power', key: 'power'},
            {text: "Gear", key: 'currentTier'},
            {text: "Relic", key: 'relic'},
            {text: "Zetas", key: 'zetaCount'},
            {text: "Omicrons", key: 'omicronCount'},
            {text: stats[selectedStat]?.name || '', key: 'selectedStat'}
        ]
    }

    const getRows = () => {
        if(guild.roster === undefined || guild.roster.length === 0) {
            return []
        }
        return (guild?.roster || []).map(member => {
            let unit = member.rosterMap[selectedUnit]
            if(unit) {
                return {
                    ...unit,
                    name: member.name,
                    allyCode: member.allyCode,
                    relic: unit?.relic?.currentTier - 2 || -1,
                    power: unit.stats.gp || 0,
                    selectedStat: unit?.stats?.final?.[selectedStat] || 0
                }
            } else {
                return {
                    name: member.name,
                    allyCode: member.allyCode,
                    currentTier: 0,
                    relic: 0,
                    power: 0,
                    omicronCount: 0,
                    zetaCount: 0,
                    selectedStat: 0
                }
            }
        })
    }

    const getCellRenders = () => {
        return {
            "name": ({name, allyCode}) => {
                return <Header size='tiny' as={Link} color='blue' to={`/profile/${allyCode}`}>{name}</Header>
            },
            'relic': ({relic}) => {
                if(relic === 0) {
                    return '--'
                }
                return relic
            },
            'zetaCount': ({zetaCount}) => {
                if(zetaCount === 0) {
                    return '--'
                }
                return zetaCount
            },
            'omicronCount': ({omicronCount}) => {
                if(omicronCount === 0) {
                    return '--'
                }
                return omicronCount
            },
            'currentTier': ({currentTier}) => {
                if(currentTier === 0) {
                    return '--'
                }
                return currentTier
            },
            'power': ({power}) => {
                if(power === 0) {
                    return '--'
                }
                return power.toLocaleString('en-US')
            },
            'selectedStat': ({selectedStat}) => {
                if(selectedStat === 0) {
                    return '--'
                }
                return selectedStat.toLocaleString('en-US')
            }
        }
    }

    return <Grid centered>
        <Grid.Row>
            <Header size='huge' textAlign='center'>
                {guild?.profile?.name} Units
            </Header>
        </Grid.Row>
        <Grid.Row columns={4}>
            <Grid.Column>
                <Dropdown
                    label="Unit Name"
                    placeholder="Unit Name"
                    selection
                    clearable
                    search
                    fluid
                    value={selectedUnit}
                    options={getUnitDropdownOptions()}
                    onChange={(_, obj) => setSelectedUnit(obj.value)}
                    disabled={guild.roster === undefined || guild.roster.length === 0}
                />
            </Grid.Column>
            <Grid.Column>
                <Dropdown
                    label="Stat"
                    placeholder="Stat"
                    selection
                    clearable
                    search
                    fluid
                    value={selectedStat}
                    options={getStatsDropdownOptions()}
                    onChange={(_, obj) => setSelectedStat(obj.value)}
                    disabled={guild.roster === undefined || guild.roster.length === 0}
                />
            </Grid.Column>

        </Grid.Row>
        <Grid.Row>
            <SortableTable fixed sortable meta={getColumns()} row={getRows()} render={getCellRenders()} defaultSort={{column: 'name', direction: 'ascending'}} />
        </Grid.Row>

    </Grid>
}

export default GuildUnits