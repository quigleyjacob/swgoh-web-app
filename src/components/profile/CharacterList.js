import React, { useEffect, useState } from 'react';
import { Card, Dropdown, Form, Grid, Input } from 'semantic-ui-react';
import CharCard from '../cards/CharCard';

function CharacterList ({unitData, addToSquad=() => {}, skills, images, filter=true, center=false, categories, killList=null}){

	useEffect(() => {
		// props.redirect('home')
	})

    const [currentCategory, setCurrentCategory] = useState('')
    const [currentSort, setCurrentSort] = useState('')
    const [currentSearch, setCurrentSearch] = useState('')

    const getCategoryOptions = () => {
        return categories
            .filter(category => category.uiFilter.includes(1))
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
                key: 'gear',
                text: "Gear and Relics",
                value: 'gear',
                
            },
            {
                key: 'alpha',
                text: 'Alphabetical',
                value: 'alpha'
            }
        ]
    }

    const sortList = (unitList) => {
        switch(currentSort) {
            case 'gear':
                return unitList.sort((a,b) => {
                    return b.currentTier - a.currentTier || b.relic.currentTier - a.relic.currentTier
                })
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

	return <Grid>
        {
            filter
            ?
            <Grid.Row centered>
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
            </Grid.Row>
        :
        ''
        }
        <Grid.Row centered>
            {
            sortList(unitData)
            .filter(unit => {
                return unit.nameKey.toLocaleLowerCase().includes(currentSearch.toLocaleLowerCase())
            })
            .filter(unit => currentCategory === '' || unit.categoryId.includes(currentCategory))
            // @ts-ignore
            .map((unit, index) => <CharCard disabled={killList && killList[index]} addToSquad={addToSquad} key={unit.baseId} unit={unit} size='normal' skills={skills} image={images[unit.baseId]}/>)
            }
        </Grid.Row>
	</Grid>
}

export default CharacterList;
