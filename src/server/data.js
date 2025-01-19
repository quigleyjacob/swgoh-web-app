export async function getNicknames(displayMessage, setNicknames) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/nicknames`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  })
  if(response.ok) {
    let nicknames = await response.json()
    nicknames.keys = Object.keys(nicknames.nicknames)
    setNicknames(nicknames)
  } else {
    displayMessage('Unable to retrieve nicknames data.', false)
  }
}

export async function getVisibleCategories(displayMessage, setCategories) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/category`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  })
  if(response.ok) {
    let categories = await response.json()
    setCategories(categories)
  } else {
    displayMessage('Unable to retrieve categories data.', false)
  }
}

export async function getPlayableUnits(displayMessage, setUnits) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/unit`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  })
  if(response.ok) {
    let units = await response.json()
    setUnits(units)
  } else {
    displayMessage('Unable to retrieve units data.', false)
  }
}

export async function getActiveDatacrons(displayMessage, setDatacrons) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/datacron`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  })
  if(response.ok) {
    let responseBody = await response.json()
    setDatacrons(responseBody.datacron)
  } else {
    displayMessage('Unable to retrieve datacrons data.', false)
  }
}

export async function getCurrency(session, displayMessage, setCurrencyMap) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/currency`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
  })
  if(response.ok) {
    let currency = await response.json()
    // eslint-disable-next-line
    let currencyMap = currency.reduce((map, obj) => (map[obj.id] = obj, map), {})
    setCurrencyMap(currencyMap)
  } else {
    displayMessage('Unable to retrieve currency data.', false)
  }
}

export async function getMaterial(session, displayMessage, setMaterialMap) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/material`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
  })
  if(response.ok) {
    let material = await response.json()
    // eslint-disable-next-line
    let materialMap = material.reduce((map, obj) => (map[obj.id] = obj, map), {})
    setMaterialMap(materialMap)
  } else {
    displayMessage('Unable to retrieve material data.', false)
  }
}

export async function getEquipment(session, displayMessage, setEquipmentMap) {
  let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/data/equipment`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json', session}
  })
  if(response.ok) {
    let equipment = await response.json()
    // eslint-disable-next-line
    let equipmentMap = equipment.reduce((map, obj) => (map[obj.id] = obj, map), {})
    setEquipmentMap(equipmentMap)
  } else {
    displayMessage('Unable to retrieve equipment data.', false)
  }
}