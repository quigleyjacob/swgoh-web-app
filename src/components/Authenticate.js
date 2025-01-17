// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setCookie } from '../utils/cookie';

function Authenticate ({setSession}){

    const navigate = useNavigate()

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
                let {sessionId: session, expiration} = await response.json()
                setSession(session)
                setCookie("session", session, expiration)
                navigate('/accountSelect')
            } else {
                setErrorMessage(await response.text())
                console.log(response)
            }
        })()
    }, [searchParams, setSession, navigate])

	return <div>
        <h1> Authenticating User </h1>
        {errorMessage}
    </div>
}

export default Authenticate;