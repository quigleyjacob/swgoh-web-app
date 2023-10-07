import React, { useState, useEffect } from 'react';
import { Button, Header, Grid, Accordion, Icon } from 'semantic-ui-react';
import { getDatacronTests, defaultGuildChecklistState } from '../../server/datacrons';
import { getGuildDatacronTestResults, displayAccordian } from '../../utils/datacrons';

function GuildDatacronCompliance ({session, redirect, guild, displayMessage, datacrons}){

    const [guildDatacronTest, setGuildDatacronTest] = useState(defaultGuildChecklistState)
    const [testResults, setTestResults] = useState([])

    useEffect(() => {
		(async () => {
			redirect('guildDatacronCompliance')
            setGuildDatacronTest(await getDatacronTests(session, guild.id, displayMessage))
		})()
	}, [redirect, guild.id, session, displayMessage])

    const runTest = () => {
        let testResults = guild.roster.map(member => {
            let results = getGuildDatacronTestResults(member, guildDatacronTest, datacrons)
            return {allyCode: member.allyCode, passed: results.filter(res => res.passed).length, results: results}
        })
        setTestResults(testResults)
    }

    function displayTestResults(testResults, guildDatacronTest, datacrons) {
        let guildMemberMap = guild.rosterMap
        return testResults
        .sort((a,b) => b.passed - a.passed)
        .map((result, index) => {
            let { results, allyCode,passed } = result
            if(index === 0) {
                console.log(result)
            }
            let name = passed === results.length ? 'check circle' : passed === 0 ? 'times circle' : 'warning circle'
            let color = passed === results.length ? 'green' : passed === 0 ? 'red' : 'yellow'
            return {
                key: index,
                title: {content: <span><Icon name={name} color={color}/>{`${guildMemberMap[allyCode].name} (${passed}/${results.length} tests passed)`}</span>},
                content: {content: displayAccordian(results, guildDatacronTest, datacrons)}
            }
        })
    }
    

    return <div>
        <Grid>
            <Grid.Row centered>
            <Header as={'h1'}>Guild Datacron Compliance</Header>
            </Grid.Row>
            <Grid.Row>
            <Button floated='right' primary onClick={runTest} content='Run Test'/>
            </Grid.Row>
            <Grid.Row>
            </Grid.Row>
            <Grid.Row>
            <Accordion
                styled
                fluid
                exclusive={false}
                panels={displayTestResults(testResults, guildDatacronTest, datacrons)}
            />
            </Grid.Row>
        </Grid>
    </div>
}


export default GuildDatacronCompliance;
