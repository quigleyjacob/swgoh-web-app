import React, { useEffect } from 'react';
import { Header, Step } from 'semantic-ui-react';

function Steps ({step, steps}){

	useEffect(() => {
		// props.redirect('home')
	})

	return <div>
		<Step.Group ordered fluid>
            {steps.map((obj, index) => {
                return <Step completed={step > index} active={step === index} key={index}>
                <Step.Content>
                    <Step.Title>{obj.title}</Step.Title>
                    <Step.Description>{obj.description}</Step.Description>
                </Step.Content>
                </Step>
            })}
        </Step.Group>
	</div>
}

export default Steps;