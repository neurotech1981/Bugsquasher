// api-auth.js
import axios from "axios";
const instance = axios.create();

export default {
    SignIn: async (auth) => {
      const res = await instance.post("/auth/signin/", auth, {withCredentials: true});
      return res.data || [];
    },
    SignOut: async () => {
      const res = await instance.get("/auth/signout/");
      return res.data || [];
    }
};

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