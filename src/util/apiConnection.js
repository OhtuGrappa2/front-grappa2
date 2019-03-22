import axios from 'axios'
import { getToken, setToken } from './common'
import { TOKEN_NAME, DEV_USER } from './constants'

const createApiUrl = (path) => {
    const API_PATHS = ['staging', 'v2']
    const mode = path.split('/')[1]
    return API_PATHS.includes(mode) ? `/${mode}/api` : '/api'
}
// Problems with api base path: /v2 or /api or even /
export const getAxios = () => {
    const hostUrl = window.location.origin
    const apiPath = createApiUrl(window.location.pathname)
    return axios.create({
        baseURL: `${hostUrl}${apiPath}`
    })
}

const isDevEnv = process.env.NODE_ENV === 'development'

const devDefaultOptions = {
    headers: {
        uid: 'dev',
        'unique-code': 'urn:schac:personalUniqueCode:int:studentID:helsinki.fi:012345678',
        givenname: 'Etunimi',
        sn: 'Sukunimi',
        mail: 'testi-email@example.com',
        'shib-session-id': 'mock-session',
        eduPersonAffiliation: 'student;member;staff;employee'
    }
}

const getDevOptions = () => {
    try {
        const options = localStorage.getItem(DEV_USER)
        if (!options) throw new Error('no')
        return JSON.parse(options)
    } catch (e) {
        localStorage.removeItem(DEV_USER)
        return devDefaultOptions
    }
}

export const login = async () => {
    const options = isDevEnv ? getDevOptions() : null
    const response = await getAxios().post('/login', null, options)
    return response.data.token
}

export const swapDevUser = async (newHeaders) => {
    const options = { headers: { ...getDevOptions().headers, ...newHeaders } }
    localStorage.setItem(DEV_USER, JSON.stringify(options))
    const token = await login()
    setToken(token)
}

export const callApi = async (url, method = 'get', data, prefix) => {
    const options = isDevEnv ? getDevOptions() : { headers: {} }
    const token = await getToken()
    options.headers['x-access-token'] = token

    if (prefix.includes('DOWNLOAD')) {
        options.responseType = 'arraybuffer'
        return getAxios().get(url, options)
    }

    switch (method) {
        case 'get':
            return getAxios().get(url, options)
        case 'post':
            return getAxios().post(url, data, options)
        case 'put':
            return getAxios().put(url, data, options)
        case 'delete':
            return getAxios().delete(url, options)
        default:
            return Promise.reject(new Error('Invalid http method'))
    }
}

export const callController = (route, prefix, data, method = 'get', query) => {
    const requestSettings = {
        route,
        method,
        data,
        prefix,
        query
    }
    return { type: `${prefix}ATTEMPT`, requestSettings }
}

export const handleRequest = store => next => async (action) => {
    next(action)
    const { requestSettings } = action
    if (requestSettings) {
        const {
            route, method, data, prefix, query
        } = requestSettings
        try {
            const res = await callApi(route, method, data, prefix)
            store.dispatch({ type: `${prefix}SUCCESS`, response: res.data, query })
        } catch (e) {
            // Something failed. Assume it's the token and try again.
            try {
                await getToken(true)
                const res = await callApi(route, method, data, prefix)
                store.dispatch({ type: `${prefix}SUCCESS`, response: res.data, query })
            } catch (err) {
                if (err.response.status === 403) return
                store.dispatch({ type: `${prefix}FAILURE`, response: err, query })
            }
        }
    }
}

export const logout = async () => {
    const stagingPath = '/staging'
    const returnUrl = window.location.pathname.includes(stagingPath) ?
        `${window.location.origin}${stagingPath}` : window.location.origin
    const response = await getAxios().delete('/logout', { data: { returnUrl } })
    localStorage.removeItem(TOKEN_NAME)
    window.location = response.data.logoutUrl
}

export const sendLog = async data => callApi('/log', 'post', data)
