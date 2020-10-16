// api-auth.js
export const signin = async (user) => {
  try {
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
