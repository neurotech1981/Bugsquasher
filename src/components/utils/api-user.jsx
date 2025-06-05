// api-user.js
import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:3001',
})

export const registerUser = async (user) => {
    try {
        const response = await instance.post('/api/users', user, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        return response.data
    } catch (err) {
        console.error('Error in registerUser:', err)
        return { error: err.message }
    }
}

export const forgotPassword = async (email) => {
    try {
        const response = await instance.post('/api/accounts/forgot-password', email, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        return response.data
    } catch (err) {
        console.error('Error in forgotPassword:', err)
        return { error: err.message }
    }
}

export const changePassword = async (token, password, passwordConfirm, credentials) => {
    try {
        const response = await instance.post('/api/accounts/reset-password', {
            token,
            password,
            passwordConfirm
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials}`,
            }
        })
        return response.data
    } catch (err) {
        console.error('Error in changePassword:', err)
        return { error: err.message }
    }
}

export const changePasswordProfile = async (_id, password, passwordConfirm, credentials) => {
    try {
        const response = await instance.post('/api/change-password', {
            _id,
            password,
            passwordConfirm
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials}`,
            }
        })
        return response.data
    } catch (err) {
        console.error('Error in changePasswordProfile:', err)
        return { error: err.message }
    }
}

export const getUsers = async (credentials) => {
    try {
        console.log('Credentials in getUsers: ', credentials)
        const response = await instance.get('/api/users/list', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.t}`,
            }
        })
        return response.data
    } catch (err) {
        console.error('Error in getUsers:', err)
        return { error: err.message }
    }
}

export const findUserProfile = async (params, credentials) => {
    try {
        console.log('Credentials in findUserProfile: ', credentials, 'Params: ', params)

        if (!params) {
            console.error('No params object provided to findUserProfile')
            return { error: 'No params provided' }
        }

        if (!params.userId) {
            console.error('No userId provided to findUserProfile. Params:', params)
            return { error: 'No userId provided' }
        }

        if (!credentials?.t) {
            console.error('No credentials token provided to findUserProfile')
            return { error: 'No authentication token provided' }
        }

        console.log('Making request to:', `/api/users/${params.userId}`)
        console.log('With headers:', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        })

        const response = await instance.get(`/api/users/${params.userId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.t}`
            }
        })
        console.log('Response received:', response.data)
        return response.data
    } catch (err) {
        console.error('Error in findUserProfile:', err)
        if (err.response) {
            console.error('Error response:', {
                status: err.response.status,
                data: err.response.data,
                headers: err.response.headers
            })
        }
        return { error: err.message }
    }
}

export const updateUserProfile = async (userId, updateData, credentials) => {
    try {
        console.log('Updating user profile:', { userId, updateData })

        if (!userId) {
            console.error('No userId provided to updateUserProfile')
            return { error: 'No userId provided' }
        }

        if (!credentials) {
            console.error('No credentials token provided to updateUserProfile')
            return { error: 'No authentication token provided' }
        }

        const response = await instance.put(`/api/users/${userId}`, updateData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials}`
            }
        })

        console.log('Profile update response:', response.data)
        return response.data
    } catch (err) {
        console.error('Error in updateUserProfile:', err)
        if (err.response) {
            console.error('Error response:', {
                status: err.response.status,
                data: err.response.data,
                headers: err.response.headers
            })
        }
        return { error: err.message }
    }
}

/* export const addComment = async (data, credentials) => {
  console.log("Inside addcomment")
  try {
    const response = await fetch('/api/add-comment', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: credentials
      },
      body: JSON.stringify(data)
    })
    return response.json()
  } catch (err) {
    return console.error(err)
  }
} */

export const deleteUser = async (params, credentials) => {
    try {
        const response = await instance.delete('/api/users', {
            data: {
                _id: params.userId,
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials}`,
            }
        })
        return response.data
    } catch (err) {
        console.error('Error in deleteUser:', err)
        return { error: err.message }
    }
}
