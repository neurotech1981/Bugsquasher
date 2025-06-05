// api-auth.js
import api from './api-config'

export default {
    SignIn: async (auth) => {
        try {
            const res = await api.post('/api/auth/signin', auth)
            if (res.data.token) {
                // Store both token and user data
                const jwt = {
                    token: res.data.token,
                    user: res.data.user
                }
                localStorage.setItem('jwt', JSON.stringify(jwt))
            }
            return res.data
        } catch (error) {
            throw error
        }
    },
    SignOut: async () => {
        try {
            const res = await api.post('/api/auth/signout')
            localStorage.removeItem('jwt')
            return res.data
        } catch (error) {
            throw error
        }
    },
}

/* export const signin = async (user) => {
  try {
    console.log("Inside Signin fetch")
    const response = await fetch('/auth/signin/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(user)
    })
    return response.json()
  } catch (err) {
    return console.log(err)
  }
}

export const signout = async () => {
  try {
    const response = await fetch('/auth/signout/', {
      method: 'GET'
    })
    return response.json()
  } catch (err) {
    return console.log(err)
  }
}
 */
