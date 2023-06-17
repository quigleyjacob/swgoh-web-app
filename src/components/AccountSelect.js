import React, { useEffect, useState, useCallback } from 'react'
import { List, Header, Grid, GridColumn, Icon, Form, Input, Button, Container, Modal, Image, Checkbox } from 'semantic-ui-react'

function AccountSelect({session, redirect, navigate, setAllyCode, setGuildId, setName, displayMessage}) {

    const [accounts, setAccounts] = useState({})
    const [newAllyCode, setNewAllyCode] = useState('')
    const [verifyModal, setVerifyModal] = useState(false)
    const [verifyData, setVerifyData] = useState({})
    const [errorModal, setErrorModal] = useState(false)
    const [registerLoading, setRegisterLoading] = useState(false)
    const [primary, setPrimary] = useState(false)

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
        setPrimary(accounts.length === 0)
        setRegisterLoading(true)
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
                    setVerifyModal(true)
                    setVerifyData(await response.json())
                } else {
                    console.log(await response.text())
                    displayMessage('Unable to register this allycode', false)
                }
            } else {
                console.log(await verification.text())
                displayMessage('Unable to verify this allyCode', false)
            }
        }
        setRegisterLoading(false)
    }

    const verifyAccount = async () => {
        setRegisterLoading(true)
        let body = {
            session: session,
            allyCode: newAllyCode,
            isPrimary: String(primary)
        }
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(body)
          })
        if(response.ok) {
            let body = await response.json()
            console.log(body)
            if(body.verified) {
                await getAccounts()
                displayMessage('Account Verified', true)
                setNewAllyCode('')
                setVerifyModal(false)
            } else {
                setErrorModal(true)
            }
        }
        setRegisterLoading(false)
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

        <Modal
            onClose={() => setVerifyModal(false)}
            onOpen={() => setVerifyModal(true)}
            open={verifyModal}
        >
            <Modal.Header>Verify Account</Modal.Header>
            <Modal.Content image>
                <Image size='medium' wrapped src={`https://game-assets.swgoh.gg/${verifyData?.unlockedPlayerPortrait?.icon}.png`}/>
          <Modal.Description>
            {
                verifyData.verified
                ?
                <p>
                QuigBot is a participant in the SWGOH registry of allycodes & Discord IDs.
                This allycode is <strong>already verified</strong>.
                To reverify ownership of the allycode registered, set your in game title and portrait to what is shown & then click verify.
                Verification is optional, but ensures no one can register your allycode to a different ID in the registry.
                </p>
                :
                <p>
                QuigBot is a participant in the SWGOH registry of allycodes & Discord IDs.
                To verify ownership of the allycode registered, set your in game title and portrait to what is shown & then click verify.
                Verification is optional, but ensures no one can register your allycode to a different ID in the registry.
                </p>
            }
            <p>
            <strong>Title: </strong> {verifyData?.unlockedPlayerTitle?.name}
            </p>
            <p>
            <strong>Portrait: </strong> {verifyData?.unlockedPlayerPortrait?.name}
            </p>
            <Checkbox checked={primary} label='Set as primary account?' onClick={() => setPrimary(!primary)}/>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
        <Button
            color='black'
            onClick={async () => {
                await getAccounts()
                setNewAllyCode('')
                setVerifyModal(false)
            }}
            content='Skip Verification'
        />
        <Button
            content="Verify"
            labelPosition='right'
            icon={'checkmark'}
            loading={registerLoading}
            onClick={async () => {
                await verifyAccount()
            }}
            positive
        />
        </Modal.Actions>
        </Modal>

        <Modal
            onClose={() => setErrorModal(false)}
            onOpen={() => setErrorModal(true)}
            open={errorModal}
        >
            <Modal.Header>Unable to Verify</Modal.Header>
            <Modal.Content>
          <Modal.Description>
            <p>
            Unable to verify. Please double check you have set the correct title and portrait & then click verify again.
            </p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            content="Okay"
            onClick={() =>setErrorModal(false)}
          />
        </Modal.Actions>
        </Modal>

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
                            <Icon.Group>
                                <Icon name='user' color={account.primary ? 'black' : 'grey'}/>
                                <Icon color={account.verified ? "green" : "yellow"} name={account.verified ? "checkmark" : "warning"} corner="bottom right" />
                            </Icon.Group>
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
                            <Button primary loading={registerLoading} content='Register'/>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </Container>
}

export default AccountSelect