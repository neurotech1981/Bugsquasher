import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Add request interceptor to handle auth token
instance.interceptors.request.use(
    (config) => {
        const jwt = localStorage.getItem('jwt')
        if (jwt) {
            try {
                const parsed = JSON.parse(jwt)
                if (parsed && parsed.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`
                }
            } catch (err) {
                console.error('Error parsing JWT:', err)
                localStorage.removeItem('jwt')
                window.location.href = '/signin'
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add response interceptor to handle errors
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            console.log('401 error detected, clearing localStorage and redirecting to signin')
            localStorage.removeItem('jwt')
            // Only redirect if not already on signin page
            if (window.location.pathname !== '/signin') {
                window.location.href = '/signin'
            }
        }
        return Promise.reject(error)
    }
)

export default instance