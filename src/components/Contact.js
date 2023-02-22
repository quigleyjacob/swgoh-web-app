import React, { useState } from 'react';
import { Container, Form, Grid, Header } from 'semantic-ui-react';

function Contact ({displayMessage, setLoaderMessage, setLoaderVisible}){

    const [email, setEmail] = useState('')
    const [feedback, setFeedback] = useState('')

    const handleEmailChange = (e, obj) => {
        setEmail(e.target.value)
    }

    const handleFeedbackChange = (e, obj) => {
        setFeedback(obj.value)
    }

    function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }

    const handleSubmit = async () => {
        setLoaderMessage('Sending feedback to server.')
        setLoaderVisible(true)
        await sleep(500*Math.random())
        setLoaderVisible(false)
        setEmail('')
        setFeedback('')
        displayMessage('Thank you for the feedback!', true)
    }

	return <Container text>
        <Grid>
            <Grid.Row columns={1} centered>
            <Header size='huge' textAlign='center'>Contact Quig</Header>
            </Grid.Row>
            <Grid.Row columns={2}>
                <Grid.Column>
                The best way to get ahold of me is to DM me on discord (<strong>QuigMaster#4921</strong>). However, if you'd like to use this form to do so, by all means go for it.
                </Grid.Column>
                <Grid.Column>
                <Form onSubmit={handleSubmit}>
                    <Form.Input label='Email Address' onChange={handleEmailChange} value={email}/>
                    <Form.TextArea label='Feeback, Suggestion, etc.' onChange={handleFeedbackChange} value={feedback}/>
                    <Form.Button primary>Send</Form.Button>
                </Form>
                </Grid.Column>
            </Grid.Row>
        </Grid>
		
        <div>
        
        </div>



	</Container>
}

export default Contact;
