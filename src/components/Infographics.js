import React, { useEffect } from 'react';
import { Container, Grid, Header, Image } from 'semantic-ui-react';

function Infographics (){

	useEffect(() => {
		// props.redirect('home')
	})

    const URL = 'https://swgoh-images.s3.us-east-2.amazonaws.com'

    const getImage = (name) => `${URL}/${name}.png`

    const getImages = (array) => {
        return array.map(name => {
            return <Grid.Column>
            <Image src={getImage(name)}/>
        </Grid.Column>
        })
    }

    const imageGroups = [
        {size: 2, title: 'Reva Mission', images: ['reva-mission-modding']},
        {size: 2, title: "Rise of the Empire CMs", images: ['mustafar', 'corellia', 'coruscant', 'geonosis', 'felucia', 'bracca', 'dathomir', 'tatooine', 'kashyyyk', 'haven-class-medical-station', 'kessel', 'lothal']},
        {size: 1, title: 'Datacrons', images: ['datacron-set6-inquisitors', 'datacron-set6-droids', 'datacron-set6-scoundrels']}
    ]

    // @ts-ignore
    const arrayChunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size))

    const displayImageGroups = () => {
        return imageGroups.map(({size, title, images}) => {
            return <Grid.Row centered>
                    <Grid>
                        <Grid.Row centered>
                            <Header textAlign='center' size='huge'>{title}</Header>
                        </Grid.Row>
                        {
                         arrayChunks(images, size).map(chunk => {
                            console.log(chunk)
                            // @ts-ignore
                            return <Grid.Row columns={size} centered>
                                {
                                    getImages(chunk)
                                }
                            </Grid.Row>
                         })
                        }
                    </Grid>
                </Grid.Row>
        })
    }

	return <Container>
        <Grid>
        {displayImageGroups()}
    </Grid>
    </Container>
}

export default Infographics;