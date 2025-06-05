import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:3001',
})

// Create a new team
export const createTeam = async (data, auth) => {
    try {
        const response = await instance.post('/api/teams/new-team/', data, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error creating team:', error)
        return { error: error.message }
    }
}

// Get all teams
export const getTeams = async (auth) => {
    try {
        const response = await instance.get('/api/teams/list/', {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching teams:', error)
        return { error: error.message }
    }
}

// Get a specific team by id
export const getTeam = async (auth, id) => {
    try {
        const response = await instance.get(`/api/teams/${id}`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching team:', error)
        return { error: error.message }
    }
}

// Update a specific team by id
export const updateTeam = async (id, data, auth) => {
    try {
        const response = await instance.put(`/api/teams/${id}`, data, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error updating team:', error)
        return { error: error.message }
    }
}

// Delete a specific team by id
export const deleteTeam = async (id, auth) => {
    try {
        const response = await instance.delete(`/api/teams/${id}`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error deleting team:', error)
        return { error: error.message }
    }
}

// Add member to team
export const addTeamMember = async (teamId, userId, isLead, auth) => {
    try {
        const response = await instance.post(
            `/api/teams/${teamId}/members`,
            { userId, isLead },
            { headers: { Authorization: auth } }
        )
        return response.data
    } catch (error) {
        console.error('Error adding team member:', error)
        return { error: error.message }
    }
}

// Remove member from team
export const removeTeamMember = async (teamId, userId, auth) => {
    try {
        const response = await instance.delete(`/api/teams/${teamId}/members/${userId}`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error removing team member:', error)
        return { error: error.message }
    }
}

// Update team member role (lead/member)
export const updateTeamMemberRole = async (teamId, userId, isLead, auth) => {
    try {
        const response = await instance.put(
            `/api/teams/${teamId}/members/${userId}`,
            { isLead },
            { headers: { Authorization: auth } }
        )
        return response.data
    } catch (error) {
        console.error('Error updating team member role:', error)
        return { error: error.message }
    }
}

// Assign team to project with role
export const assignTeamToProject = async (projectId, teamId, roleId, auth) => {
    try {
        const response = await instance.post(
            `/api/projects/${projectId}/teams`,
            { teamId, roleId },
            { headers: { Authorization: auth } }
        )
        return response.data
    } catch (error) {
        console.error('Error assigning team to project:', error)
        return { error: error.message }
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
        return { error: error.message }
    }
}

// Get teams for a user
export const getUserTeams = async (userId, auth) => {
    try {
        const response = await instance.get(`/api/users/${userId}/teams`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching user teams:', error)
        return { error: error.message }
    }
}

// Get teams assigned to a project
export const getProjectTeams = async (projectId, auth) => {
    try {
        const response = await instance.get(`/api/projects/${projectId}/teams`, {
            headers: { Authorization: auth },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching project teams:', error)
        return { error: error.message }
    }
}

// Export all functions as default
export default {
    createTeam,
    getTeams,
    getTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    assignTeamToProject,
    removeTeamFromProject,
    getUserTeams,
    getProjectTeams,
}
