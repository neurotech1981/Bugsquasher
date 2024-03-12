import axios from 'axios'

// Create a new project
export const createProject = async (data, auth) => {
    return await axios.post(`/api/project/new-project/`, data, {
        headers: { Authorization: auth },
    })
}

// Get all projects
export const getProjects = async (auth) => {
    return await axios.get('/api/project/list/', {
        headers: { Authorization: auth },
    })
}

// Get a specific project by id
export const getProject = async (auth, id) => {
    console.log('getProject: ', auth.t, ' ', id)
    const res = await axios.get(`/api/project/view/${id}`, {
        headers: { Authorization: auth.t },
    })
    console.log('res.data.data: ', res)
    return res.data || []
}

// Update a specific project by id
export const updateProject = async (id, data, auth) => {
    return await axios.post(`/api/project/update/${id}`, data, {
        headers: { Authorization: auth },
    })
}

// Delete a specific project by id
export const deleteProject = async (id, auth) => {
    return await axios.get(`/api/project/delete/${id}`, {
        headers: { Authorization: auth },
    })
}
