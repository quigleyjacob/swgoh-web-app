import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, Header, Button, Icon, Progress } from "semantic-ui-react";
import { getActiveRaid } from "../../server/guild";
import { getAuthStatus } from "../../server/player";
import { timeUntil } from "../../utils";
import SortableTable from "../displays/SortableTable";

function ActiveRaid({redirect, guild, displayMessage, session, loggedInAllyCode, loggedInGuildId, displayModal, setLoaderMessage, setLoaderVisible}) {
    const [activeRaid, setActiveRaid] = useState({})
    const [authStatus, setAuthStatus] = useState(false)

    const getAuthStatusCallback = useCallback(async () => {
        if(session && loggedInAllyCode) {
            getAuthStatus(session, loggedInAllyCode, setAuthStatus, displayMessage)
        }
    }, [session, loggedInAllyCode, displayMessage])

    useEffect(() => {
            redirect('activeRaid')
            getAuthStatusCallback()
    }, [redirect, getAuthStatusCallback])

    const handleActiveRaidRefreshClick = () => {
        displayModal('Refresh Active Raid: This will break your game connection', true, refreshActiveRaid)
    }

    const refreshActiveRaid = async () => {
        setLoaderMessage('Refreshing Active Raid')
        setLoaderVisible(true)
        await getActiveRaid(session, loggedInAllyCode, loggedInGuildId, displayMessage, setActiveRaid)
        setLoaderVisible(false)
    }

    const getGreatestLessThan = () => {
        let previousRaidGuildScore = Number(guild?.recentRaidResult?.[0]?.guildRewardScore || 0)
        let scores = [10000000, 14500000, 22500000, 67500000, 78500000, 90000000, 130000000, 265000000, 416000000, 520000000]
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
            {text: "Absolute Difference", key: 'absDiff'},
            {text: "Relative Difference", key: 'relDiff', positive: (relDiff) => relDiff >= 1, negative: (relDiff) => relDiff < 0.8, warning: (relDiff) => relDiff < 1 && relDiff >= 0.8}
        ]
    }

    const getRows = () => {
        return guild.member.map(({allyCode, playerId, playerName, raidScore}) => {
            let activeRaidScore = activeRaid?.raidMemberMap?.[playerId]?.memberProgress || 0
            return {
                playerName,
                allyCode,
                raidScore,
                activeRaidScore,
                absDiff: activeRaidScore - raidScore,
                relDiff: activeRaidScore/raidScore
            }
        })
    }

    const getRenders = () => {
        return {
            'playerName': ({playerName, allyCode}) => {
                return <Header size='tiny' as={Link} color='blue' to={`/profile/${allyCode}`}>{playerName}</Header>
            },
            'activeRaidScore': ({activeRaidScore}) => {
                return activeRaidScore.toLocaleString('en-US')
            },
            'raidScore': ({raidScore}) => {
                return raidScore.toLocaleString('en-US')
            },
            'absDiff': ({absDiff}) => {
                return absDiff.toLocaleString('en-US')
            },
            'relDiff': ({relDiff, raidScore}) => {
                if(raidScore === 0) {
                    return 0
                }
                return relDiff.toLocaleString('en-US', {maximumFractionDigits: 2})
            }
        }

    }

    return <Grid centered>
        <Grid.Row>
            <Grid.Column floated='right' fluid>
                <Button floated='right' primary disabled={!authStatus || guild?.profile?.id !== loggedInGuildId} onClick={handleActiveRaidRefreshClick}><Icon name='refresh'/>Refresh Active Raid</Button>
            </Grid.Column>
        </Grid.Row>
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
            </Header>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column>
            <Progress color="green" progress indicating percent={getGuildPercentProgress()} label={getGuildProgressLabel()}/>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <SortableTable sortable fixed meta={getHeaders()} row={getRows()} render={getRenders()} defaultSort={{column: 'activeRaidScore', direction: 'descending'}} />
        </Grid.Row>
    </Grid>
}

export default ActiveRaid