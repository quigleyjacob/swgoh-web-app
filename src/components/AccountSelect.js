// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { List, Header, Grid, GridColumn, Icon, Dimmer, Loader } from 'semantic-ui-react'

function AccountSelect(props) {

    const [accounts, setAccounts] = useState([])
    const [gettingPlayerData, setGettingPlayerData] = useState(false)

    

    useEffect(() => {
        const getAccounts = async () => {
            let sessionId = props.session
            if(sessionId) {
                let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/user`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({sessionId: sessionId})
                })
                
                if(response.ok) {
                    let accountsList = await response.json()
                    return accountsList
                }
            }
        }
        let fxn = async () => {
            props.redirect('accountSelect')
            let accountList = await getAccounts()
            setAccounts(accountList)
        }
        fxn()
    }, [props.session, props])



    const handleClick = async (e, obj) => {
        console.log(e)
        console.log(obj)
        setGettingPlayerData(true)
        let payload = {allyCode: obj.value}
        let body = {
            payload: payload
        }
        let player = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if(player.ok) {
            let account = await player.json()
            let guildId = account.guildId
            let body = {
                guildId: guildId,
                detailed: true,
                refresh: false,
                projection: {
                    name: 1,
                    allyCode: 1,
                    rosterUnit: {
                        definitionId: 1
                    }
                }
            }
            let guild = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/guild`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })
            if(guild.ok) {
                let guildData = await guild.json()
                await props.setActiveAccount(account)
                await props.setActiveGuild(guildData)
                setGettingPlayerData(false)
                props.navigate('/')
            }

        }
    }

    return <div>
        <Dimmer active={gettingPlayerData}>
            <Loader>Getting Player Data</Loader>
        </Dimmer>
        <Header size='huge' textAlign='center'>Account Select</Header>
        <Grid>
            <GridColumn width={4}></GridColumn>
            <GridColumn textAlign='center' width={8}>
                <List animated size='massive' celled selection>
                {
                    accounts?.map(account => {
                        return <List.Item
                            key={account.allyCode}
                            value={account.allyCode}
                            onClick={handleClick}
                        >
                        <Icon name='user'></Icon>
                        {`${account.name} (${account.allyCode})`}
                        </List.Item>
                    })
                }
                </List>
                <GridColumn width={4}></GridColumn>
            </GridColumn>
        </Grid>


    </div>
}

export default AccountSelect