// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import './Datacrons.css'
import { stats } from '../../utils/constants.js'
import { Table, Form, Grid, Input, Header } from 'semantic-ui-react';
import { useDebounce } from 'use-debounce'

function Datacrons ({redirect, datacrons, account, session, displayMessage, datacronNames, setDatacronNames}){

    const WAIT_INTERVAL = 1000

    const [deBounceDataconNames] = useDebounce(datacronNames, WAIT_INTERVAL)

    const [datacronImageMap, setDatacronImageMap] = useState({})
    const [targetRuleToCategory, setTargetRuleToCategory] = useState({})

    const [alignmentBonusMap, setAlignmentBonusMap] = useState({})
    const [factionBonusMap, setFactionBonusMap] = useState({})
    const [characterBonusMap, setCharacterBonusMap] = useState({})

    const [alignmentDropdownOptions, setAlignmentDropdownOptions] = useState([])
    const [alignmentBonusDropdownOptions, setAlignmentBonusDropdownOptions] = useState([])
    const [factionDropdownOptions, setFactionDropdownOptions] = useState([])
    const [factionBonusDropdownOptions, setFactionBonusDropdownOptions] = useState([])
    const [characterDropdownOptions, setCharacterDropdownOptions] = useState([])
    const [characterBonusDropdownOptions, setCharacterBonusDropdownOptions] = useState([])
    const [statDropdownOptions, setStatDropdownOptions] = useState([])

    const [datacronSet, setDatacronSet] = useState('')
    const [alignment, setAlignment] = useState('')
    const [alignmentBonus, setAlignmentBonus] = useState('')
    const [faction, setFaction] = useState('')
    const [factionBonus, setFactionBonus] = useState('')
    const [character, setCharacter] = useState('')
    const [characterBonus, setCharacterBonus] = useState('')
    const [statFilterList, setStatFilterList] = useState([])
    const [statSort, setStatSort] = useState('')
    const [nameFilter, setNameFilter] = useState('')
    
    const reset = () => {
        setDatacronSet('')
        setAlignment('')
        setAlignmentBonus('')
        setFaction('')
        setFactionBonus('')
        setCharacter('')
        setCharacterBonus('')
        setStatFilterList([])
        setStatSort('')
    }

    const handleDatacronSetDropdownChange = (e, obj) => {
        setDatacronSet(obj.value)
    }
    const handleAlignmentDropdownChange = (e, obj) => {
        setAlignment(obj.value)
    }
    const handleAlignmentBonusDropdownChange = (e, obj) => {
        setAlignmentBonus(obj.value)
    }
    const handleFactionDropdownChange = (e, obj) => {
        setFaction(obj.value)
    }
    const handleFactionBonusDropdownChange = (e, obj) => {
        setFactionBonus(obj.value)
    }
    const handleCharacterDropdownChange = (e, obj) => {
        setCharacter(obj.value)
    }
    const handleCharacterBonusDropdownChange = (e, obj) => {
        setCharacterBonus(obj.value)
    }
    const handleStatFilterDropdownChange = (e, obj) => {
        setStatFilterList(obj.value)
    }
    const handleStatSortDropdownChange = (e, obj) => {
        setStatSort(obj.value)
    }
    const handleDatacronNameChange = (e, obj) => {
        let newDatacronNames = JSON.parse(JSON.stringify(datacronNames))
        newDatacronNames.datacronNames[obj.id] = obj.value
        setDatacronNames(newDatacronNames)
    }
    const handleNameFilterChange = (e, obj) => {
        setNameFilter(obj.value)
    }

    const updateDatacronNames = useCallback(async (obj, displaySuccess = true) => {
        if(session && Object.keys(obj).length > 0) {
            let body = {
                session: session,
                body: obj
            }
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player/datacron/update`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
            })
            if(response.ok) {
                if(displaySuccess) {
                    displayMessage('Datacron Names updated.', true)
                }
            } else {
            displayMessage('Unable to update datacron names.', false)
            }
        }
    }, [session, displayMessage])

    useEffect(() => {
        updateDatacronNames(deBounceDataconNames, false)
        // eslint-disable-next-line
    }, [deBounceDataconNames])

    const prepareDropdown = (list) => {
        return list
        .sort((a,b) => {
            if(typeof a.id === 'number') {
                return a.id - b.id
            }
            return a.name?.localeCompare(b.name)
        })
        .map(elt => {
            let image = datacronImageMap[elt.id] ? { avatar: true, src: `${datacronImageMap[elt.id]}.png`} : undefined
            return {
                key: elt.id,
                value: elt.id,
                text: elt.name,
                image: image
            }
        })

    }

    const populateMap = (map, bonuses) => {
        bonuses.forEach(arr => {
            arr.forEach(bonus => {
                let key = bonus.targetRule
                if(map[key]) {
                    map[key].setId.add(bonus.setId)
                    map[key].tag[bonus.setId] = bonus.tag
                } else {
                    map[key] = {
                        id: key,
                        setId: new Set([bonus.setId]),
                        name: bonus.categoryName,
                        tag: {}
                    }
                    map[key].tag[bonus.setId] = bonus.tag
                }
            })
        })
    }

    const populateBonusMap = (map, bonuses) => {
        bonuses.forEach(arr => {
            arr.forEach(bonus => {
                let key = bonus.key
                if(map[key]) {
                    map[key].setId.add(bonus.setId)
                    map[key].tag[bonus.setId] = bonus.tag
                } else {
                    map[key] = {
                        id: key,
                        setId: new Set([bonus.setId]),
                        name: bonus.value,
                        tag: {}
                    }
                    map[key].tag[bonus.setId] = bonus.tag
                }
            })
        })
    }

    const filter = (options, level) => {
        let filteredList = options
        switch(level) {
            case 'character':
                filteredList = filteredList.filter(elt => {
                    let characterTag = characterDropdownOptions.filter(op => op.id === character)
                    if(characterTag.length === 0) return true
                    return elt.id.includes(characterTag[0].id)
                })
            // eslint-disable-next-line
            case 'faction':
                filteredList = filteredList.filter(elt => {
                    let factionTag = factionDropdownOptions.filter(op => op.id === faction)
                    if(factionTag.length === 0) return true
                    return Object.values(factionTag[0].tag).some(tag => Object.values(elt.tag).some(optionTag => subset(tag, optionTag)))
                })
            // eslint-disable-next-line
            case 'alignment':
                filteredList = filteredList.filter(elt => {
                    let alignmentTag =  alignmentDropdownOptions.filter(op => op.id === alignment)
                    if (alignmentTag.length === 0) return true
                    return Object.values(alignmentTag[0].tag).some(tag => Object.values(elt.tag).some(optionTag => subset(tag, optionTag)))
                })
            // eslint-disable-next-line
            case 'set':
                filteredList = filteredList.filter(elt => datacronSet === '' || elt.setId.has(datacronSet))
                break
            default:
                filteredList = []
        }
        return filteredList
    }

    const subset = (a,b) => {
        let first = [...a]
        let second = [...b]
        return first.every(elt => second.includes(elt))
    }

    const parseDatacronData = useCallback(() => {
        if(datacrons === undefined || Object.keys(datacrons).length === 0) return
        let alignmentMap = {}
        let factionMap = {}
        let characterMap = {}

        let alignmentBonusMap = {}
        let factionBonusMap = {}
        let characterBonusMap = {}

        let statMap = {}
        let targetMap = {}

        // eslint-disable-next-line
        setDatacronImageMap(datacrons.reduce((map, obj) => (map[obj.id] = obj.icon, map), {}))

        datacrons.forEach(datacron => {
            let setId = datacron.id
            let tiers = datacron.tier
            tiers.forEach(tier => {
                if(tier.stats === undefined) return
                tier.stats.forEach(statList => {
                    statList.forEach(stat => {
                        let statType = String(stat.statType)
                        if(statMap[statType]) {
                            statMap[statType].setId.add(setId)
                        } else {
                            statMap[statType] = {
                                id: statType,
                                name: stats[statType].name,
                                setId: new Set([setId])
                            }
                        }
                    })
                })
            })

            tiers.forEach(tier => {
                if(tier.bonuses === undefined) return
                tier.bonuses.forEach(bonusGroup => {
                    bonusGroup.forEach(bonus => {
                        targetMap[bonus.targetRule] = bonus.categoryName
                    })                    
                })
            })

            populateMap(alignmentMap, tiers[2].bonuses)
            populateBonusMap(alignmentBonusMap, tiers[2].bonuses)
            populateMap(factionMap, tiers[5].bonuses)
            populateBonusMap(factionBonusMap, tiers[5].bonuses)
            populateMap(characterMap, tiers[8].bonuses)
            populateBonusMap(characterBonusMap, tiers[8].bonuses)
        })

        setStatDropdownOptions(Object.values(statMap))

        setTargetRuleToCategory(targetMap)

        setAlignmentBonusMap(alignmentBonusMap)
        setFactionBonusMap(factionBonusMap)
        setCharacterBonusMap(characterBonusMap)

        setAlignmentDropdownOptions(Object.values(alignmentMap))
        setAlignmentBonusDropdownOptions(Object.values(alignmentBonusMap))
        setFactionDropdownOptions(Object.values(factionMap))
        setFactionBonusDropdownOptions(Object.values(factionBonusMap))
        setCharacterDropdownOptions(Object.values(characterMap))
        setCharacterBonusDropdownOptions(Object.values(characterBonusMap))
    }, [datacrons])

	useEffect(() => {
        redirect('datacrons')
        parseDatacronData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parseDatacronData])

    const getStats = (datacron) => {
        let statMap = {}
        datacron.affix.forEach(affix => {
            let statType = String(affix.statType)
            if(statType === '0') return
            if(statMap[statType]) {
                statMap[statType] += Number(affix.statValue)
            } else {
                statMap[statType] = Number(affix.statValue)
            }
        })
        return statMap
    }

    const overviewCell = (tier, image, suffix, level, reroll) => {
        return <div className="datacron-card__icon">
                <div className="datacron-icon datacron-icon--size-lg">
                <div className="datacron-icon__icon datacron-icon__icon--size-lg">
                    <div className={`datacron-icon__bg datacron-icon__bg--tier-${tier}`}></div>
                    <div className="datacron-icon__box">
                        <img className="datacron-icon__box-img" src={`${image}${suffix}.png`} alt="" loading="lazy"/>
                    </div>
                    <div className="datacron-icon__primaries datacron-icon__primaries--size-lg">
                        <div className={`datacron-icon__primary datacron-icon__primary--size-lg datacron-icon__primary--first datacron-icon__primary${tier > 0 ? '--is-active' : ''}`}></div>
                        <div className={`datacron-icon__primary datacron-icon__primary--size-lg datacron-icon__primary--second datacron-icon__primary${tier > 1 ? '--is-active' : ''}`}></div>
                        <div className={`datacron-icon__primary datacron-icon__primary--size-lg datacron-icon__primary--third datacron-icon__primary${tier > 2 ? '--is-active' : ''}`}></div>
                    </div>
                </div>
                <div className="datacron-icon__level">
                    Level {level}
                </div>
                <div className="datacron-icon__level">
                    Rerolls: {reroll}
                </div>
                </div>
            </div>
    }

    const statCell = (statsArray) => {
        return statsArray.map(({statName, statValue}, index) => {
            return <div className="datacron-card__stat" key={index}>
                    <span className="datacron-card__stat-value">{statValue}%</span>
                    <span className="datacron-card__stat-label">{statName}</span>
                </div>
        })
    }

    const bonusCell = (icon, title, text) => {
        return <div className="datacron-card__tier">
                <div className="datacron-card__tier-scope">
                    <div className="datacron-primary-icon">
                        <div className="datacron-primary-icon__selected-ring"></div>
                        <img className="datacron-primary-icon__img datacron-primary-icon__img--is-active" src={icon} alt="" loading="lazy"/>
                    </div>
                </div>
                <div className="datacron-card__tier-primary">
                    <div className="datacron-card__tier-level">
                        <span className="text-muted">{title}</span>
                    </div>
                    <div className="datacron-card__tier-description">
                        {text}
                    </div>
                </div>
            </div>
    }

    const getDatacronName = (datacron) => {
        if(datacronNames === undefined || Object.keys(datacronNames).length === 0) return ''
        return datacronNames.datacronNames[datacron.id]

    }

    const populateTable = () => {
        if(account === undefined || Object.keys(account).length === 0) return

        return account.datacron
        .filter(datacron => {
            let level = datacron.affix.length
            if(datacronSet !== '' && datacron.setId !== datacronSet) return false
            if(alignment !== '' && (level < 3 || datacron.affix[2].targetRule !== alignment)) return false
            if(alignmentBonus !== '' && (level < 3 || `${datacron.affix[2].abilityId}:${datacron.affix[2].targetRule}` !== alignmentBonus)) return false
            if(faction !== '' && (level < 6 || datacron.affix[5].targetRule !== faction)) return false
            if(factionBonus !== '' && (level < 6 || `${datacron.affix[5].abilityId}:${datacron.affix[5].targetRule}` !== factionBonus)) return false
            if(character !== '' && (level < 9 || datacron.affix[8].targetRule !== character)) return false
            if(characterBonus !== '' && (level < 9 || `${datacron.affix[8].abilityId}:${datacron.affix[8].targetRule}` !== characterBonus)) return false
            if(nameFilter !== '' && !datacronNames.datacronNames[datacron.id]?.includes(nameFilter)) return false
            return statFilterList.every(statType => datacron.affix.some(tier => String(tier.statType) === statType))
        })
        .sort((a,b) => {
            return Number(getStats(b)[statSort] || 0) - Number(getStats(a)[statSort] || 0) || b.affix.length - a.affix.length
        })
        .map(datacron => {
            let tiers = datacron.affix
            let level = tiers.length
            let image = datacronImageMap[datacron.setId]
            let reroll = datacron.rerollCount
            let tier = level < 3 ? 0 : level < 6 ? 1 : level < 9 ? 2 : 3
            let suffix = level === 0 ? '_empty' : level === 9 ? '_max' : ''

            let alignmentBonusText = ''
            let alignmentScopeIcon = ''
            let alignmentCategory = ''
            if(level >= 3) {
                let alignmentTier = tiers[2]
                let alignmentBonusId = `${alignmentTier.abilityId}:${alignmentTier.targetRule}`
                alignmentBonusText = alignmentBonusMap[alignmentBonusId]?.name
                alignmentScopeIcon = alignmentTier.scopeIcon
                alignmentCategory = targetRuleToCategory[alignmentTier.targetRule]
            }

            let factionBonusText = ''
            let factionScopeIcon = ''
            let factionCategory = ''
            if(level >= 6) {
                let factionTier = tiers[5]
                let factionBonusId = `${factionTier.abilityId}:${factionTier.targetRule}`
                factionBonusText = factionBonusMap[factionBonusId]?.name
                factionScopeIcon = factionTier.scopeIcon
                factionCategory = targetRuleToCategory[factionTier.targetRule]
            }

            let characterBonusText = ''
            let characterScopeIcon = ''
            let characterCategory = ''
            if(level >= 9) {
                let characterTier = tiers[8]
                let characterBonusId = `${characterTier.abilityId}:${characterTier.targetRule}`
                characterBonusText = characterBonusMap[characterBonusId]?.name
                characterScopeIcon = characterTier.scopeIcon
                characterCategory = targetRuleToCategory[characterTier.targetRule]
            }

            let statsMap = getStats(datacron)

            let statsArray = Object.keys(statsMap).map(key => {
                let statName = stats[key].name
                let statValue = Math.round(statsMap[key]/10000)/100
                return {
                    statName: statName,
                    statValue: statValue
                }
            })

            return <Table.Row key={datacron.id}>
                <Table.Cell>
                    <Input 
                        placeholder='Datacron Name'
                        id={datacron.id}
                        onChange={handleDatacronNameChange}
                        value={getDatacronName(datacron)}
                    />
                </Table.Cell>
                <Table.Cell>
                    {overviewCell(tier, image, suffix, level, reroll)}
                </Table.Cell>
                <Table.Cell>
                    { statCell(statsArray) }
                </Table.Cell>
                <Table.Cell>
                    { level >= 3 ? bonusCell(`${alignmentScopeIcon}.png`, alignmentCategory, alignmentBonusText) : '' }
                </Table.Cell>
                <Table.Cell>
                    { level >= 6 ? bonusCell(`${factionScopeIcon}.png`, factionCategory, factionBonusText) : '' }
                </Table.Cell>
                <Table.Cell>
                    { level >= 9 ? bonusCell(`https://swgoh-images.s3.us-east-2.amazonaws.com/toon-portraits/${characterScopeIcon}.png`, characterCategory, characterBonusText) : '' }
                </Table.Cell>
            </Table.Row>
        })
    }

	return <Grid>
        <Grid.Row centered>
            <Header size='huge' textAlign='center'>{account?.name}'s Datacrons</Header>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column floated='left' mobile={16} computer={4}>
            <Form>
            <Form.Dropdown
                label="Datacron Set"
                options={prepareDropdown(datacrons)}
                selection
                placeholder='Datacron Set'
                clearable
                onChange={handleDatacronSetDropdownChange}
                value={datacronSet}
            />
            </Form>
            </Grid.Column>
            <Grid.Column floated='left' mobile={16} computer={4}>
            <Form>
            <Form.Dropdown
                label="Stat Filter"
                options={prepareDropdown(filter(statDropdownOptions, 'set'))}
                selection
                placeholder='Stat Filter'
                clearable
                multiple
                onChange={handleStatFilterDropdownChange}
                value={statFilterList}
            />
            </Form>
            </Grid.Column>
            <Grid.Column floated='left' mobile={16} computer={4}>
            <Form>
            <Form.Dropdown
                label="Stat Sort"
                options={prepareDropdown(filter(statDropdownOptions, 'set'))}
                selection
                placeholder='Stat Sort'
                clearable
                onChange={handleStatSortDropdownChange}
                value={statSort}
            />
            </Form>
            </Grid.Column>
            <Grid.Column floated='left' mobile={16} computer={4}>
            <Form>
                <Form.Field
                    control={Input}
                    placeholder='Name Filter'
                    label='Name Filter'
                    value={nameFilter}
                    onChange={handleNameFilterChange}
                />
            </Form>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
            <Grid.Column computer={4} mobile={16}>
                <Form>
                <Form.Dropdown
                    label="Alignment"
                    options={prepareDropdown(filter(alignmentDropdownOptions, 'set'))}
                    selection
                    placeholder='Alignment'
                    clearable
                    onChange={handleAlignmentDropdownChange}
                    value={alignment}
                />
                <Form.Dropdown
                    label="Faction"
                    options={prepareDropdown(filter(factionDropdownOptions, 'alignment'))}
                    selection
                    placeholder='Faction'
                    clearable
                    onChange={handleFactionDropdownChange}
                    value={faction}
                />
                <Form.Dropdown
                    label="Character"
                    options={prepareDropdown(filter(characterDropdownOptions, 'faction'))}
                    selection
                    placeholder='Character'
                    clearable
                    onChange={handleCharacterDropdownChange}
                    value={character}
                />
                </Form>
            </Grid.Column>
            <Grid.Column computer={12} mobile={16}>
            <Form>
                <Form.Dropdown
                    label="Alignment Bonus"
                    options={prepareDropdown(filter(alignmentBonusDropdownOptions, 'alignment'))}
                    selection
                    placeholder='Alignment Bonus'
                    clearable
                    onChange={handleAlignmentBonusDropdownChange}
                    value={alignmentBonus}
                />
                <Form.Dropdown
                    label="Faction Bonus"
                    options={prepareDropdown(filter(factionBonusDropdownOptions, 'faction'))}
                    selection
                    placeholder='Faction Bonus'
                    clearable
                    onChange={handleFactionBonusDropdownChange}
                    value={factionBonus}
                />
                <Form.Dropdown
                    label="Character Bonus"
                    options={prepareDropdown(filter(characterBonusDropdownOptions, 'character'))}
                    selection
                    placeholder='Character Bonus'
                    clearable
                    onChange={handleCharacterBonusDropdownChange}
                    value={characterBonus}
                />
            </Form>
            </Grid.Column>
        </Grid.Row>
        <Form>
            <Form.Group>
            <Form.Button onClick={reset} content='Reset Filters' icon='undo'/>
            <Form.Button positive content='Save Names' icon='save' onClick={() => updateDatacronNames(datacronNames)}/>
            </Form.Group>
        </Form>
        <Grid.Row>
        <Table celled stackable compact>
            <Table.Header>
                <Table.Row textAlign='center'>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Datacron</Table.HeaderCell>
                    <Table.HeaderCell>Stats</Table.HeaderCell>
                    <Table.HeaderCell>Alignment (Level 3)</Table.HeaderCell>
                    <Table.HeaderCell>Faction (Level 6)</Table.HeaderCell>
                    <Table.HeaderCell>Character (Level 9)</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                { populateTable() }
            </Table.Body>
        </Table>
        </Grid.Row>
    </Grid>
}

export default Datacrons;