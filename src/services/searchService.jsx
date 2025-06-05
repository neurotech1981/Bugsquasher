import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:3001',
})

// Search across issues, projects, and users
export const searchAll = async (query, token) => {
    if (!query || query.length < 2) {
        return { issues: [], projects: [], users: [] }
    }

    try {
        const response = await instance.get('/api/search', {
            headers: { Authorization: token },
            params: { q: query },
        })

        return response.data || { issues: [], projects: [], users: [] }
    } catch (error) {
        console.error('Search API error:', error)
        return { issues: [], projects: [], users: [] }
    }
}

// Search only issues
export const searchIssues = async (query, token) => {
    if (!query || query.length < 2) {
        return []
    }

    try {
        const response = await instance.get('/api/search/issues', {
            headers: { Authorization: token },
            params: { q: query },
        })

        return response.data || []
    } catch (error) {
        console.error('Search issues error:', error)
        return []
    }
}

// Search only projects
export const searchProjects = async (query, token) => {
    if (!query || query.length < 2) {
        return []
    }

    try {
        const response = await instance.get('/api/search/projects', {
            headers: { Authorization: token },
            params: { q: query },
        })

        return response.data || []
    } catch (error) {
        console.error('Search projects error:', error)
        return []
    }
}

// Search only users
export const searchUsers = async (query, token) => {
    if (!query || query.length < 2) {
        return []
    }

    try {
        const response = await instance.get('/api/search/users', {
            headers: { Authorization: token },
            params: { q: query },
        })

        return response.data || []
    } catch (error) {
        console.error('Search users error:', error)
        return []
    }
}

export default {
    searchAll,
    searchIssues,
    searchProjects,
    searchUsers,
}
