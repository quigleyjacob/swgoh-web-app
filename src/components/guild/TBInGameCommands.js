import React, { useState, useEffect } from "react"
import { Grid, Header, Menu, Form, Segment, Table, Button, Popup, Modal, Icon } from "semantic-ui-react"
import { getTbInfo, getLocalization } from "../../server/data"
import { addCommand, getCommand, getCommands, updateCommand, deleteCommand, pushCommandsToGame, pushCommendsToGameById } from "../../server/command"

function TBInGameCommands({redirect, guildId, displayMessage, session, displayModal, isOfficer}) {

    const type = 'tb-in-game'
    const event = 'TB3_MIXED'
    const DEFAULT_SAVE_COMMAND_STATE = {title: '', description: '', _id: '', metadata: {}, event}

    const [tbInfo, setTbInfo] = useState({})
    const [activeTab, setActiveTab] = useState('groupByZone')
    const [activeSubTab, setActiveSubTab] = useState('conflictZoneDefinition')
    const [localizationMap, setLocalizationMap] = useState({})
    const [selectedZones, setSelectedZones] = useState([])
    const [activeZoneId, setActiveZoneId] = useState('')

    const [savedConfigs, setSavedConfigs] = useState([])

    const [saveCommandModal, setSaveCommandModal] = useState(false)
    const [saveCommandData, setSaveCommandData] = useState(DEFAULT_SAVE_COMMAND_STATE)
    const onSaveCommandChange = (field, value) => {
        setSaveCommandData(prevCommand => {
            return {
                ...prevCommand,
                [field]: value
            }
        })
    }
    const setSaveCommandId = (id) => {
        onSaveCommandChange('_id', id)
    }
    const clearCommandData = () => {
        setSaveCommandData(DEFAULT_SAVE_COMMAND_STATE)
    }
    const pushSaveCommandDataToGame = () => {
        let body = (({event, metadata}) => ({event, metadata}))(saveCommandData)
        pushCommandsToGame(body, guildId, session, displayMessage)
    }

    const [viewMetadataModal, setViewMetadataModal] = useState(false)
    const [viewMetadataId, setViewMetadataId] = useState('')
    const [viewMetadataCommand, setViewMetadataCommand] = useState({})
    const openViewMetadataModal = async (id) => {
        if(id !== viewMetadataId) {
            await getCommand(id, guildId, session, displayMessage, setViewMetadataCommand, setViewMetadataId)
        }
        setViewMetadataModal(true)
    }

    const saveCommand = async () => {
        const body = {
            title: saveCommandData.title,
            description: saveCommandData.description,
            type,
            count: Object.keys(saveCommandData.metadata).length,
            metadata: saveCommandData.metadata,
            public: false,
            event
        }
        if(saveCommandData._id === '') {
            await addCommand(guildId, session, body, displayMessage, savedConfigs, setSavedConfigs, setSaveCommandId)
        } else {
            await updateCommand(saveCommandData._id, guildId, session, body, displayMessage)
            setSavedConfigs(prevConfigs => {
                let index = prevConfigs.findIndex(config => config._id === saveCommandData._id)
                let newConfig = {
                    _id: saveCommandData._id,
                    title: saveCommandData.title,
                    description: saveCommandData.description,
                    count: Object.keys(saveCommandData.metadata).length,
                    public: false
                }
                return prevConfigs.toSpliced(index, 1, JSON.parse(JSON.stringify(newConfig)))
            })
            if(saveCommandData._id === viewMetadataCommand._id) {
                setViewMetadataCommand({})
                setViewMetadataId('')
            }
        }
        setSaveCommandModal(false)
    }

    const loadCommand = async (id) => {
        await getCommand(id, guildId, session, displayMessage, setSaveCommandData)
        setActiveTab('groupByZone')
    }

    const pushCommand = async (id) => {
        pushCommendsToGameById(id, guildId, session, displayMessage)
    }

    const onDelete = async (id) => {
        await deleteCommand(id, guildId, session, displayMessage, savedConfigs, setSavedConfigs)
        if(saveCommandData._id === id) {
            clearCommandData()
        }
    }

    useEffect(() => {
        if(!guildId && !session) return
        getTbInfo('t05D', displayMessage, setTbInfo)
        getLocalization('^TERRITORY_TB3', displayMessage, setLocalizationMap)
        getCommands(guildId, session, type, displayMessage, setSavedConfigs)
    }, [displayMessage, guildId, session])

    const handleFormChange = (zoneId, key, value) => {
        setSaveCommandData(prevSaveCommandData => {
            const newMessages = JSON.parse(JSON.stringify(prevSaveCommandData.metadata))
            if(newMessages[zoneId]) {
                newMessages[zoneId][key] = value
            } else {
                newMessages[zoneId] = {
                    [key]: value
                }
            }
            return {
                ...prevSaveCommandData,
                metadata: newMessages
            }
        })
    }

    const groupByTypeTabs = [
        {
            key: 'conflictZoneDefinition',
            name: 'Zone Deployment'
        },
        {
            key: 'strikeZoneDefinition',
            name: 'Combat Missions'
        },
        {
            key: 'covertZoneDefinition',
            name: 'Special Missions'
        },
        {
            key: 'reconZoneDefinition',
            name: 'Operations'
        }
    ]

    const commandStateOptions = [
        {
            key: 1, // make sure to actually remove this when forming payload
            text: 'None',
            value: 1
        },
        {
            key: 2,
            text: 'Focus',
            value: 2
        },
        {
            key: 3,
            text: 'Ignore',
            value: 3
        }
    ]

    const getZones = () => {
        if(Object.keys(tbInfo).length === 0) return []

        return tbInfo.conflictZoneDefinition.map(zone => ({
            key: zone.zoneDefinition.zoneId,
            value: zone.zoneDefinition.zoneId,
            text: localizationMap?.[zone.zoneDefinition.nameKey] || zone.zoneDefinition.zoneId
        }))
    }

    const getName = (zone) => {
        return localizationMap[zone.zoneDefinition.nameKey] || zone.zoneDefinition.zoneId
    }

    const getTablesForMetadata = (metadata) => {
        if(Object.keys(tbInfo).length === 0) return
        return groupByTypeTabs.map((typeTab, index) => (
            <div key={index}>
                <Header as='h2'>{typeTab.name}</Header>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>
                                Name
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Message
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Command State
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {tbInfo[typeTab.key]
                            .filter(zone => metadata[zone.zoneDefinition.zoneId])
                            .map(zone => {
                                let zoneId = zone.zoneDefinition.zoneId
                                let zoneContent = metadata[zoneId]
                                let isClear = zoneContent.clear || false
                                return <Table.Row key={zoneId}>
                                    <Table.Cell>{getName(zone)}</Table.Cell>
                                    <Table.Cell>{isClear ? '<Clear message>' : zoneContent.message || '<Clear message>'}</Table.Cell>
                                    <Table.Cell>{isClear ? 'None' : commandStateOptions.find(option => option.key === zoneContent.commandState)?.text || 'None'}</Table.Cell>
                                </Table.Row>
                            })
                        }
                    </Table.Body>
                </Table>
            </div>
        ))
    }

    const handleZoneFilterDropdownChange = (e, data) => {
        setSelectedZones(data.value)
    }

    const handleActiveZoneChange = (key) => {
        if(activeZoneId === key) {
            setActiveZoneId('')
        } else {
            setActiveZoneId(key)
        }
    }

    const renderGroupByType = () => {
        return <Grid>
            <Grid.Row>
                <Grid.Column textAlign="center">
                    <Form.Field>
                        <label>Filter Zones</label>
                        <Form.Dropdown
                            inline
                            selection
                            multiple
                            options={getZones()}
                            value={selectedZones}
                            onChange={handleZoneFilterDropdownChange}
                        />
                    </Form.Field>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Menu pointing secondary widths={groupByTypeTabs.length}>
                    {groupByTypeTabs.map(tab => {
                        const key = tab.key
                        const name = tab.name
                    return <Menu.Item
                        key={key}
                        name={name}
                        active={activeSubTab === key}
                        onClick={() => setActiveSubTab(key)}
                    />
                    })}
                </Menu>
            </Grid.Row>
            <Grid.Row>
                <Grid columns={3} doubling stackable>
                    <Grid.Row>
                        {renderGroupedMessageSegments()}
                    </Grid.Row>
                </Grid>
            </Grid.Row>
        </Grid>
    }

    const getSegmentForZone = (zone) => {
        const zoneId = zone.zoneDefinition.zoneId
        const isClear = saveCommandData.metadata[zoneId]?.clear || false
        return <Segment padded>
            <Header textAlign="center">{getName(zone)}</Header>
            <Form.Group widths={'equal'}>
                <Form.Input
                    label='Message'
                    placeholder='Command'
                    fluid
                    disabled={!isOfficer() || isClear}
                    value={saveCommandData.metadata[zoneId]?.message || ''}
                    onChange={(_, data) => handleFormChange(zoneId, 'message', data.value)}
                />
                <Form.Dropdown
                    label='Focus'
                    selection
                    fluid
                    disabled={!isOfficer() || isClear}
                    options={commandStateOptions}
                    value={saveCommandData.metadata[zoneId]?.commandState || 1}
                    onChange={(_, data) => handleFormChange(zoneId, 'commandState', data.value)}
                />
            </Form.Group>
            <Form.Checkbox
                checked={saveCommandData.metadata[zoneId]?.clear || false}
                label='Clear commands from this zone'
                onChange={(_, data) => handleFormChange(zoneId, 'clear', data.checked)}
            />
        </Segment>
    }

    const renderGroupedMessageSegments = () => {
        let data = tbInfo[activeSubTab]
        if(!data || data.length === 0) {
            return
        }
        return data
        .filter(zone => {
            if(selectedZones.length === 0) return true
            let zoneId = zone.zoneDefinition.zoneId
            let linkedConflictId = zone.zoneDefinition.linkedConflictId
            return selectedZones.includes(zoneId) || selectedZones.includes(linkedConflictId)
        })
        .filter(zone => !zone.zoneDefinition.zoneId.includes('specialmission'))
        .map(zone => {
            return <Grid.Column key={zone.zoneDefinition.zoneId}>
                {getSegmentForZone(zone)}
            </Grid.Column>
        })
    }

    const renderActiveZone = () => {
        if(!activeZoneId || Object.keys(tbInfo).length === 0) return
        const activeZone = tbInfo.conflictZoneDefinition.find(zone => zone.zoneDefinition.zoneId === activeZoneId)

        const zonesByTypeForActiveZone = groupByTypeTabs.reduce((obj, tab) => {
            const key = tab.key
            const zones = tbInfo[key].filter(zone => zone.zoneDefinition.zoneId === activeZoneId || zone.zoneDefinition.linkedConflictId === activeZoneId)
            obj[key] = zones
            return obj
        }, {})
        return <Grid divided='vertically'>
            <Grid.Row>
                <Grid.Column textAlign="center">
                    <Header as={'h2'}>{localizationMap[activeZone.zoneDefinition.nameKey]}</Header>
                </Grid.Column>
            </Grid.Row>
            {groupByTypeTabs
            .filter(type => zonesByTypeForActiveZone[type.key].length > 0)
            .map(type => {
                const numMessages = zonesByTypeForActiveZone[type.key].length
                const numColumns = numMessages < 2 ? 1 : 2
                return <Grid.Row>
                <Grid.Column textAlign="center">
                    <Header as={'h3'}>{type.name}</Header>
                    <Grid columns={numColumns} doubling stackable>
                        <Grid.Row>
                            {zonesByTypeForActiveZone[type.key]
                            .filter(zone => !zone.zoneDefinition.zoneId.includes('specialmission'))
                            .map(zone => {
                                return <Grid.Column textAlign="left">
                                    {getSegmentForZone(zone)}
                                </Grid.Column>
                            })}
                        </Grid.Row>
                    </Grid>
                    
                </Grid.Column>
            </Grid.Row>
            })}
        </Grid>
    }

    const renderGroupByZone = () => {
        let zones = getZones()
        return <Grid>
            <Grid.Row>
                <Grid.Column computer={8} tablet={8} mobile={16}>
                    <div className="wrapper">
                        <div className="roteMap">
                            {
                                zones.map(zone => {
                                    const planet = zone.text.toLowerCase().replaceAll(' ', '-')
                                    const key = zone.key
                                    return <div key={key} className={`planet ${planet} ${activeZoneId === key ? 'activePlanet' : ''}`} onClick={() => handleActiveZoneChange(key)}></div>
                                })
                            }
                        </div>
                    </div>
                </Grid.Column>
                <Grid.Column computer={8} tablet={8} mobile={16}>
                    {renderActiveZone()}
                </Grid.Column>
            </Grid.Row>
        </Grid>
    }

    const renderMessageConfigs = () => {
        return <Grid>
            <Grid.Row>
                <Grid.Column>
                <Table striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>
                                Title
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Description
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Number of changes
                            </Table.HeaderCell>
                            <Table.HeaderCell collapsing></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {savedConfigs.map(config => {
                            return <Table.Row key={config._id}>
                                <Table.Cell>
                                    {config.title || ''}
                                    {config.public && ' (Read Only)'}
                                </Table.Cell>
                                <Table.Cell>
                                    {config.description || ''}
                                </Table.Cell>
                                <Table.Cell>
                                    {config.count || 0}
                                </Table.Cell>
                                <Table.Cell>
                                    <Button.Group size="small">
                                        {/* View Metadata */}
                                        <Popup content='View metadata' trigger={<Button basic icon='info circle' color="grey" onClick={() => openViewMetadataModal(config._id)}/>} />

                                        {/* Load Config */}
                                        <Popup content='Push to game' trigger={<Button basic icon='cloud upload' color='blue' disabled={!isOfficer()} onClick={() => displayModal('This will break your game connection. Do you wish to continue?', true, () => pushCommand(config._id))} />} />
                                        
                                        {/* Open Changes */}
                                        {!config.public && <Popup content='Load commands in site' trigger={<Button basic icon='external alternate' color='yellow' onClick={() => displayModal('This will overwrite command content. Do you wish to continue?', true, () => loadCommand(config._id))} />} />}
                                        
                                        {/* Delete */}
                                        {!config.public && <Popup content='Delete commands' trigger={<Button basic icon='trash alternate' color='red' disabled={!isOfficer()} onClick={() => displayModal('This action cannot be reversed. Confirm to delete', true, () => onDelete(config._id))} />} />}
                                    </Button.Group>

                                </Table.Cell>

                            </Table.Row>
                        })}
                    </Table.Body>
                </Table>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    }

    const tabs = [
        {
            key: 'groupByZone',
            name: 'Group by Zone',
            render: renderGroupByZone
        },
        {
            key: 'groupByType',
            name: 'Group by Type',
            render: renderGroupByType
        },
        {
            key: 'viewConfigs',
            name: 'Saved Commands',
            render: renderMessageConfigs
        }
    ]

    const renderSaveCommandModal = () => {
        return <Modal
            onClose={() => setSaveCommandModal(false)}
            onOpen={() => setSaveCommandModal(true)}
            open={saveCommandModal}
        >
            <Modal.Header>
                Save Command
            </Modal.Header>
            <Modal.Content scrolling>
                <Form>
                    <Form.Input
                        label='Title'
                        value={saveCommandData.title || ''}
                        onChange={(_, data) => onSaveCommandChange('title', data.value)}
                    />
                    <Form.TextArea
                        label='Description'
                        value={saveCommandData.description || ''}
                        onChange={(_, data) => onSaveCommandChange('description', data.value)}
                    />
                </Form>
                {getTablesForMetadata(saveCommandData.metadata)}
            </Modal.Content>
            <Modal.Actions>
                <Button secondary onClick={() => setSaveCommandModal(false)}>Close</Button>
                <Button positive onClick={saveCommand}><Icon name='save'/>Save</Button>
            </Modal.Actions>
        </Modal>
    }

    const renderViewMetadataModal = () => {
        if(Object.keys(tbInfo).length === 0 || Object.keys(viewMetadataCommand).length === 0) return
        return <Modal
            onClose={() => setViewMetadataModal(false)}
            onOpen={() => setViewMetadataModal(true)}
            open={viewMetadataModal}
        >
            <Modal.Header>{viewMetadataCommand.title}
            </Modal.Header>
            <Modal.Content scrolling>
                <Modal.Description>
                    {getTablesForMetadata(viewMetadataCommand.metadata)}
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={() => setViewMetadataModal(false)}>Close</Button>
            </Modal.Actions>
        </Modal>
    }

    return <Grid>
        <Grid.Row>
            <Grid.Column>
                <Header size='huge' textAlign='center'>TB In-Game Commands</Header>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column>
                <Menu tabular>
                    {tabs.map(tab => {
                        const key = tab.key
                        const name = tab.name
                        return <Menu.Item
                            key={key}
                            name={name}
                            active={activeTab === key}
                            onClick={() => setActiveTab(key)}
                        />
                    })}
                </Menu>
            </Grid.Column>
        </Grid.Row>
        {
            activeTab !== 'viewConfigs'
            &&
            <Grid.Row>
                <Grid.Column textAlign="center">
                    <Button basic positive onClick={() => setSaveCommandModal(true)} disabled={!isOfficer()}><Icon name='save'/>Save</Button>
                    <Button basic primary disabled={!isOfficer()} onClick={() => displayModal('This will break your game connection. Do you wish to continue?', true, pushSaveCommandDataToGame)} ><Icon name='cloud upload'/>Push to Game</Button>
                    <Button basic negative disabled={!isOfficer()} onClick={() => displayModal('This will remove all commands from the page. Do you wish to continue?', true, clearCommandData)}><Icon name='trash'/>Clear all</Button>
                </Grid.Column>
            </Grid.Row>
        }
        {
            activeTab !== 'viewConfigs' && isOfficer()
            &&
            <Grid.Row>
                <Grid.Column textAlign="center">
                    <Header as='h5'>
                        {saveCommandData._id === '' ? 'Creating new commands' : `Editing commands for ${saveCommandData.title}`}
                    </Header>
                </Grid.Column>
            </Grid.Row>
        }
        {
            activeTab !== 'viewConfig' && !isOfficer() && saveCommandData._id !== ''
            &&
            <Grid.Row>
                <Grid.Column textAlign="center">
                    <Header as='h5'>
                        Viewing commands for {saveCommandData.title}
                    </Header>
                </Grid.Column>
            </Grid.Row>
        }

        <Grid.Row>
            <Grid.Column>
                <Form>
                    {tabs.find(elt => elt.key === activeTab).render()}
                </Form>
            </Grid.Column>
        </Grid.Row>

        {renderSaveCommandModal()}
        {renderViewMetadataModal()}
    </Grid>
}

export default TBInGameCommands