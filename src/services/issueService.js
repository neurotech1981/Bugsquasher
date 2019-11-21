//  /services/issueServices.js

import axios from 'axios';

export default {
  getAll: async () => {
    let res = await axios.get(`/api/getData`);
    return res.data.data || [];
  },
  getIssueByID: async (id) => {
    let res = await axios.put('/api/getDataByID/' + id);
    return res.data.data || [];
  }
};