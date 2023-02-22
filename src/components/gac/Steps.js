import React, { useEffect } from 'react';
import { Step } from 'semantic-ui-react';

function Steps ({step, steps, changeStep}){

	useEffect(() => {
		// props.redirect('home')
	})

    const handleClick = (e, obj) => {
        if(step > 0) {
            let step = obj.id
            changeStep(step)
        }

    }

	return <Step.Group ordered fluid stackable='tablet'>
            {steps.map((obj, index) => {
                return <Step completed={step > index} active={step === index} id={index} key={index} link={step > 0} onClick={handleClick}>
                <Step.Content>
                    <Step.Title>{obj.title}</Step.Title>
                    <Step.Description>{obj.description}</Step.Description>
                </Step.Content>
                </Step>
            })}
        </Step.Group>
}

export default Steps;