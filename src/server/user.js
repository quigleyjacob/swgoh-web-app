import { DEFAULT_SETTINGS } from "../utils/settings"

export const normalizeSettings = (value) => {
    console.log(value)
    const baseSettings = value && typeof value === 'object' ? value : {}
    const currentGacEndpoint = baseSettings.gacEndpoint && typeof baseSettings.gacEndpoint === 'object'
        ? baseSettings.gacEndpoint
        : {}

    return {
        ...baseSettings,
        gacEndpoint: {
            enabled: currentGacEndpoint.enabled ?? DEFAULT_SETTINGS.gacEndpoint.enabled,
            method: currentGacEndpoint.method || DEFAULT_SETTINGS.gacEndpoint.method,
            url: currentGacEndpoint.url || DEFAULT_SETTINGS.gacEndpoint.url,
            allyCodeLocation: currentGacEndpoint.allyCodeLocation || DEFAULT_SETTINGS.gacEndpoint.allyCodeLocation,
            key: currentGacEndpoint.key || DEFAULT_SETTINGS.gacEndpoint.key,
            optionalSettings: currentGacEndpoint.optionalSettings || DEFAULT_SETTINGS.gacEndpoint.optionalSettings
        }
    }
}

export async function getSettings(session, setSettings, displayMessage) {
        if(session) {
        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/user/discordId/settings`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json', session}
        })
        if(response.ok) {
            let settings = await response.json()
            setSettings(normalizeSettings(settings))
        } else {
            if(response.status !== 404) {
                let error = await response.text()
                displayMessage(error)
            }
        }
    }
}

export async function updateSettings(session, settings, displayMessage) {
    if(session) {
        const payload = (() => {
            const normalizedSettings = normalizeSettings(settings)
            if ([normalizedSettings.gacEndpoint.method, normalizedSettings.gacEndpoint.url, normalizedSettings.gacEndpoint.allyCodeLocation, normalizedSettings.gacEndpoint.key]
                .every((value) => (typeof value === 'string' ? value.trim() === '' : !value))) {
                const { gacEndpoint, ...rest } = normalizedSettings
                return rest
            }
            return normalizedSettings
        })()

        let response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/api/discord/user/discordId/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                session
            },
            body: JSON.stringify(payload)
        })
        if(response.ok) {
            displayMessage('Settings updated successfully', true)
        } else {
            let error = await response.text()
            displayMessage(error)
        }
    }
}