// @ts-nocheck
import React, { useEffect } from 'react';
import { Button, Grid, GridColumn, Header, Icon } from 'semantic-ui-react'



function Login ({redirect}){

    useEffect(() => {
        redirect('login')
    })


    const handleClick = async () => {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/authURL`, {
                method: 'POST'
            })
        if(response.ok) {
            let URL = await response.text()
            window.location.replace(URL)
        } else {
            console.log(response)
        }
    }

	return <div>

        <Header size='huge' textAlign='center'>Login</Header>
        <Grid>
            <GridColumn textAlign='center'>
                <Button color='violet' onClick={handleClick}><Icon name='discord'></Icon>Login with Discord</Button>
            </GridColumn>
        </Grid>
            
    </div>
}

export default Login;
