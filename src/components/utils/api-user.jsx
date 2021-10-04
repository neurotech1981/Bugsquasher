// api-user.js
import axios from 'axios'

export const registerUser = async (user) => {
  try {
    const response = await fetch('/api/users/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    })
    return response.json()
  } catch (err) {
    return console.log(err)
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await fetch('/accounts/glemt-passord/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(email)
    })
    return response.json()
  } catch (err) {
    return console.log(err)
  }
}

export const changePassword = async (token, password, passwordConfirm, credentials) => {
  try {
    const response = await fetch('/accounts/tilbakestill-passord/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: credentials
      },
      body: JSON.stringify(token, password, passwordConfirm)
    })
    return response.json()
  } catch (err) {
    return console.log(err)
  }
}

export const changePasswordProfile = async (_id, password, passwordConfirm,credentials) => {
  try {
    console.log("Inside change password profile")
    const response = await fetch('/api/change-password/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: credentials
      },
      body: JSON.stringify(_id, password, passwordConfirm)
    })
    return response.json()
  } catch (err) {
    return console.log(err)
  }
}

export const getUsers = async (credentials) => {
  try {
    const response = await fetch('/api/userslist/', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: credentials
      }
    })
    return response.json()
  } catch (err) {
    return console.log(err)
  }
}

export const findUserProfile = async (params, credentials) => {
  try {
    const response = await fetch('/api/users/' + params.userId, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: credentials
      },
    })
    return response.json()
  } catch (err) {
    return console.error(err)
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
      await axios.delete('/api/removeUser', {
      data: {
        _id: params.userId
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: credentials
      },
    })
  } catch (err) {
    return console.error("Something went wrong: ", err)
  }
}
