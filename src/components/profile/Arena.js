import React, { useState } from 'react'
import { Header, Grid, Table, Button, Icon, Menu, Segment, Item } from 'semantic-ui-react';
import { getLeaderboard } from '../../server/player';

function Arena({session, redirect, account, displayMessage, displayModal, setLoaderVisible, setLoaderMessage, datacrons, leaderboard, setLeaderboard, authStatus}) {

    const [activeTab, setActiveTab] = useState('squad')

    const tabs = [
        {
            key: 'squad',
            name: 'Squad Arena'
        },
        {
            key: 'fleet',
            name: 'Fleet Arena'
        }
    ]

    const onClickLoadArena = () => {
        displayModal('Loading Arena will break your game connection. Confirm action?', true, loadLeaderboard)
    }

    const loadLeaderboard = async () => {
        setLoaderMessage('Loading Arena')
        setLoaderVisible(true)
        await getLeaderboard(session, account.allyCode, displayMessage, setLeaderboard)
        setLoaderVisible(false)
    }

    const renderArenaTable = () => {
        let playerList = leaderboard?.[activeTab]?.leaderboard?.[0]?.player
        let playerStatus = leaderboard?.[activeTab]?.leaderboard?.[0]?.playerStatus
        if(playerList === undefined || playerList.length === 0) {
            return 'No arena data to show'
        }
        return <Table celled compact striped definition>
            <Table.Header>
                <Table.Row>
                <Table.HeaderCell>
                    Rank
                </Table.HeaderCell>
                <Table.HeaderCell>
                    Name
                </Table.HeaderCell>
                <Table.HeaderCell>
                    AllyCode
                </Table.HeaderCell>
                <Table.HeaderCell>
                    Guild
                </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {playerList.map((player, index) => {
                    return <Table.Row active={index + 1 === playerStatus.rank}>
                        <Table.Cell>
                            {index + 1}
                        </Table.Cell>
                        <Table.Cell>
                        {player.allyCode ?
                            <Item className='pointer' as='a' onClick={() => window.open(`https://swgoh.gg/p/${player.allyCode}`, '_blank')}>{player.name}</Item>
                        : player.name}
                        </Table.Cell>
                        <Table.Cell>
                            {player.allyCode}
                        </Table.Cell>
                        <Table.Cell>
                            {player.guild ?
                            <Item className='pointer' as='a' onClick={() => window.open(`https://swgoh.gg/g/${player.guild.id}`, '_blank')}>{player.guild.name}</Item>
                            :
                            'No guild'}
                        </Table.Cell>
                    </Table.Row>
                })}
            </Table.Body>
        </Table>
    }

    return <Grid centered>
        <Grid.Row>
            <Grid.Column floated='right' fluid>
                <Button floated='right' primary disabled={!authStatus} onClick={onClickLoadArena}><Icon name='download'/>Load Arenas</Button>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Header size='huge'>
                {`${account?.name}'s Arenas`}
            </Header>
        </Grid.Row>

        <Grid.Row centered>
        <Menu pointing secondary widths={tabs.length}>
            {tabs.map((tab) => (
            <Menu.Item
                key={tab.key}
                name={tab.name}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
            />
            ))}
        </Menu>
        </Grid.Row>

        <Grid.Row>
            <Grid.Column>
              <Segment>
                {renderArenaTable()}
              </Segment>
            </Grid.Column>

        </Grid.Row>

    </Grid>
}

export default Arena