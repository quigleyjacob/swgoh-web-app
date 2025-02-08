import React, { useEffect, useState } from 'react';
import { Dropdown, Form, Grid, Input } from 'semantic-ui-react';
import ShipCard from '../cards/ShipCard';
import { stats } from '../../utils/constants.js';

function ShipList ({killList=null, unitData, width=16, onClick=()=>{}, sort=true, categories, filter=true, center=false, simple=false, showLife=false, size='medium', defaultSort = '', nicknames={}}){

	useEffect(() => {

	})

    const [currentCategory, setCurrentCategory] = useState('')
    const [currentSort, setCurrentSort] = useState(defaultSort)
    const [currentSearch, setCurrentSearch] = useState('')

    const getCategoryOptions = () => {
        return categories
            .filter(category => category.uiFilter.includes(2))
            .sort((a,b) => a.descKey.localeCompare(b.descKey))
            .map(category => {
                return {
                    key: category.id,
                    text: category.descKey,
                    value: category.id
                }
            })
    }

    const getSortOptions = () => {
        let options = ["1", "5", "6", "7", "8", "9", "10", "11", "14", "15", "16", "17", "18", "28"]
        return [
            {
                key: 'power',
                text: 'Power',
                value: 'power'
            },
            {
                key: 'alpha',
                text: 'Alphabetical',
                value: 'alpha'
            },
            ...options.map(option => { return {key: option, text: stats[option].name,value: option}})
        ]
    }

    const sortList = (unitList) => {
        switch(currentSort) {
            case 'alpha':
                return unitList.sort((a,b) => a.nameKey.localeCompare(b.nameKey))
            case 'power':
                return unitList.sort((a,b) => (b.gp || 0) - (a.gp || 0))
            case "1":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "10":
            case "11":
            case "14":
            case "15":
            case "16":
            case "17":
            case "18":
            case "28":
                return unitList.sort((a,b) => (b?.stats?.final[currentSort] || 0) - (a?.stats?.final[currentSort] || 0))
            default:
                return unitList
        }
    }

    const handleSortDropdownChange = (e, obj) => {
        let newSort = obj.value
        setCurrentSort(newSort)
    }

    const handleCategoryDropdownChange = (e, obj) => {
        let newCategory = obj.value
        setCurrentCategory(newCategory)
    }

    const handleSearchChange = (e, obj) => {
        let newSearch = obj.value
        setCurrentSearch(newSearch)
    }

    const displayShips = () => {
        try {
            let search, possibleNicknames, possibleBaseIds
            if(filter) {
                search = currentSearch.trim().toLocaleLowerCase()
                possibleNicknames = nicknames.keys.filter(key => key.includes(search))
                possibleBaseIds = possibleNicknames.map(nickname => nicknames.nicknames[nickname])
            }

            return sortList(unitData)
                .filter(unit => {
                    if(filter) {
                        let crewSearch = unit.crew.some(member => member.nameKey.toLocaleLowerCase().includes(search) || possibleBaseIds.includes(member.unitId))
                        return unit.nameKey.toLocaleLowerCase().includes(search) || possibleBaseIds.includes(unit.baseId) || crewSearch
                    }
                    return true
                })
                .filter(unit => {
                    if (unit.categoryId === undefined) {
                        console.log(unit)
                    }
                    return currentCategory === '' || unit.categoryId.includes(currentCategory)
                })
                ?.map((unit, index) => <ShipCard disabled={killList && killList[index]} onClick={onClick} key={unit.baseId} unit={unit} size={size} simple={simple} showLife={showLife}/>)
        } catch(err) {
            console.log(err)
        }
    }

	return <Grid>
        {
        filter
        ?
        <Grid.Row centered>
            <Grid.Column computer={width < 16 ? 16 : 8}>
                <Form>
                    <Form.Group widths={'equal'}>
                        <Form.Field
                            label='Unit Name'
                            placeholder='Unit Name'
                            fluid
                            control={Input}
                            value={currentSearch}
                            onChange={handleSearchChange}
                        />
                        <Form.Field
                            label='Faction'
                            placeholder='Faction'
                            control={Dropdown}
                            fluid
                            selection
                            clearable
                            search
                            value={currentCategory}
                            options={getCategoryOptions()}
                            onChange={handleCategoryDropdownChange}
                        />
                        <Form.Field
                            label='Sort'
                            placeholder='Sort'
                            control={Dropdown}
                            fluid
                            selection
                            clearable
                            search
                            value={currentSort}
                            options={getSortOptions()}
                            onChange={handleSortDropdownChange}
                        />
                    </Form.Group>
                </Form>
            </Grid.Column>
        </Grid.Row>
        :
        ''
        }
        <Grid.Row centered>
            {displayShips()}
        </Grid.Row>
	</Grid>
}

export default ShipList;
