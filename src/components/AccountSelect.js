import React, { useEffect, useState, useCallback } from 'react'
import { List, Header, Grid, GridColumn, Icon, Form, Input, Button, Container } from 'semantic-ui-react'

function AccountSelect({session, redirect, navigate, setAllyCode, setGuildId, setName, displayMessage}) {

    const [accounts, setAccounts] = useState({})
    const [newAllyCode, setNewAllyCode] = useState('')

    const getAccounts = useCallback(async () => {
        if(session) {
            let body = {
                session: session
            }
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/user`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })
            if(response.ok) {
                let accountsList = await response.json()
                // eslint-disable-next-line
                setAccounts(accountsList.reduce((map, obj) => (map[obj.allyCode] = obj, map), {}))
            } else {
                console.log(await response.text())
                displayMessage('Unable to get accounts for discord user', false)
            }
        }
    }, [session, displayMessage])

    const registerAllyCode = async () => {
        if(session) {
            let verification = await verifyAllyCode(newAllyCode)
            if(verification.ok) {
                let verified = await verification.json()
                let body = {
                    session: session,
                    allyCode: newAllyCode,
                    name: verified.name
                }
                let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/register`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                })
                if(response.ok) {
                    setNewAllyCode('')
                    await getAccounts()
                } else {
                    console.log(await response.text())
                    displayMessage('Unable to register this allycode', false)
                }
            } else {
                console.log(await verification.text())
                displayMessage('Unable to verify this allyCode', false)
            }
        }
    }

    const verifyAllyCode = async (allyCode) => {
        let body = {
            payload: {
                allyCode: allyCode
            },
            refresh: true,
            projection: {
                allyCode: 1,
                name: 1
            },
            session: session
        }

        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        return response
    }

    const handleChange = (e, obj) => {
        setNewAllyCode(obj.value)
    }

    useEffect(() => {
        redirect('accountSelect')
        getAccounts()
    }, [redirect, getAccounts])

    const handleClick = async (e, obj) => {
        let allyCode = obj.value
        setAllyCode(allyCode)
        document.cookie = `allyCode=${allyCode}`
        setName(accounts[allyCode].name)
        setGuildId(accounts[allyCode].guildId)
        navigate('/')
    }

    return <Container>
        <Header size='huge' textAlign='center'>Account Select</Header>

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

        <Header size='medium' textAlign='center' color='grey'>Don't see your account? Register your AllyCode below.</Header>
        <Grid>
            <Grid.Row centered>
                <Grid.Column width={6}>
                    <Form onSubmit={registerAllyCode} textAlign='center'>
                            <Form.Field
                                control={Input}
                                label={'AllyCode'}
                                placeholder={'allyCode'}
                                onChange={handleChange}
                                value={newAllyCode}
                            />
                            <Form.Field
                                control={Button}
                            >
                                Register
                            </Form.Field>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </Container>
}

export default AccountSelect