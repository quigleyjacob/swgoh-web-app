export const methodOptions = [
    { key: 'GET', text: 'GET', value: 'GET' },
    { key: 'POST', text: 'POST', value: 'POST' }
]

export const locationOptions = [
  { key: 'body', text: 'Body', value: 'body' },
  { key: 'query', text: 'Query', value: 'query' },
  { key: 'header', text: 'Header', value: 'header' },
  { key: 'path', text: 'Path', value: 'path' }
]

export const DEFAULT_SETTINGS = {
  gacEndpoint: {
    enabled: true,
    method: '',
    url: '',
    allyCodeLocation: '',
    key: '',
    optionalSettings: []
  }
}

export const DEFAULT_OPTIONAL_SETTINGS = {
  location: '',
  key: '',
  value: ''
}