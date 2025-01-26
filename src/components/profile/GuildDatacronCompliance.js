import React, { useState, useEffect } from 'react';
import { Button, Header, Grid } from 'semantic-ui-react';
import { getDatacronTests, defaultGuildChecklistState } from '../../server/datacrons';
import { getGuildDatacronTestResults, displayAccordian } from '../../utils/datacrons';

function GuildDatacronCompliance ({session, redirect, account, displayMessage, datacrons}){

    const [guildDatacronTest, setGuildDatacronTest] = useState(defaultGuildChecklistState)
    const [testResults, setTestResults] = useState([])

    useEffect(() => {
		(async () => {
			redirect('guildDatacronCompliance')
            getDatacronTests(session, account.guildId, displayMessage, setGuildDatacronTest)
		})()
	}, [redirect, account.guildId, session, displayMessage])

    const runTest = () => {
        let testResults = getGuildDatacronTestResults(account.datacron, guildDatacronTest, datacrons)
        setTestResults(testResults)
    }

    return <div>
        <Grid>
            <Grid.Row centered>
            <Header as={'h1'}>Guild Datacron Compliance for {account.name}</Header>
            </Grid.Row>
            <Grid.Row>
            <Button floated='right' primary onClick={runTest} content='Run Test'/>
            </Grid.Row>
            <Grid.Row>
            </Grid.Row>
            <Grid.Row>
            {displayAccordian(testResults, guildDatacronTest, datacrons)}
            </Grid.Row>
        </Grid>
    </div>
}


export default GuildDatacronCompliance;
