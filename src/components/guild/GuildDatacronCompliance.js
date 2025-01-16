import React, { useState, useEffect } from 'react';
import { Button, Header, Grid, Accordion, Icon, Form } from 'semantic-ui-react';
import { getDatacronTests, defaultGuildChecklistState } from '../../server/datacrons';
import { getGuildDatacronTestResults, displayAccordian } from '../../utils/datacrons';
import Datacron from '../profile/Datacron';

function GuildDatacronCompliance ({session, redirect, guild, displayMessage, datacrons}){

    const [guildDatacronTest, setGuildDatacronTest] = useState(defaultGuildChecklistState)
    const [testResults, setTestResults] = useState([])
    const [playerGroup, setPlayerGroup] = useState(true)

    useEffect(() => {
		(async () => {
			redirect('guildDatacronCompliance')
            setGuildDatacronTest(await getDatacronTests(session, guild.id, displayMessage))
		})()
	}, [redirect, guild.id, session, displayMessage])

    const runTest = () => {
        if(!guild?.roster) {
            displayMessage('Guild member rosters not found. Please load guild member rosters to run datacron tests.')
        }
        let testResults = guild.roster.map(member => {
            let results = getGuildDatacronTestResults(member, guildDatacronTest, datacrons)
            return {allyCode: member.allyCode, passed: results.filter(res => res.passed).length, results: results}
        })
        setTestResults(testResults)
    }

    function viewDatacronGroupedAccordion(testResults, guildDatacronTest, datacrons) {
        let rotatedTestResults = guildDatacronTest.active.list.map((test, index) => {
            let results = testResults.map(result => {
                result.results[index].allyCode = result.allyCode
                return result.results[index]
            })
            let passed = results.filter(res => res.passed).length

            return {
                test: test,
                passed: passed,
                results: results
            }
        })

        console.log(rotatedTestResults)
        return rotatedTestResults
        // .sort((a,b) => b.passed - a.passed)
        .map((result, index) => {
            let {test, results, passed} = result
            let name = passed === results.length ? 'check circle' : passed === 0 ? 'times circle' : 'warning circle'
            let color = passed === results.length ? 'green' : passed === 0 ? 'red' : 'yellow'

            return {
                key: index,
                title: {content: <span><Icon name={name} color={color}/>{`${test.title} (${passed}/${results.length} tests passed)`}</span>},
                content: {content: displayRotatedAccordion(test, results, guildDatacronTest, datacrons)}
            }
        })
    }

    function displayRotatedAccordion(test, testResults, guildDatacronTest, datacrons) {
        let score = testResults.map(result => result.score).reduce((sum, next) => sum += next, 0) / testResults.length
        return <div>
            Average Score: {+(Math.round(score + "e+3")  + "e-3")}
            <Accordion
                styled
                fluid
                exclusive={false}
                panels={displayRotatedTestResults(test, testResults, guildDatacronTest, datacrons)}
            />
            </div>
    }

    function displayRotatedTestResults(test, testResults, guildDatacronTest, datacrons) {
        // console.log(testResults, guildDatacronTest)
        let guildMemberMap = guild.rosterMap
        return testResults
        .sort((a,b) => b.score - a.score)
        .map((result, index) => {
            let name = result.passed ? 'check circle' : result.datacron ? 'warning circle' : 'times circle'
            let color = result.passed ? 'green' : result.datacron ? 'yellow' : 'red'
            return {
                key: index,
                title: {content: <span><Icon name={name} color={color}/>{`${guildMemberMap[result.allyCode].name} (Score: ${+(Math.round(result.score + "e+3")  + "e-3")})`}</span>},
                content: {content: result.datacron ? <Datacron datacron={result.datacron} datacrons={datacrons} simple={false} test={test} result={result}/> : <div>No Datacron Found</div>}
            }
        })
    }

    function displayTestResults(testResults, guildDatacronTest, datacrons) {
        
        let guildMemberMap = guild.rosterMap
        return testResults
        .sort((a,b) => b.passed - a.passed)
        .map((result, index) => {
            let { results, allyCode,passed } = result
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
        <Header size='huge' textAlign='center'>Guild Datacron Compliance</Header>
        <Grid>
            <Grid.Row>
                <Grid.Column>
                    <Form centered>
                        <Form.Group>
                        <Button.Group>
                            <Button primary={!playerGroup} onClick={() => setPlayerGroup(false)}>Datacron</Button>
                            <Button.Or />
                            <Button primary={playerGroup} onClick={() => setPlayerGroup(true)}>Player</Button>
                        </Button.Group>
                        </Form.Group>
                        <Form.Group>
                        <Button icon='play' floated='right' primary onClick={runTest} content='Run Test'/>
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column>
                    <Accordion
                        styled
                        fluid
                        exclusive={false}
                        panels={playerGroup ? displayTestResults(testResults, guildDatacronTest, datacrons) : viewDatacronGroupedAccordion(testResults, guildDatacronTest, datacrons)}
                    />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </div>
}


export default GuildDatacronCompliance;
