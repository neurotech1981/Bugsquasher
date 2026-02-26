import axios from 'axios'
const instance = axios.create()

export default {
  getAll: async (auth) => {
    const res = await instance.get('/api/projects/list', {
      headers: { Authorization: auth },
    })
    return res.data || []
  },
  getById: async (id, auth) => {
    const res = await instance.get(`/api/projects/view/${id}`, {
      headers: { Authorization: auth },
    })
    return res.data
  },
  create: async (data, auth) => {
    return await instance.post('/api/projects', data, {
      headers: { Authorization: auth },
    })
  },
  update: async (id, data, auth) => {
    return await instance.put(`/api/projects/update/${id}`, data, {
      headers: { Authorization: auth },
    })
  },
  remove: async (id, auth) => {
    return await instance.delete(`/api/projects/delete/${id}`, {
      headers: { Authorization: auth },
    })
  },
}
