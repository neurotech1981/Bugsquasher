//  /services/issueServices.js

import axios from "axios";
const instance = axios.create();

export default {
  getAll: async (auth) => {
    console.log("AUTH inside IssueService getAll >>>", auth);
    const res = await instance.get("/api/getData", { headers: { Authorization: auth } });
    return res.data.data || [];
  },
  getComments: async (auth) => {
    const res = await instance.get("https://jsonplaceholder.typicode.com/posts/1/comments", { headers: { Authorization: auth } });
    return res.data || [];
  },
  getIssueByID: async (id, auth) => {
    console.log("AUTH inside IssueService - getIssueByID >>>", auth);
    console.log("getIssueByID ID: ", id)
    const res = await instance.get(`/api/getDataByID/${id}`, { headers: { Authorization: auth } });
    console.log("getIssueByID: ", res.data)
    return res.data.data || [];
  },
  upDateIssueStatus: async (id, data, auth) => {
    return await instance.put(`/api/upDateIssueStatus`, data, { headers: { Authorization: auth } });
  },
  upDateIssue: async (id, data, auth) => {
    return await instance.post(`/api/upDateIssue/${id}`, data, { headers: { Authorization: auth } });
  },
  addComment: async (data, auth) => {
    console.log("Inside addComment 1" + auth.t)
    return await instance.get(`/api/add-comment`, data, { headers: { Authorization: auth } });
  },
  deleteIssueByID: async (id, auth) => {
    console.log("Inside IssueService: ", id);
    return await instance.delete("/api/deleteIssueByID", id, { headers: { Authorization: auth } }, {
      data: {
        _id: id,
      },
    });
  },
  countIssues: async (auth) => {
    console.log("TOKEN >>>", auth)
    return await instance.get("/api/countIssues", { headers: { Authorization: auth } });
  },
  getTodaysIssues: async (auth) => {
    return await instance.get("/api/getTodaysIssues", { headers: { Authorization: auth } });
  },
  countSolvedIssues: async (auth) => {
    return await instance.get("/api/countSolvedIssues", { headers: { Authorization: auth } });
  },
  countOpenIssues: async (auth) => {
    return await instance.get("/api/countOpenIssues", { headers: { Authorization: auth } });
  },
  getLatestCases: async (auth) => {
    return await instance.get("/api/getLatestCases", { headers: { Authorization: auth } });
  },
};
