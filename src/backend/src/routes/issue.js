import express from 'express'
import {
    newIssue,
    getAllIssues,
    updateIssueStatus,
    updateDelegated,
    updateIssue,
    getIssueByID,
    deleteIssueByID,
    addImage,
    deleteImage,
} from '../controllers/issue.js'

const router = express.Router()

router.route('/api/new-issue').post(newIssue)

router.route('/api/getData').get(getAllIssues)

router.route('/api/upDateIssueStatus/:id/:status').get(updateIssueStatus)

router.route('/api/upDateDelegated/:id/:delegated').get(updateDelegated)

router.route('/api/upDateIssue/:id').post(updateIssue)

router.route('/api/getIssueByID/:id').get(getIssueByID)

router.route('/api/deleteIssueByID/:id').get(deleteIssueByID)

router.route('/api/issue/add-image').post(addImage)

router.route('/api/delete-image/:id').post(deleteImage)

export default router
