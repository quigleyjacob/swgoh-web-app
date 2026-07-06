import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Form, Grid, Header, Message, Segment, Icon } from 'semantic-ui-react'
import { getSettings, updateSettings } from '../server/user.js'

const methodOptions = [
    { key: 'GET', text: 'GET', value: 'GET' },
    { key: 'POST', text: 'POST', value: 'POST' }
]

const allyCodeLocationOptions = [
  { key: 'body', text: 'Body', value: 'body' },
  { key: 'query', text: 'Query', value: 'query' },
  { key: 'header', text: 'Header', value: 'header' },
  { key: 'path', text: 'Path', value: 'path' }
]

function Settings({ session, displayMessage = () => {}, allyCode }) {
  const buildEmptySettings = () => ({
    gacEndpoint: {
      method: '',
      url: '',
      allyCodeLocation: '',
      key: ''
    }
  })

  const normalizeSettings = (value) => {
    const baseSettings = value && typeof value === 'object' ? value : {}
    const currentGacEndpoint = baseSettings.gacEndpoint && typeof baseSettings.gacEndpoint === 'object'
      ? baseSettings.gacEndpoint
      : {}

    return {
      ...baseSettings,
      gacEndpoint: {
        method: currentGacEndpoint.method || '',
        url: currentGacEndpoint.url || '',
        allyCodeLocation: currentGacEndpoint.allyCodeLocation || '',
        key: currentGacEndpoint.key || ''
      }
    }
  }

  const isGacEndpointBlank = (gacEndpoint = {}) => {
    return [gacEndpoint.method, gacEndpoint.url, gacEndpoint.allyCodeLocation, gacEndpoint.key]
      .every((value) => (typeof value === 'string' ? value.trim() === '' : !value))
  }

  const buildPayloadForServer = (value) => {
    const normalizedSettings = normalizeSettings(value)
    if (isGacEndpointBlank(normalizedSettings.gacEndpoint)) {
      const { gacEndpoint, ...rest } = normalizedSettings
      return rest
    }

    return normalizedSettings
  }

  const emptySettings = buildEmptySettings()
  const [settings, setSettings] = useState(() => normalizeSettings(emptySettings))

  const handleFieldChange = (field, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      gacEndpoint: {
        ...prevSettings.gacEndpoint,
        [field]: value
      }
    }))
  }

  const handleClearGacEndpoint = () => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      gacEndpoint: buildEmptySettings().gacEndpoint
    }))
  }

  useEffect(() => {
    if (session) {
      getSettings(session, setSettings, displayMessage)
    } else {
      setSettings(normalizeSettings(emptySettings))
    }
  }, [session, displayMessage])

  const handleSave = async () => {
    if (validationErrors.length > 0 || !session) {
      return
    }

    const payload = buildPayloadForServer(settings)
    await updateSettings(session, payload, displayMessage)
  }

  const validationErrors = (() => {
    const errors = []
    const { method, url, allyCodeLocation, key } = settings.gacEndpoint

    if (isGacEndpointBlank(settings.gacEndpoint)) {
      return errors
    }

    const trimmedUrl = url.trim()
    const trimmedKey = key.trim()

    if (!method) {
      errors.push('Select a method for the endpoint.')
    }

    if (!allyCodeLocation) {
      errors.push('Select an Ally Code Location.')
    }

    if (!trimmedUrl) {
      errors.push('Enter a URL for the endpoint.')
    } else {
      try {
        const parsedUrl = new URL(trimmedUrl)
        if (!parsedUrl.protocol || !parsedUrl.hostname) {
          errors.push('Enter a valid URL, including a protocol such as http:// or https://.')
        }
      } catch (error) {
        errors.push('Enter a valid URL, including a protocol such as http:// or https://.')
      }
    }

    if (!trimmedKey) {
      errors.push('Enter a key name for the ally code parameter.')
    } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedKey)) {
      errors.push('Use only letters, numbers, underscores, or dashes in the key name.')
    }

    if (allyCodeLocation === 'body' && method !== 'POST') {
      errors.push('Body is only valid when the method is POST. Change the method to POST or switch the ally code location to Query, Header, or Path.')
    }

    if (allyCodeLocation === 'path') {
      if (!trimmedKey) {
        errors.push('When Ally Code Location is Path, add a key name so the URL can include :<key>.')
      } else if (!trimmedUrl.includes(`:${trimmedKey}`)) {
        errors.push(`When Ally Code Location is Path, the URL must include :${trimmedKey}. For example: http://localhost:3000/api/player/:${trimmedKey}`)
      }
    }

    return errors
  })()

  return (
    <Segment>
        <Grid centered>
            <Grid.Row floated='right'>
                <Grid.Column textAlign='right'>
                     <Button color='green' icon='save' disabled={validationErrors.length > 0 || !session} onClick={handleSave}><Icon name='save'/>Save Settings</Button>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
               <Header size='huge' textAlign='center'>Settings</Header>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <Segment>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <Header as='h2'>GAC Endpoint</Header>
                            <Button basic color='red' onClick={handleClearGacEndpoint}>Clear</Button>
                        </div>
                        <Message warning>
                            <Message.Header>Advanced configuration</Message.Header>
                            <p>If you do not know what this section is for, you should not configure it.</p>
                        </Message>
                    <Form>
                    <Form.Field>
                        <label>Method</label>
                        <Dropdown
                        clearable
                        selection
                        options={methodOptions}
                        value={settings.gacEndpoint.method || null}
                        onChange={(_, data) => handleFieldChange('method', data.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>URL</label>
                        <Form.Input
                        value={settings.gacEndpoint.url}
                        onChange={(_, data) => handleFieldChange('url', data.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Ally Code Location</label>
                        <Dropdown
                        clearable
                        selection
                        options={allyCodeLocationOptions}
                        value={settings.gacEndpoint.allyCodeLocation || null}
                        onChange={(_, data) => handleFieldChange('allyCodeLocation', data.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Key</label>
                        <Form.Input
                        value={settings.gacEndpoint.key}
                        onChange={(_, data) => handleFieldChange('key', data.value)}
                        />
                    </Form.Field>
                    </Form>
                

                {validationErrors.length > 0 ? (
                    <Message negative>
                    <Message.Header>There are some issues with your configuration</Message.Header>
                    <Message.List>
                        {validationErrors.map((error) => (
                        <Message.Item key={error}>{error}</Message.Item>
                        ))}
                    </Message.List>
                    </Message>
                ) : isGacEndpointBlank(settings.gacEndpoint) ? (
                    <Message info>
                    <Message.Header>Custom GAC endpoint settings are currently empty</Message.Header>
                    <p>Leave this section blank to disable the custom endpoint.</p>
                    </Message>
                ) : (
                    <Message info>
                    <Message.Header>Your endpoint configuration looks good</Message.Header>
                    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', marginTop: '0.75rem' }}>
                      {settings.gacEndpoint.method && <div><strong>Method:</strong> {settings.gacEndpoint.method}</div>}
                      {settings.gacEndpoint.url && !['query', 'path'].includes(settings.gacEndpoint.allyCodeLocation) && (
                        <div><strong>Endpoint:</strong> {settings.gacEndpoint.url}</div>
                      )}
                      {settings.gacEndpoint.allyCodeLocation === 'body' && (
                        <div>
                          <strong>Body:</strong>
                          <pre style={{ marginTop: '0.25rem', marginBottom: 0, whiteSpace: 'pre-wrap' }}>
{JSON.stringify({ [settings.gacEndpoint.key || 'allyCode']: allyCode || 'loggedInAllyCode' }, null, 2)}
                          </pre>
                        </div>
                      )}
                      {settings.gacEndpoint.allyCodeLocation === 'header' && (
                        <div>
                          <strong>Headers:</strong>
                          <pre style={{ marginTop: '0.25rem', marginBottom: 0, whiteSpace: 'pre-wrap' }}>
{JSON.stringify({ [settings.gacEndpoint.key || 'allyCode']: allyCode || 'loggedInAllyCode' }, null, 2)}
                          </pre>
                        </div>
                      )}
                      {settings.gacEndpoint.allyCodeLocation === 'query' && (
                        <div>
                          <strong>Endpoint:</strong> {(settings.gacEndpoint.url || 'https://example.com').includes('?')
                            ? `${settings.gacEndpoint.url || 'https://example.com'}&${settings.gacEndpoint.key || 'allyCode'}=${allyCode || 'loggedInAllyCode'}`
                            : `${settings.gacEndpoint.url || 'https://example.com'}?${settings.gacEndpoint.key || 'allyCode'}=${allyCode || 'loggedInAllyCode'}`}
                        </div>
                      )}
                      {settings.gacEndpoint.allyCodeLocation === 'path' && (
                        <div>
                          <strong>Endpoint:</strong> {(settings.gacEndpoint.url || 'https://example.com').replace(/:([^/]+)/g, allyCode || 'loggedInAllyCode')}
                        </div>
                      )}
                    </div>
                    </Message>
                )}
                </Segment>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </Segment>
  )
}

export default Settings
