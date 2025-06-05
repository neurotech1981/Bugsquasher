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

// Assign team to project
export const assignTeamToProject = async (projectId, teamId, role, auth) => {
    try {
        const response = await instance.post(
            `/api/projects/${projectId}/teams`,
            { teamId, role },
            { headers: { Authorization: auth } }
        )
        return response.data
    } catch (error) {
        console.error('Error assigning team to project:', error)
        return { error: error.response?.data?.message || error.message }
    }
}

// Remove team from project
export const removeTeamFromProject = async (projectId, teamId, auth) => {
    try {
        const response = await instance.delete(`/api/projects/${projectId}/teams/${teamId}`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error removing team from project:', error)
        return { error: error.response?.data?.message || error.message }
    }
}

// Get project teams
export const getProjectTeams = async (projectId, auth) => {
    try {
        const response = await instance.get(`/api/projects/${projectId}/teams`, { headers: { Authorization: auth } })
        return response.data
    } catch (error) {
        console.error('Error fetching project teams:', error)
        return { error: error.response?.data?.message || error.message }
    }
}

// Assign individual user to project
export const assignUserToProject = async (projectId, userId, role, permissions, auth) => {
    try {
        const response = await instance.post(
            `/api/projects/${projectId}/members`,
            { userId, role, permissions },
            { headers: { Authorization: auth } }
        )
        return response.data
    } catch (error) {
        console.error('Error assigning user to project:', error)
        return { error: error.response?.data?.message || error.message }
    }
}

// Remove individual user from project
export const removeUserFromProject = async (projectId, userId, auth) => {
    try {
        const response = await instance.delete(`/api/projects/${projectId}/members/${userId}`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error removing user from project:', error)
        return { error: error.response?.data?.message || error.message }
    }
}

// Update user role in project
export const updateUserRoleInProject = async (projectId, userId, role, permissions, auth) => {
    try {
        const response = await instance.put(
            `/api/projects/${projectId}/members/${userId}`,
            { role, permissions },
            { headers: { Authorization: auth } }
        )
        return response.data
    } catch (error) {
        console.error('Error updating user role in project:', error)
        return { error: error.response?.data?.message || error.message }
    }
}

// Get all project members (teams + individuals)
export const getProjectMembers = async (projectId, auth) => {
    try {
        const response = await instance.get(`/api/projects/${projectId}/members`, { headers: { Authorization: auth } })
        return response.data
    } catch (error) {
        console.error('Error fetching project members:', error)
        return { error: error.response?.data?.message || error.message }
    }
}

// Check user access to project
export const checkProjectAccess = async (projectId, userId, auth) => {
    try {
        const response = await instance.get(`/api/projects/${projectId}/access/${userId}`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error checking project access:', error)
        return { error: error.response?.data?.message || error.message }
    }
}
