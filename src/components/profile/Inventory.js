import React, { useCallback, useEffect, useState } from 'react'
import { Header, Grid, Form, Dropdown, Table, Image, Button, Icon } from 'semantic-ui-react';
import { getCurrency, getMaterial, getEquipment } from '../../server/data';
import { getAuthStatus, getInventory } from '../../server/player';
import {inventoryOptions, inventoryPartitions, getImagePath} from '../../utils/inventory.js'
import GearCard from '../cards/GearCard.js'
import ModSlicingMatCard from '../cards/ModSlicingMatCard.js';
import { timeSince } from '../../utils';

function Inventory({session, redirect, account, displayMessage, displayModal, setLoaderVisible, setLoaderMessage, datacrons}) {

    const [currencyMap, setCurrencyMap] = useState({})
    const [materialMap, setMaterialMap] = useState({})
    const [equipmentMap, setEquipmentMap] = useState({})
    const [authStatus, setAuthStatus] = useState(false)
    const [inventory, setInventory] = useState({})
    const [currentInventory, setCurrentInventory]= useState('shipments')

    const handleInventoryDropdownChange = (e, obj) => {
        setCurrentInventory(obj.value)
    }

    const getDataCallback = useCallback(async () => {
        if(session) {
            getCurrency(session, displayMessage, setCurrencyMap)
            getMaterial(session, displayMessage, setMaterialMap)
            getEquipment(session, displayMessage, setEquipmentMap)
        }
    }, [session, displayMessage])

    const getAuthStatusCallback = useCallback(async () => {
        if(session && account?.allyCode) {
            getAuthStatus(session, account.allyCode, setAuthStatus, displayMessage)
        }
    }, [session, account.allyCode, displayMessage])

    useEffect(() => {
        (async () => {
            redirect('inventory')
            getDataCallback()
            getAuthStatusCallback()
        })()
    }, [account, session, redirect, getDataCallback, getAuthStatusCallback])

    useEffect(() => {
        if(session && account?.allyCode && authStatus) {
            getInventory(session, account.allyCode, displayMessage, setInventory)
        }
    }, [account.allyCode, authStatus, displayMessage, session])

    const getMapByInventoryType = (inventoryType) => {
        switch(inventoryType) {
            case 'currency':
                return currencyMap
            case 'equipment':
                return equipmentMap
            case 'material':
                return materialMap
            default:
                return {}
        }
    }

    const getImage = (itemData, type) => {
        let id = itemData?.id || ''
        let imagePath = getImagePath(type, itemData?.iconKey || '')
        if(type === 'equipment') {
            return <Image><GearCard className='table-icon' url={imagePath} mark={itemData.mark || ''} tier={itemData.tier || 1} /></Image>
        }
        if((typeof id === 'string') && id.startsWith('MOD_SLICING')) {
            return <Image><ModSlicingMatCard className='table-icon' url={imagePath} rarity={itemData?.rarity || 5} /></Image>
        }
        return <Image centered src={imagePath} className='table-icon'/>
    }

    const getQuantity = (quantity, itemData) => {
        if(itemData?.maxQuantity) {
            return `${formatNumber(quantity)} / ${formatNumber(itemData.maxQuantity)}`
        }
        return formatNumber(quantity)
    }

    const formatNumber = (quantity) => {
        let suffix = ''
        let number = quantity
        if(number >= 1e9) {
            suffix = 'B'
            number /= 1e9
        } else if(number >= 1e6) {
            suffix = 'M'
            number /= 1e6
        } else if (number >= 1e4) { // only shorten starting with 5 digit numbers
            suffix = 'K'
            number /= 1e3
        }
        return number.toLocaleString('en-US', {maximumFractionDigits: 1}) + suffix
    }

    const getInventoryOptions = () => {
        return [
            ...inventoryOptions,
            {
                key: 'datacron',
                value: 'datacron',
                text: "Datacron Materials"
            }
        ]
    }

    const getInventoryOptionData = () => {
        switch(currentInventory) {
            case 'datacron':
                let datacronsMaterialList = datacrons
                    .map(({id}) => id)
                    .sort((a,b) => a - b)
                    .reduce((arr, id) => {
                        let materials = ['upgrade', 'reroll'].map(type => {
                            return [1, 2, 3].map(tier => {
                                return {
                                    id: `datacron_set_${id}_${type}_${tier}`,
                                    type: 'material'
                                }
                            })
                        }).flat()
                        return [...arr, ...materials]
                    }, [])
                return [...(inventoryPartitions[currentInventory] || []), ...datacronsMaterialList]
            default:
                return inventoryPartitions[currentInventory]
        }
    }

    const getTableRows = () => {
        return getInventoryOptionData().map(({id, type, notes}, index) => {
            let itemData = getMapByInventoryType(type)?.[id]
            let inventoryItem = inventory?.[type]?.[id]
            let name = itemData?.nameKey || ''
            let quantity = inventoryItem?.quantity || 0
            return <Table.Row key={index}>
                <Table.Cell collapsing>
                    <Header as='h4' textAlign='left'>
                        {getImage(itemData, type)}
                        <Header.Content>
                            {name}
                        </Header.Content>
                    </Header>
                </Table.Cell>
                <Table.Cell collapsing>
                    {getQuantity(quantity, itemData)}
                </Table.Cell>
                <Table.Cell textAlign='left'>
                    {notes}
                </Table.Cell>
            </Table.Row>
        })
    }

    const onRefreshInventoryClick = () => {
        displayModal('Refresh Inventory: This will break your game connection', true, refreshInventory)
    }

    const refreshInventory = async () => {
        setLoaderMessage('Refreshing Inventory')
        setLoaderVisible(true)
        await getInventory(session, account.allyCode, displayMessage, setInventory, true)
        setLoaderVisible(false)
    }

    return <div>
        <Grid centered>
            <Grid.Row>
                <Grid.Column floated='right' fluid>
                    <Button floated='right' primary disabled={!authStatus} onClick={onRefreshInventoryClick}><Icon name='refresh'/>Refresh Inventory</Button>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Header size='huge'>
                    {`${account?.name}'s Inventory`}
                    <Header.Subheader>
                    {
                    inventory?.lastRefreshed
                    ?
                    `Last Refreshed: ${timeSince(Date.parse(inventory?.lastRefreshed))}`
                    :
                    ''
                    }
                    </Header.Subheader>
                </Header>
            </Grid.Row>
            <Grid.Row>
                <Form>
                    <Form.Group widths={'equal'}>
                        <Form.Field
                            label="Display"
                            placeholder="Display"
                            control={Dropdown}
                            selection
                            search
                            value={currentInventory}
                            options={getInventoryOptions()}
                            onChange={handleInventoryDropdownChange}
                        />
                    </Form.Group>
                </Form>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                <Table striped celled padded textAlign='center'>
                    <Table.Header>
                        <Table.Row>
                        <Table.HeaderCell>
                            <Header as='h2' >Name</Header>
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                        <Header as='h2' >Quantity</Header>
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                        <Header as='h2' >Notes</Header>
                        </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {getTableRows()}
                    </Table.Body>
                </Table>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </div>
}

export default Inventory