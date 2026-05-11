import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Header, Button, Icon, Progress, Modal, Form, Radio, Input, Segment, Popup } from "semantic-ui-react";
import { getActiveRaid, getRaidData, getRaidCampaignData, getGuildMemberDiscordRegistration } from "../../server/guild";
import { getAuthStatus } from "../../server/player";
import { timeUntil } from "../../utils";
import SortableTable from "../displays/SortableTable";
import { timeSince } from "../../utils";

function ActiveRaid({redirect, guild, displayMessage, session, loggedInAllyCode, loggedInGuildId, displayModal, setLoaderMessage, setLoaderVisible, activeRaid, setActiveRaid}) {
    const DEFAULT_NOTIFY_RAID_SCORE = 5000000
    const DEFAULT_NOTIFY_RELATIVE_SCORE = 0.7
    const DEFAULT_NOTIFY_MESSAGE = `Hit the raid!\n\n`
    const DEFAULT_NEGATIVE_THRESHOLD = 0.7
    const DEFAULT_WARNING_THRESHOLD = 0.9
    const [raidData, setRaidData] = useState({})
    const [raidCampaignData, setRaidCampaignData] = useState({})
    const [authStatus, setAuthStatus] = useState(false)
    const [discordRegistrationMap, setDiscordRegistrationMap] = useState({})
    const [tableData, setTableData] = useState([])
    const [showNotifyModal, setShowNotifyModal] = useState(false)

    const [value, setValue] = useState('')
    const [displayText, setDisplayText] = useState(DEFAULT_NOTIFY_RAID_SCORE.toLocaleString('en-US'))
    const [text, setText] = useState(DEFAULT_NOTIFY_RAID_SCORE)
    const [otherText, setOtherText] = useState(DEFAULT_NOTIFY_RELATIVE_SCORE)
    const [notifyMessage, setNotifyMessage] = useState(DEFAULT_NOTIFY_MESSAGE)

    const activeRaidLoaded = Object.keys(activeRaid).length > 0

    const handleChange = (e, { value }) => setValue(value)

    const getAuthStatusCallback = useCallback(async () => {
        if(session && loggedInAllyCode) {
            getAuthStatus(session, loggedInAllyCode, setAuthStatus, displayMessage)
        }
    }, [session, loggedInAllyCode, displayMessage])

    useEffect(() => {
            redirect('activeRaid')
            getAuthStatusCallback()
            getGuildMemberDiscordRegistration(loggedInGuildId, session, displayMessage, setDiscordRegistrationMap)
    }, [redirect, getAuthStatusCallback, displayMessage, loggedInGuildId, session])

    const handleActiveRaidRefreshClick = () => {
        displayModal('Refresh Active Raid: This will break your game connection', true, refreshActiveRaid)
    }

    const getRows = useCallback(() => {
        return guild.member.map(({allyCode, playerId, playerName, raidScore}) => {
            let previousRaidScore = raidScore || 0
            let activeRaidScore = activeRaid?.raidMemberMap?.[playerId]?.memberProgress || 0
            return {
                playerName,
                allyCode,
                raidScore: previousRaidScore,
                activeRaidScore,
                absDiff: activeRaidScore - previousRaidScore,
                relDiff: previousRaidScore !== 0 ? activeRaidScore / previousRaidScore : activeRaidScore === 0 ? 0 : Number.MAX_SAFE_INTEGER
            }
        })
    }, [guild, activeRaid])

    useEffect(() => {
        if(activeRaidLoaded) {
            getRaidData(activeRaid.raidId, session, displayMessage, setRaidData)
        }
        let rows = getRows()
        setTableData(rows)
    }, [activeRaid, session, displayMessage, getRows])

    useEffect(() => {
        if (!raidData) return;
        const { campaignId, campaignMapId, campaignNodeId } = raidData.campaignElementIdentifier || {};

        if (campaignId && campaignMapId && campaignNodeId) {
            getRaidCampaignData(campaignId, campaignMapId, campaignNodeId, session, displayMessage, setRaidCampaignData)
        }
        }, [raidData, session, displayMessage])

    useEffect(() => {
        if(!session || !loggedInAllyCode || !loggedInGuildId) return
        getActiveRaid(session, loggedInAllyCode, loggedInGuildId, false, displayMessage, setActiveRaid)
    }, [displayMessage, loggedInAllyCode, loggedInGuildId, session, setActiveRaid])

    const refreshActiveRaid = async () => {
        setLoaderMessage('Refreshing Active Raid')
        setLoaderVisible(true)
        await getActiveRaid(session, loggedInAllyCode, loggedInGuildId, true, displayMessage, setActiveRaid)
        setLoaderVisible(false)
    }

    const getGreatestLessThan = () => {
        let previousRaidGuildScore = Number(guild?.recentRaidResult?.[0]?.guildRewardScore || 0)
        if(Object.keys(raidCampaignData).length === 0) {
            return 0
        }
        let scores = raidCampaignData?.campaignNodeMission[0]?.rankRewardPreview.map(reward => reward.rankStart)
        return Math.max(...scores.filter(score => score < previousRaidGuildScore))
    }

    const getGuildPercentProgress = () => {
        let activeRaidGuildScore = Number(activeRaid?.guildRewardScore || 0)
        let previousRaidGuildScore = Number(guild?.recentRaidResult?.[0]?.guildRewardScore || 0)

        if(previousRaidGuildScore === 0) {
            return 0
        }
        return (activeRaidGuildScore/previousRaidGuildScore * 100).toLocaleString('en-US', {maximumFractionDigits: 2})
    }

    const getGuildProgressLabel = () => {
        let activeRaidGuildScore = Number(activeRaid?.guildRewardScore || 0)
        return `${activeRaidGuildScore.toLocaleString('en-US')} / ${getGreatestLessThan().toLocaleString('en-US')}`
    }

    const getHeaders = () => {
        return [
            {text: "Name", key: 'playerName'},
            {text: "Active Raid Score", key: 'activeRaidScore'},
            {text: "Previous Raid Score", key: 'raidScore'},
            {text: "Difference", key: 'absDiff'},
            {text: "Relative Difference", key: 'relDiff', positive: (relDiff) => relDiff >= DEFAULT_WARNING_THRESHOLD, negative: (relDiff) => relDiff < DEFAULT_NEGATIVE_THRESHOLD, warning: (relDiff) => relDiff < DEFAULT_WARNING_THRESHOLD && relDiff >= DEFAULT_NEGATIVE_THRESHOLD}
        ]
    }

    const getRenders = () => {
        return {
            'playerName': ({playerName, allyCode}) => {
                return <Header size='tiny' as={Link} color='blue' to={`/profile/${allyCode}`}>{playerName}</Header>
            },
            'activeRaidScore': ({activeRaidScore}) => {
                return activeRaidScore?.toLocaleString('en-US')
            },
            'raidScore': ({raidScore}) => {
                return raidScore?.toLocaleString('en-US')
            },
            'absDiff': ({absDiff}) => {
                return absDiff?.toLocaleString('en-US')
            },
            'relDiff': (obj) => {
                if(obj.relDiff === Number.MAX_SAFE_INTEGER) {
                    return 'New Score'
                }
                return obj.relDiff?.toLocaleString('en-US', {maximumFractionDigits: 2})
            }
        }

    }

    const renderActiveRaidButtons = () => {
        return <Grid.Row>
            <Grid.Column floated='right' fluid>
                <Button floated='right' primary disabled={!authStatus || guild?.profile?.id !== loggedInGuildId} onClick={handleActiveRaidRefreshClick}><Icon name={activeRaidLoaded ? 'refresh' : 'download'}/>{activeRaidLoaded ? 'Refresh' : 'Load'} Active Raid</Button>
                {activeRaidLoaded && <Button floated="right" onClick={openNotifyModal}><Icon name='alarm'/>Generate Notify Message</Button>}
            </Grid.Column>
        </Grid.Row>
    }

    const openNotifyModal = () => {
        setShowNotifyModal(true)
    }
    const closeNotifyModal = () => {
        setValue('') //unset radio button on close
        setNotifyMessage(DEFAULT_NOTIFY_MESSAGE)
        setShowNotifyModal(false)
    }
    const onNotifyRaidScoreChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '')
        setText(value)
        setDisplayText(value ? Number(value).toLocaleString('en-US') : '')
    }
    const generateNotifyMessage = () => {
        let message = DEFAULT_NOTIFY_MESSAGE
        if(value === 'absolute') {
            message += `Members with score less than or equal to ${displayText}:\n\n`   
        }
        if(value === 'relative') {
            message += `Members with score less than or equal to ${100*otherText}% of last score:\n\n`
        }
        let membersToNotify =tableData.filter(row => {
            if(value === 'absolute' && text) {
                return row.activeRaidScore <= Number(text)
            }
            if(value === 'relative' && otherText) {
                return row.relDiff <= Number(otherText)
            }
            return false
        })
        if(membersToNotify.length === 0) {
            message += 'No members to notify based on current criteria.'
        } else {
            message += membersToNotify.map(row => {
                let name = row.playerName
                if(discordRegistrationMap[row.allyCode]) {
                    name += ` (<@${discordRegistrationMap[row.allyCode].discordId}>)`
                } else {
                    name += ' (No Discord linked)'
                }
                return name
            })
            .join('\n')
        }
        setNotifyMessage(message)
    }


    const renderActiveRaid = () => {
        return <Grid centered>
        {renderActiveRaidButtons()}
        <Grid.Row>
            <Header size="huge">
                {guild?.profile?.name}'s Active Raid
                {
                    activeRaid?.expireTime
                    ?
                    <Header.Subheader>
                        Ends {timeUntil(activeRaid.expireTime)}
                    </Header.Subheader>
                    :''
                }
                {
                activeRaid?.lastRefreshed &&
                <Header.Subheader>
                Last Refreshed: {timeSince(Date.parse(activeRaid?.lastRefreshed))}
                </Header.Subheader>
                }
            </Header>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column>
            <Progress color="green" progress indicating percent={getGuildPercentProgress()} label={getGuildProgressLabel()}/>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <SortableTable sortable fixed meta={getHeaders()} row={tableData} render={getRenders()} defaultSort={{column: 'activeRaidScore', direction: 'descending'}} />
        </Grid.Row>

        <Modal
            open={showNotifyModal}
            onClose={() => setShowNotifyModal(false)}
            size='small'
        >
            <Modal.Header>Generate Notify Message</Modal.Header>
            <Modal.Content>
                <Form>
                <Form.Group inline>
                <Form.Field>
                    <Radio
                    label='Score less than or equal to:'
                    name='radioGroup'
                    value='absolute'
                    checked={value === 'absolute'}
                    onChange={handleChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Input
                        placeholder='Type here...'
                        disabled={value !== 'absolute'}
                        value={displayText}
                        onChange={onNotifyRaidScoreChange}
                        size='small'
                    />
                </Form.Field>
                </Form.Group>

                <Form.Group inline>
                <Form.Field>
                    <Radio
                        label='Relative Score less than or equal to:'
                        name='radioGroup'
                        value='relative'
                        checked={value === 'relative'}
                        onChange={handleChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Input
                        placeholder='Type here...'
                        disabled={value !== 'relative'}
                        value={otherText}
                        type="number" 
                        step="0.01"
                        min="0"
                        max="1"
                        onChange={(e) => setOtherText(e.target.value)}
                        size='small'
                    />
                </Form.Field>
                </Form.Group>
                
                </Form>
                {notifyMessage && 
                <Segment tertiary className="code-style" clearing>
                    <Popup content='Copy to clipboard' trigger={<Button basic floated='right' icon='copy' onClick={() => navigator.clipboard.writeText(notifyMessage)}/>}/>
                    <div>{notifyMessage}</div>
                </Segment>}
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={closeNotifyModal}>Close</Button>
                <Button primary onClick={generateNotifyMessage}>Generate</Button>
            </Modal.Actions>
        </Modal>
    </Grid>
    }

    return activeRaidLoaded
            ?
            renderActiveRaid()
            :
            <Grid centered>
                {renderActiveRaidButtons()}
                <Grid.Row >
                        <Header size='large'>No active raid data</Header>
                </Grid.Row>
            </Grid>
}

export default ActiveRaid