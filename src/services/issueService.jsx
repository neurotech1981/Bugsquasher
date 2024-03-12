//  /services/issueServices.js

import axios from 'axios'
const instance = axios.create()

export default {
    getAll: async (auth) => {
        const res = await instance.get('/api/getData', {
            headers: { Authorization: auth },
        })
        return res.data.data || []
    },
    getComments: async (id, auth) => {
        const res = await instance.get(`/api/get-comments/${id}`, {
            headers: { Authorization: auth },
        })
        return res.data.data || []
    },
    getCommentsReplies: async (issueId, commentId, auth) => {
        const res = await instance.post(`/api/issue/${issueId}/comments/${commentId}/replies`, {
            headers: { Authorization: auth },
        })
        return res.data.data || []
    },
    getIssueByID: async (id, auth) => {
        const res = await instance.get(`/api/getIssueByID/${id}`, {
            headers: { Authorization: auth },
        })
        return res.data.data || []
    },
    upDateIssueStatus: async (id, data, auth) => {
        return await instance.get(
            `/api/upDateIssueStatus/${id}/${data.status}`,
            { headers: { Authorization: auth } },
            { body: { status: data.status } }
        )
    },
    upDateDelegated: async (id, data, auth) => {
        return await instance.get(
            `/api/upDateDelegated/${id}/${data.delegated}`,
            { headers: { Authorization: auth } },
            { body: { status: data.status } }
        )
    },
    updateComment: async (newContent, id, auth, commentID) => {
        return await instance.post(`/api/update-comment/${id}`, {
            headers: { Authorization: auth },
            comment: {
                newContent: [newContent],
                commentId: commentID,
            },
        })
    },
    upDateIssue: async (id, data, auth) => {
        return await instance.post(`/api/upDateIssue/${id}`, data, {
            headers: { Authorization: auth },
        })
    },
    addIssue: async (data, auth) => {
        return await instance.post(`/api/new-issue/`, data, {
            headers: { Authorization: auth },
        })
    },
    addComment: async (data, auth, id) => {
        return await instance.post(`/api/issue/comments/${id}`, data, {
            headers: { Authorization: auth },
        })
    },
    addCommentReply: async (userID, data, auth, issueId, commentId, index) => {
        return await instance.post(`/api/issue/${issueId}/comments/${commentId}/replies/new`, {
            headers: { Authorization: auth },
            reply: {
                content: data,
                userID: userID,
                index: index,
            },
        })
    },
    addImageToIssue: async (issueID, name, auth) => {
        return await instance.post(
            `/api/issue/add-image/`,
            {
                headers: { Authorization: auth },
                name: name,
                issueID: issueID,
            },
            {}
        )
    },
    deleteIssueByID: async (id, auth) => {
        return await instance.get(`/api/deleteIssueByID/${id}`, {
            headers: { Authorization: auth },
        })
    },
    deleteImage: async (id, imageID, name, auth) => {
        return await instance.post(
            `/api/delete-image/${id}`,
            { image: imageID, name: name },
            { headers: { Authorization: auth } }
        )
    },
    deleteComment: async (id, commentId, auth) => {
        return await instance.post(
            `/api/delete-comment/${id}`,
            { commentId: commentId },
            { headers: { Authorization: auth } }
        )
    },
    deleteCommentReply: async (id, parentId, childId, auth) => {
        return await instance.post(
            `/api/delete-reply/${id}`,
            { parentId: parentId, childId: childId },
            { headers: { Authorization: auth } }
        )
    },
    countIssues: async (auth) => {
        return await instance.get('/api/countIssues', {
            headers: { Authorization: auth },
        })
    },
    getTodaysIssues: async (auth) => {
        return await instance.get('/api/getTodaysIssues', {
            headers: { Authorization: auth },
        })
    },
    countSolvedIssues: async (auth) => {
        return await instance.get('/api/countSolvedIssues', {
            headers: { Authorization: auth },
        })
    },
    countOpenIssues: async (auth) => {
        return await instance.get('/api/countOpenIssues', {
            headers: { Authorization: auth },
        })
    },
    getLatestCases: async (auth) => {
        return await instance.get('/api/getLatestCases', {
            headers: { Authorization: auth },
        })
    },
    getThisYearCaseCount: async (auth) => {
        return await instance.get('/api/thisYearIssuesCount', {
            headers: { Authorization: auth },
        })
    },
    getThisWeeklyCaseCount: async (auth) => {
        return await instance.get('/api/weekdayIssueCount', {
            headers: { Authorization: auth },
        })
    },
    getDailyIssueCount: async (auth) => {
        return await instance.get('/api/dailyIssueCount', {
            headers: { Authorization: auth },
        })
    },
}
