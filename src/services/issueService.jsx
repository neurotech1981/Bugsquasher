//  /services/issueServices.js

import axios from "axios";
const instance = axios.create();

export default {
  getAll: async () => {
    const res = await instance.get("/api/getData");
    return res.data.data || [];
  },
  getIssueByID: async (id) => {
    const res = await instance.put("/api/getDataByID/" + id);
    return res.data.data || [];
  },
  upDateIssueStatus: async (id, data) => {
    return await instance.put(`/api/upDateIssueStatus/${id}`, data);
  },
  upDateIssue: async (id, data) => {
    return await instance.put(`/api/upDateIssue/${id}`, data);
  },
  deleteIssueByID: async (id) => {
    console.log("Inside IssueService: ", id);
    return await instance.delete("/api/deleteIssueByID", {
      data: {
        _id: id,
      },
    });
  },
  countIssues: async () => {
    return await instance.get(`/api/countIssues`);
  },
  getTodaysIssues: async () => {
    return await instance.get(`/api/getTodaysIssues`);
  },
  countSolvedIssues: async () => {
    return await instance.get(`/api/countSolvedIssues`);
  },
  countOpenIssues: async () => {
    return await instance.get(`/api/countOpenIssues`);
  },
};
