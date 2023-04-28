// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'

function Authenticate ({setSession}){

    const [searchParams] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        (async() => {
            let state = searchParams.get('state')
            let code = searchParams.get('code')
            let body = {
                state: state,
                code: code,
                redirectUri: process.env.REACT_APP_REDIRECT_URL
            }
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/authenticate`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                }
            )
            if(response.ok) {
                let session = await response.text()
                setSession(session)
                document.cookie = `session=${session}`
                window.location.replace('/accountSelect')
            } else {
                setErrorMessage(await response.text())
                console.log(response)
            }
        })()
    })

	return <div>
        <h1> Authenticating User </h1>
        {errorMessage}
    </div>
}

export default Authenticate;