import React, { useEffect, useState } from 'react';
import { Card, Dropdown, Form, Grid, Input } from 'semantic-ui-react';
import ShipCard from '../cards/ShipCard';

function ShipList ({killList=null, unitData, addToSquad=()=>{}, images, sort=true, categories, filter=true, center=false}){

	useEffect(() => {

	})

    const [currentCategory, setCurrentCategory] = useState('')
    const [currentSort, setCurrentSort] = useState('')
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
        return [
            {
                key: 'alpha',
                text: 'Alphabetical',
                value: 'alpha'
            }
        ]
    }

    const sortList = (unitList) => {
        switch(currentSort) {
            case 'alpha':
                return unitList.sort((a,b) => a.nameKey.localeCompare(b.nameKey))
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

	return <div>
        {
        filter
        ?
        <Grid>
            <Grid.Column width={4}></Grid.Column>
            <Grid.Column width={8}>
            <Form>
                <Form.Group widths={'equal'}>
                    <Form.Field>
                        <label>Unit Name</label>
                        <Input placeholder='unit name' onChange={handleSearchChange}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Categories</label>
                        <Dropdown selection clearable search options={getCategoryOptions()} onChange={handleCategoryDropdownChange}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Sort</label>
                        <Dropdown selection clearable search options={getSortOptions()} onChange={handleSortDropdownChange}/>
                    </Form.Field>
                </Form.Group>
            </Form>
            </Grid.Column>
            <Grid.Column width={4}></Grid.Column>
        </Grid>
        :
        ''
        }
        <Card.Group centered={center} style={{minHeight: '150px'}}>
            {sortList(unitData)
            .filter(unit => {
                return unit.nameKey.toLocaleLowerCase().includes(currentSearch.toLocaleLowerCase())
            })
            .filter(unit => currentCategory === '' || unit.categoryId.includes(currentCategory))
            // @ts-ignore
            ?.map((unit, index) => <ShipCard disabled={killList && killList[index]} addToSquad={addToSquad} key={unit.baseId} unit={unit} size='medium' image={images[unit.baseId]}/>)}
        </Card.Group>
	</div>
}

export default ShipList;
