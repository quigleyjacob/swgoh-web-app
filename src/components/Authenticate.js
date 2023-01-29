import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'

function Authenticate (props){

    const [searchParams, setSearchParams] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState('')

    // @ts-ignore
    useEffect(() => {
        async function setSession() {
            let state = searchParams.get('state')
            let code = searchParams.get('code')
            let body = {
                state: state,
                code: code
            }
            let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/authenticate`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                }
            )
            if(response.ok) {
                let session = await response.text()
                console.log(session)
                props.setSession(session)
                document.cookie = `session=${session}`
                window.location.replace('/accountSelect')
            } else {
                setErrorMessage(await response.text())
                console.log(response)
            }
        }
        setSession()
    })

	return <div>
            <h1>Authenticating User </h1>
            {errorMessage}
        </div>
}

export default Authenticate;