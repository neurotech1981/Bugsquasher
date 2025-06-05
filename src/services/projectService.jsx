import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:3001',
})

// Create a new project
export const createProject = async (data, auth) => {
    return await instance.post(`/api/projects/new-project/`, data, {
        headers: { Authorization: auth },
    })
}

// Get all projects
export const getProjects = async (auth) => {
    try {
        const response = await instance.get('/api/projects/list/', {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching projects:', error)
        return { error: error.message }
    }
}

// Get a specific project by id
export const getProject = async (auth, id) => {
    console.log('getProject: ', auth.t, ' ', id)
    const res = await instance.get(`/api/projects/view/${id}`, {
        headers: { Authorization: auth.t },
    })
    console.log('res.data.data: ', res)
    return res.data || []
}

// Update a specific project by id
export const updateProject = async (id, data, auth) => {
    try {
        const response = await instance.post(`/api/projects/update/${id}`, data, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error updating project:', error)
        return { error: error.message }
    }
}

// Delete a specific project by id
export const deleteProject = async (id, auth) => {
    try {
        const response = await instance.get(`/api/projects/delete/${id}`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error deleting project:', error)
        return { error: error.message }
    }
}
