export function getCookieValue(key) {
    return document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)')?.pop() || ''
}

export function setCookie(key, value, expires=null) {
    if(expires)  {
        let expiresToUTC = new Date(expires).toUTCString()
         document.cookie = `${key}=${value}; expires=${expiresToUTC}; path=/`
    } else {
        document.cookie = `${key}=${value}`
    }
    
}

export function expireCookie(key) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}