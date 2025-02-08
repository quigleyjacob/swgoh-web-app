import React, { useEffect, useState } from 'react';
import { Step, Modal, Button, Grid } from 'semantic-ui-react';

function Steps ({step, steps, changeStep}){

	useEffect(() => {
		// props.redirect('home')
	})

    const [modalOpen, setModalOpen] = useState(false)

    const handleStepClick = (e, obj) => {
        let newStep = obj.id
        if(newStep === 0) {
            setModalOpen(true)
            console.log('Need to setup confirmation modal, don\'t want to accidentally close GAC plan')
        } else {
            changeStep(newStep)
        }
    }

	return (<Grid.Column>
    <Step.Group ordered fluid>
            {steps.map((obj, index) => {
                return <Step completed={step > index} active={step === index} id={index} key={index} onClick={handleStepClick}>
                <Step.Content>
                    <Step.Title>{obj.title}</Step.Title>
                    <Step.Description>{obj.description}</Step.Description>
                </Step.Content>
                </Step>
            })}
        </Step.Group>
    <Modal
        onClose={() => setModalOpen(false)}
        onOpen={() => setModalOpen(true)}
        open={modalOpen}
    >
        <Modal.Header>
            Confirm Action
        </Modal.Header>
        <Modal.Content>
            This action will take you back to the information stage. You will have to reload your GAC plan to continue. Are you sure you want to perform this action?
        </Modal.Content>
        <Modal.Actions>
            <Button color='black' onClick={() => setModalOpen(false)}>
                Close
            </Button>
            <Button
                positive
                // icon='checkmark'
                onClick={() => {changeStep(0);setModalOpen(false)}}
            >
                Confirm
            </Button>
        </Modal.Actions>
    </Modal>
    </Grid.Column>
    )
}

export default Steps;