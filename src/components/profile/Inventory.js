import React, { useCallback, useEffect, useState } from 'react'
import { Header, Grid, Form, Dropdown, Table, Image, Button, Icon, Modal } from 'semantic-ui-react';
import { getCurrency, getMaterial, getEquipment } from '../../server/data';
import { getAuthStatus, getInventory, refreshInventory as refreshPlayerInventory } from '../../server/player';
import {inventoryOptions, inventoryPartitions, getImagePath} from '../../utils/inventory.js'
import GearCard from '../cards/GearCard.js'
import ModSlicingMatCard from '../cards/ModSlicingMatCard.js';

function Inventory({session, redirect, account, displayMessage, displayModal, setLoaderVisible, setLoaderMessage}) {

    const [currencyMap, setCurrencyMap] = useState({})
    const [materialMap, setMaterialMap] = useState({})
    const [equipmentMap, setEquipmentMap] = useState({})
    const [authStatus, setAuthStatus] = useState(false)
    const [inventory, setInventory] = useState({})
    const [currentInventory, setCurrentInventory]= useState('')
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        setModalOpen(true)
    }, [])

    const handleInventoryDropdownChange = (e, obj) => {
        setCurrentInventory(obj.value)
    }

    const getDataCallback = useCallback(async () => {
        if(session) {
            getCurrency(session, displayMessage, setCurrencyMap)
            getMaterial(session, displayMessage, setMaterialMap)
            getEquipment(session, displayMessage, setEquipmentMap)
            getAuthStatus(session, account.allyCode, setAuthStatus, displayMessage)
        }
    }, [session, displayMessage, account.allyCode])

    useEffect(() => {
        (async () => {
            redirect('inventory')
            getDataCallback()

        })()
    }, [session, redirect, getDataCallback])

    useEffect(() => {
        if(authStatus) {
            getInventory(session, account.allyCode, displayMessage, setInventory)
        }
    }, [account.allyCode, authStatus, displayMessage, session])

    const getMapByInventoryType = (inventoryType) => {
        switch(inventoryType) {
            case 'currencyItem':
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
        let imagePath = getImagePath(type, itemData?.iconKey || '')
        if(type === 'equipment') {
            return <GearCard url={imagePath} mark={itemData.mark || ''} tier={itemData.tier || 1} />
        }
        if((itemData?.id || '').startsWith('MOD_SLICING')) {
            return <ModSlicingMatCard url={imagePath} rarity={itemData?.rarity || 5} />
        }
        return <Image centered src={imagePath} size='mini' />
    }

    const getQuantity = (quantity, itemData) => {
        if(itemData.maxQuantity) {
            return `${formatNumber(quantity)} / ${formatNumber(itemData.maxQuantity)}`
        }
        return formatNumber(quantity)
    }

    const formatNumber = (quantity) => {
        let suffix = ''
        let number = quantity
        if(number > 1e6) {
            suffix = 'M'
            number /= 1e6
        } else if (number > 1e3) {
            suffix = 'K'
            number /= 1e3
        }
        return number.toLocaleString('en-US', {maximumFractionDigits: 1}) + suffix
    }



    const getTableRows = () => {
        if(Object.keys(inventory).length === 0 || currentInventory == '') {
            return
        }

        return inventoryPartitions[currentInventory].map(({id, type, notes}, index) => {
            
            let itemData = getMapByInventoryType(type)[id]
            let inventoryItem = inventory[type][id]
            let name = itemData?.nameKey || ''
            let quantity = inventoryItem?.quantity || 0

            return <Table.Row key={index}>
                <Table.Cell><Header as='h4'>{name}</Header></Table.Cell>
                <Table.Cell>{getImage(itemData, type)}</Table.Cell>
                <Table.Cell>{getQuantity(quantity, itemData)}</Table.Cell>
                <Table.Cell textAlign='left'>{notes}</Table.Cell>
            </Table.Row>
        })
    }

    const onRefreshInventoryClick = () => {
        displayModal('Refresh Inventory: This will break your game connection', true, refreshInventory)
    }

    const refreshInventory = async () => {
        setLoaderMessage('Refreshing Inventory')
        setLoaderVisible(true)
        await refreshPlayerInventory(session, account.allyCode, displayMessage, setInventory)
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
                <Header size='huge'>{`${account?.name}'s Inventory`}</Header>
            </Grid.Row>
            <Grid.Row>
                <Form>
                    <Form.Group widths={'equal'}>
                        <Form.Field
                            label="Display"
                            placeholder="Display"
                            control={Dropdown}
                            selection
                            clearable
                            search
                            value={currentInventory}
                            options={inventoryOptions}
                            onChange={handleInventoryDropdownChange}
                        />
                    </Form.Group>
                </Form>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                <Table striped celled fixed textAlign='center'>
                    <Table.Header>
                        <Table.Row>
                        <Table.HeaderCell>
                            <Header as='h2' >Name</Header>
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                        <Header as='h2' >Icon</Header>
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

        <Modal
			onOpen={() => setModalOpen(true)}
			onClose={() => setModalOpen(false)}
			open={modalOpen}
		>
			<Modal.Header>
				Oops, this feature is not available yet
			</Modal.Header>
			<Modal.Content scrolling>
                <p>
                Hello QuigBot User!
                </p>
				<p>
                This new feature is not quite ready to be used. Please stay tuned to the discord server for when this goes live. Thank you for your continued patronage.
                </p>
                <p>
                -Quig
                </p>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={() => setModalOpen(false)}>
					Close
				</Button>
			</Modal.Actions>
		</Modal>
    </div>
}

export default Inventory