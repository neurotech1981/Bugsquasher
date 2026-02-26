import axios from 'axios'
const instance = axios.create()

export default {
  sendMessage: async (data, auth) => {
    return await instance.post('/api/messages', data, {
      headers: { Authorization: auth },
    })
  },
  getInbox: async (userId, auth) => {
    const res = await instance.get(`/api/messages/inbox/${userId}`, {
      headers: { Authorization: auth },
    })
    return res.data
  },
  getSent: async (userId, auth) => {
    const res = await instance.get(`/api/messages/sent/${userId}`, {
      headers: { Authorization: auth },
    })
    return res.data
  },
  getMessage: async (id, auth) => {
    const res = await instance.get(`/api/messages/${id}`, {
      headers: { Authorization: auth },
    })
    return res.data
  },
  markAsRead: async (id, auth) => {
    return await instance.put(
      `/api/messages/${id}/read`,
      {},
      {
        headers: { Authorization: auth },
      }
    )
  },
  deleteMessage: async (id, userId, auth) => {
    return await instance.post(
      `/api/messages/${id}/delete`,
      { userId },
      {
        headers: { Authorization: auth },
      }
    )
  },
  getUnreadCount: async (userId, auth) => {
    const res = await instance.get(`/api/messages/unread/${userId}`, {
      headers: { Authorization: auth },
    })
    return res.data
  },
}
