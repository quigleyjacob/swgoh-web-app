import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Form, Grid, Header, Message, Segment, Icon, Table, Radio } from 'semantic-ui-react'
import { getSettings, updateSettings, normalizeSettings } from '../server/user.js'
import { DEFAULT_SETTINGS, DEFAULT_OPTIONAL_SETTINGS, methodOptions, locationOptions } from '../utils/settings.js'

const buildEmptySettings = () => ({
  gacEndpoint: {
    ...DEFAULT_SETTINGS.gacEndpoint
  }
})

function Settings({ session, displayMessage = () => {}, allyCode }) {

  const isGacEndpointBlank = () => {
    return [settings.gacEndpoint.method, settings.gacEndpoint.url, settings.gacEndpoint.allyCodeLocation, settings.gacEndpoint.key]
      .every((value) => (typeof value === 'string' ? value.trim() === '' : !value)) && settings.gacEndpoint.optionalSettings.length === 0
  }

  const isGacEndpointEnabled = () => {
    return settings.gacEndpoint.enabled
  }

  const buildPayloadForServer = (value) => {
    const normalizedSettings = normalizeSettings(value)
    if (isGacEndpointBlank(normalizedSettings.gacEndpoint)) {
      const { gacEndpoint, ...rest } = normalizedSettings
      return rest
    }

    return normalizedSettings
  }

  const [settings, setSettings] = useState(() => normalizeSettings(buildEmptySettings()))

  const handleFieldChange = (field, value) => {
    setSettings((prevSettings) => {
      const newSettings = Array.isArray(prevSettings) ? [...prevSettings] : {...prevSettings}
      let current = newSettings

      const path = field.split(/[.[\]]/).filter(Boolean)

      for(let i = 0; i < path.length - 1; ++i) {
        let key = path[i]
        let nextKey = path[i+1]

        const isNextNumber = !isNaN(Number(nextKey))

        if(Array.isArray(current[key])) {
          current[key] = [ ...current[key] ]
        } else if(typeof current[key] === 'object' && current[key] !== null) {
          current[key] = { ...current[key] }
        } else {
          current[key] = isNextNumber ? [] : {}
        }

        current = current[key]
      }

      const finalKey = path[path.length - 1]
      current[finalKey] = value

      return newSettings
    })
  }

  const handleClearGacEndpoint = () => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      gacEndpoint: buildEmptySettings().gacEndpoint
    }))
  }

  const addNewRowToGacEndpointOptionalSettings = () => {
    const newSettings = JSON.parse(JSON.stringify(settings))
    newSettings.gacEndpoint.optionalSettings.push(JSON.parse(JSON.stringify(DEFAULT_OPTIONAL_SETTINGS)))
    setSettings(newSettings)
  }

  const deleteRowFromGacEndpointOptionalSettings = (index) => {
    setSettings(prevSettings => {
      const newSettings = JSON.parse(JSON.stringify(prevSettings))
      newSettings.gacEndpoint.optionalSettings.splice(index, 1)
      return newSettings
    })
  }

  const toggleGacEndpointEnabled = () => {
    setSettings(prevSettings => {
      const newSettings = JSON.parse(JSON.stringify(prevSettings))
      newSettings.gacEndpoint.enabled = !newSettings.gacEndpoint.enabled
      return newSettings
    })
  }

  useEffect(() => {
    if (session) {
      getSettings(session, setSettings, displayMessage)
    } else {
      setSettings(normalizeSettings(buildEmptySettings()))
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
    const { method, url, allyCodeLocation, key, optionalSettings } = settings.gacEndpoint

    if (isGacEndpointBlank(settings.gacEndpoint) || !isGacEndpointEnabled()) {
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

    optionalSettings.forEach((row, index) => {
      const location = row.location.trim()
      const key = row.key.trim()
      const value = row.key.trim()

      const displayRowNumber = index + 1
      if(location === '' || key === '' || value === '') {
        errors.push(`You need to include values for Location, Key, and Value for the optional setting row ${displayRowNumber}`)
      }

      if(location === 'body' && method !== 'POST') {
        errors.push(`Body is only valid when method is POST. Update location in optional setting row ${displayRowNumber}`)
      }

      if(!/^[a-zA-Z0-9_-]+$/.test(key)) {
        errors.push(`Use only letters, numbers, underscores, or dashes in key name in optional setting row ${displayRowNumber}`)
      }

      if(location === 'path' && !url.includes(`:${key}`)) {
        errors.push(`URL must include :${key}, update key in optional setting row ${displayRowNumber}`)
      }
    })

    return errors
  })()

  const displayConfiguration = () => {
    const method = settings.gacEndpoint.method
    let url = settings.gacEndpoint.url
    const headers = {}
    const body = {}
    const updateProperty = (location, key, value) => {
      switch(location) {
        case 'body':
          body[key] = value
          break
        case 'query':
          url += (url.includes('?') ? '&' : '?') + `${key}=${value}`
          break
        case 'header':
          headers[key] = value
          break
        case 'path':
          url = url.replace(`:${key}`, value)
          break
        default:
          console.log(`Unknown input: location=${location},key=${key},value=${value}`)
          break
      }
    }
    updateProperty(settings.gacEndpoint.allyCodeLocation, settings.gacEndpoint.key, allyCode)
    settings.gacEndpoint.optionalSettings.forEach(row => updateProperty(row.location, row.key, row.value))
    return (
      <Message info>
      <Message.Header>Your endpoint configuration looks good</Message.Header>
      <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', marginTop: '0.75rem' }}>
        {method && <div><strong>Method:</strong> {method}</div>}
        {url && <div><strong>Endpoint:</strong> {url}</div>}
        {Object.keys(headers).length > 0 && (
          <div>
            <strong>Headers:</strong>
            <pre style={{ marginTop: '0.25rem', marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(headers, null, 2)}
            </pre>
          </div>
        )}
        {Object.keys(body).length > 0 && (
          <div>
            <strong>Body:</strong>
            <pre style={{ marginTop: '0.25rem', marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(body, null, 2)}
            </pre>
          </div>
        )}

      </div>
      </Message>
    )
  }

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
                        <Radio 
                          toggle
                          label={`Endpoint ${settings.gacEndpoint.enabled ? 'enabled' : 'disabled'}`}
                          checked={settings.gacEndpoint.enabled}
                          onClick={toggleGacEndpointEnabled}
                        />
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
                        onChange={(_, data) => handleFieldChange('gacEndpoint.method', data.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>URL</label>
                        <Form.Input
                        value={settings.gacEndpoint.url}
                        onChange={(_, data) => handleFieldChange('gacEndpoint.url', data.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Ally Code Location</label>
                        <Dropdown
                        clearable
                        selection
                        options={locationOptions}
                        value={settings.gacEndpoint.allyCodeLocation || null}
                        onChange={(_, data) => handleFieldChange('gacEndpoint.allyCodeLocation', data.value)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Key</label>
                        <Form.Input
                        value={settings.gacEndpoint.key}
                        onChange={(_, data) => handleFieldChange('gacEndpoint.key', data.value)}
                        />
                    </Form.Field>
                    <Header as={'h4'}>Optional Settings</Header>
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Location</Table.HeaderCell>
                          <Table.HeaderCell>Key</Table.HeaderCell>
                          <Table.HeaderCell>Value</Table.HeaderCell>
                          <Table.HeaderCell>For AllyCode</Table.HeaderCell>
                          <Table.HeaderCell collapsing></Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {settings.gacEndpoint.optionalSettings.map((row, index) => {
                          const rowRef = `gacEndpoint.optionalSettings[${index}]`
                          return <Table.Row key={index}>
                            <Table.Cell>
                              <Dropdown
                                fluid
                                clearable
                                selection
                                options={locationOptions}
                                value={row.location}
                                placeholder='Location'
                                onChange={(_, data) => handleFieldChange(`${rowRef}.location`, data.value)}
                              />
                            </Table.Cell>
                            <Table.Cell>
                              <Form.Input
                                fluid
                                value={row.key}
                                placeholder='Key'
                                onChange={(_, data) => handleFieldChange(`${rowRef}.key`, data.value)}
                              />
                            </Table.Cell>
                            <Table.Cell>
                              <Form.Input
                                fluid
                                value={row.value}
                                placeholder="Value"
                                onChange={(_, data) => handleFieldChange(`${rowRef}.value`, data.value)}
                              />
                            </Table.Cell>
                            <Table.Cell>
                              <Form.Input
                                fluid
                                value={row.forAllyCode}
                                placeholder='AllyCode'
                                onChange={(_, data) => handleFieldChange(`${rowRef}.forAllyCode`, data.value)}
                              />
                            </Table.Cell>
                            <Table.Cell>
                              <Button
                                type='button'
                                icon
                                negative
                                basic
                                onClick={() => deleteRowFromGacEndpointOptionalSettings(index)}
                              >
                                <Icon name='trash'/>
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        })}
                      </Table.Body>

                    </Table>
                    <Button basic onClick={addNewRowToGacEndpointOptionalSettings} ><Icon name='plus'/>Add new row</Button>
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
                ) : isGacEndpointBlank() ? (
                    <Message info>
                    <Message.Header>Custom GAC endpoint settings are currently empty</Message.Header>
                    <p>Leave this section blank to disable the custom endpoint.</p>
                    </Message>
                ) : !isGacEndpointEnabled() ? (
                    <Message info>
                      <Message.Header>Custom GAC Endpoint is disabled</Message.Header>
                      <p>While disabled, validation will not be performed so you can save and come back to it later.</p>
                    </Message>
                ) :
                  displayConfiguration()
                }
                </Segment>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </Segment>
  )
}

export default Settings
