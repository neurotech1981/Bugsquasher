// api-user.js

export const registerUser = async user => {
  console.log(JSON.stringify(user));
  try {
    const response = await fetch("/api/users/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    });
    return response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const getUsers = async credentials => {
  try {
    const response = await fetch("/api/userslist/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t
      }
    });
    return response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const findUserProfile = async (params, credentials) => {
  try {
    const response = await fetch("/api/users/" + params.userId, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t
      }
    });
    return response.json();
  } catch (err) {
    return console.error(err);
  }
};

export const deleteUser = async (params, credentials) => {
  try {
    const response = await fetch("/api/delete/" + params.userId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t
      },
      body: JSON.stringify()
    });
    return response.json();
  } catch (err) {
    return console.error(err);
  }
};
