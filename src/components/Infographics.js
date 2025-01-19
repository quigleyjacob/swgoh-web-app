import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, Container, Grid, Image, List } from 'semantic-ui-react';

function Infographics (){

    const [infographics, setInfographics] = useState({})
    const [activeImage, setActiveImage] = useState('')
    
    const getInfographics = useCallback(async () => {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/infographics`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
    if(response.ok) {
        let data = await response.json()
        setInfographics(data)
    } else {
        console.log(response)
    }
    }, [])

    useEffect(() => {
        getInfographics()
	}, [getInfographics])

    const URL = 'https://swgoh-images.s3.us-east-2.amazonaws.com/infographics'

    const getImage = (name) => `${URL}/${name}.png`

    const handleClick = (e, target) => {
        console.log(e, target)
        setActiveImage(target.id)
    }

    const getImagesList = (type, images) => {
        return <List>
            {
                images.map(image => {
                    return <List.Item as={'a'} key={image.type} id={`${type}/${image.type}`} onClick={handleClick}>
                            {image.name}
                    </List.Item>
                })
            }
        </List>
    }

    const rootPanels = () => {
        return infographics?.groups?.map(group => {
            return {
                key: group.type,
                title: group.name,
                content: {content: getImagesList(group.type, group.images)}
            }
        })
    }

        return <Grid>
            <Grid.Row>
                <Grid.Column width={4}>
                    <Accordion
                        styled
                        fluid
                        panels={rootPanels()}
                    />
                </Grid.Column>
                <Grid.Column width={12}>
                    <Container>
                        <Image src={activeImage === '' ? '/square-image.png' : getImage(activeImage)} />
                    </Container>
                </Grid.Column>
            </Grid.Row>
    </Grid>
}

export default Infographics;