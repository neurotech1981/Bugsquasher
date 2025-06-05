//  /services/issueServices.js

import axios from 'axios'
const instance = axios.create({
    baseURL: 'http://localhost:3001',
})

export default {
    getAll: async (auth, page = 1, limit = 10) => {
        const res = await instance.get('/api/issues/getData', {
            headers: { Authorization: auth },
            params: { page, limit },
        })
        return res.data
    },
    getComments: async (id, auth) => {
        try {
            if (!id) {
                console.error('No issue ID provided to getComments')
                return []
            }
            const res = await instance.get(`/api/issues/${id}/comments`, {
                headers: { Authorization: auth },
            })
            console.log('getComments response:', res.data)
            return res.data || []
        } catch (err) {
            console.error('Error in getComments:', err)
            return []
        }
    },
    getCommentsReplies: async (issueId, commentId, auth) => {
        const res = await instance.post(`/api/issues/${issueId}/comments/${commentId}/replies`, {
            headers: { Authorization: auth },
        })
        return res.data.data || []
    },
    getIssueByID: async (id, auth) => {
        const res = await instance.get(`/api/issues/${id}`, {
            headers: { Authorization: auth },
        })
        return res.data.data
    },
    upDateIssueStatus: async (id, data, auth) => {
        return await instance.patch(`/api/issues/${id}/status`, data, {
            headers: { Authorization: auth },
        })
    },
    upDateDelegated: async (id, data, auth) => {
        return await instance.patch(`/api/issues/${id}/delegated`, data, {
            headers: { Authorization: auth },
        })
    },
    updateComment: async (newContent, id, auth, commentID) => {
        return await instance.patch(
            `/api/issues/${id}/comments/${commentID}`,
            {
                content: newContent,
            },
            {
                headers: { Authorization: auth },
            }
        )
    },
    upDateIssue: async (id, data, auth) => {
        console.log('Sending request to:', `/api/issues/${id}`)
        try {
            const response = await instance.patch(`/api/issues/${id}`, data, {
                headers: { Authorization: auth },
            })
            console.log('Response received')
            return response
        } catch (error) {
            console.error('Request failed:', error)
            throw error
        }
    },
    addIssue: async (data, auth) => {
        return await instance.post(
            `/api/issues`,
            { data },
            {
                headers: { Authorization: auth },
            }
        )
    },
    addComment: async (data, auth, id) => {
        return await instance.post(`/api/issues/${id}/comments`, data, {
            headers: { Authorization: auth },
        })
    },
    addCommentReply: async (userID, data, auth, issueId, commentId, index) => {
        return await instance.post(
            `/api/issues/${issueId}/comments/${commentId}/replies`,
            {
                content: data,
                userID: userID,
                index: index,
            },
            {
                headers: { Authorization: auth },
            }
        )
    },
    addImageToIssue: async (issueID, name, auth) => {
        return await instance.post(
            `/api/issues/${issueID}/images`,
            {
                name: name,
            },
            {
                headers: { Authorization: auth },
            }
        )
    },
    deleteIssueByID: async (id, auth) => {
        return await instance.delete(`/api/issues/${id}`, {
            headers: { Authorization: auth },
        })
    },
    deleteImage: async (id, imageID, name, auth) => {
        return await instance.delete(`/api/issues/${id}/images/${imageID}`, {
            headers: { Authorization: auth },
        })
    },
    deleteComment: async (id, commentId, auth) => {
        return await instance.delete(`/api/issues/${id}/comments/${commentId}`, {
            headers: { Authorization: auth },
        })
    },
    deleteCommentReply: async (id, parentId, childId, auth) => {
        return await instance.delete(`/api/issues/${id}/comments/${parentId}/replies/${childId}`, {
            headers: { Authorization: auth },
        })
    },
    countIssues: async (auth) => {
        return await instance.get('/api/analytics/countIssues', {
            headers: { Authorization: auth },
        })
    },
    getTodaysIssues: async (auth) => {
        return await instance.get('/api/analytics/getTodaysIssues', {
            headers: { Authorization: auth },
        })
    },
    countSolvedIssues: async (auth) => {
        return await instance.get('/api/analytics/countSolvedIssues', {
            headers: { Authorization: auth },
        })
    },
    countOpenIssues: async (auth) => {
        return await instance.get('/api/analytics/countOpenIssues', {
            headers: { Authorization: auth },
        })
    },
    getLatestCases: async (auth) => {
        return await instance.get('/api/analytics/getLatestCases', {
            headers: { Authorization: auth },
        })
    },
    getThisYearCaseCount: async (auth, year) => {
        return await instance.get('/api/analytics/thisYearIssuesCount', {
            headers: { Authorization: auth },
            params: { year },
        })
    },
    getThisWeeklyCaseCount: async (auth) => {
        return await instance.get('/api/analytics/weekdayIssueCount', {
            headers: { Authorization: auth },
        })
    },
    getDailyIssueCount: async (auth) => {
        return await instance.get('/api/analytics/dailyIssueCount', {
            headers: { Authorization: auth },
        })
    },
    getAvailableYears: async (auth) => {
        return await instance.get('/api/analytics/availableYears', {
            headers: { Authorization: auth },
        })
    },
    uploadImage: async (imageFormObj, auth) => {
        return await instance.post('/api/issues/uploadImage', imageFormObj, {
            headers: {
                Authorization: auth,
                'Content-Type': 'multipart/form-data',
            },
        })
    },
    deleteUploadedFile: async (filename, auth) => {
        return await instance.delete(`/api/issues/uploadedFiles/${filename}`, {
            headers: { Authorization: auth },
        })
    },
    // Voting functionality for comments
    voteComment: async (issueId, commentId, voteType, auth, userId = null) => {
        return await instance.post(
            `/api/issues/${issueId}/comments/${commentId}/vote`,
            {
                voteType: voteType, // 'like', 'dislike', or null to remove vote
                userId: userId, // Fallback user ID if JWT extraction fails
            },
            {
                headers: { Authorization: auth },
            }
        )
    },
    voteCommentReply: async (issueId, commentId, replyId, voteType, auth, userId = null) => {
        return await instance.post(
            `/api/issues/${issueId}/comments/${commentId}/replies/${replyId}/vote`,
            {
                voteType: voteType, // 'like', 'dislike', or null to remove vote
                userId: userId, // Fallback user ID if JWT extraction fails
            },
            {
                headers: { Authorization: auth },
            }
        )
    },
}
