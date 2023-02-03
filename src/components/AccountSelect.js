// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react'
import { List, Header, Grid, GridColumn, Icon } from 'semantic-ui-react'

function AccountSelect({session, redirect, navigate, setAllyCode, setGuildId, setName}) {

    const [accounts, setAccounts] = useState({})

    const getAccounts = useCallback(async () => {
        if(session) {
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/user`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sessionId: session})
            })
            
            if(response.ok) {
                let accountsList = await response.json()
                // eslint-disable-next-line
                setAccounts(accountsList.reduce((map, obj) => (map[obj.allyCode] = obj, map), {}))
            } else {
                console.log(await response.text())
            }
        }
    }, [session])

    useEffect(() => {
        redirect('accountSelect')
        getAccounts()
    }, [redirect, getAccounts])

    const handleClick = async (e, obj) => {
        let allyCode = obj.value
        setAllyCode(allyCode)
        setName(accounts[allyCode].name)
        setGuildId(accounts[allyCode].guildId)
        navigate('/')
    }

    return <div>
        <Header size='huge' textAlign='center'>Account Select</Header>
        <Header size='medium' textAlign='center' color='grey'>Don't see your account? Be sure to register your account with QuigBot on Discord.</Header>
        <Grid>
            <GridColumn width={4}></GridColumn>
            <GridColumn textAlign='center' width={8}>
                <List animated size='massive' celled selection>
                {
                    Object.values(accounts)?.map(account => {
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