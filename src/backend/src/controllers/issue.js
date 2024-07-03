import validateInput from '../../../validation/input-validation.mjs'
import Data from '../models/issue.js'
import fs from 'fs'
import path from 'path'

export const newIssue = (req, res) => {
    // this is our create method
    // this method adds new data in our database
    //  ProtectedRoutes.post('/new-issue', async function (req, res, uuid) {
    const { errors, isValid } = validateInput(req.body.data)
    // Check Validation
    if (!isValid) {
        // If any errors, send 400 with errors object
        return res.status(400).json(errors)
    }

    const data = new Data()
    data.name = req.body.data.name
    data.delegated = req.body.data.delegated
    data.reporter = req.body.data.reporter_id
    data.description = req.body.data.description
    data.category = req.body.data.category
    data.environment = req.body.data.environment
    data.step_reproduce = req.body.data.step_reproduce
    data.summary = req.body.data.summary
    data.browser = req.body.data.browser
    data.visual = req.body.data.visual
    data.reproduce = req.body.data.reproduce
    data.severity = req.body.data.severity
    data.priority = req.body.data.priority
    data.userid = req.body.data.userid
    data.project = req.body.data.project

    data.save((err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err,
            })
        }
        return res.status(200).json({
            success: true,
            document: data,
        })
    })
}

export const getAllIssues = (req, res) => {
    const page = parseInt(req.query.page) || 1 // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10 // Default to 10 items per page if not provided

    const startIndex = (page - 1) * limit

    Data.find()
        .skip(startIndex)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.json({
                    success: false,
                    error: err,
                })
            }

            Data.countDocuments().exec((countError, count) => {
                if (countError) {
                    return res.json({
                        success: false,
                        error: countError,
                    })
                }
                return res.json({
                    success: true,
                    data: data,
                    page: page,
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                })
            })
        })
}

export const updateIssueStatus = (req, res, next) => {
    //  ProtectedRoutes.route('/upDateIssueStatus/:id/:status').get(async function (req, res, next) {
    Data.findByIdAndUpdate({ _id: req.params.id }, { status: req.params.status }, function (err, data) {
        if (err) return next(err)
        return res.json({
            success: true,
            data: data,
        })
    })
    //  })
}

export const updateDelegated = (req, res, next) => {
    //ProtectedRoutes.route('/upDateDelegated/:id/:delegated').get(async function (req, res, next) {
    Data.findByIdAndUpdate({ _id: req.params.id }, { delegated: req.params.delegated }, function (err, data) {
        if (err) return next(err)
        return res.json({
            success: true,
            data: data,
        })
    })
    //})
}

export const updateIssue = (req, res, next) => {
    //ProtectedRoutes.post('/upDateIssue/:id', async function (req, res, next) {
    const { dataset } = req.body
    Data.findByIdAndUpdate({ _id: req.params.id }, dataset, function (err, data) {
        if (err) return next(err)
        return res.json({
            success: true,
            data: data,
        })
    })
    //})
}

export const getIssueByID = (req, res) => {
    //  ProtectedRoutes.route('/getIssueByID/:id').get(async function (req, res) {
    try {
        Data.findOne({ _id: req.params.id })
            .populate([
                {
                    path: 'reporter',
                    select: 'name',
                    model: 'User',
                },
                {
                    path: 'delegated',
                    select: 'name',
                    model: 'User',
                },
                {
                    path: 'project',
                    select: 'name',
                    model: 'Project',
                },
            ])
            .exec()
            .then((response) => {
                res.json({
                    success: true,
                    data: response,
                })
            })
    } catch (e) {
        // database error
        res.status(500).send('database error')
    }
    //  })
}

export const deleteIssueByID = (req, res) => {
    let __dirname = path.resolve()
    // this is our delete method
    // this method removes existing data in our database
    //  ProtectedRoutes.get('/deleteIssueByID/:id', async function (req, res, next) {
    const { id } = req.params
    Data.findByIdAndDelete(id, (err, result) => {
        //delete image(s) when deleting an issue
        result.imageName.forEach((element) => {
            if (element.path) {
                fs.unlinkSync(path.join(__dirname, '..', '/assets/uploads/', element.path))
            }
        })
        if (err) return res.send(err)
        return res.json({
            success: true,
        })
    })
}
//  })
// this is our add image to issue method
// this method adds new image(s) to existing issue
export const addImage = async (req, res) => {
    console.log('Files in Add Image: ', req.body.name.fileArray)
    try {
        for (const element of req.body.name.fileArray) {
            await Data.updateOne({ _id: req.body.issueID }, { $addToSet: { imageName: element } })
        }
        res.json({
            success: true,
            data: {},
            error: null,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            data: {},
            error: error.message,
        })
    }
}

// this is our delete method
// this method removes existing data in our database
//  ProtectedRoutes.route('/delete-image/:id').post(async function (req, res, next) {
export const deleteImage = (req, res) => {
    let __dirname = path.resolve()
    const { image, name } = req.body
    const { id } = req.params

    if (!image || !name || !id) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: image, name, or id',
        })
    }

    //Data.findOneAndUpdate({ _id: id }, { $pull: { imageName: { $elemMatch: { id: image } } } }, (err, result) => {
    Data.findOneAndUpdate({ _id: id }, { $pull: { imageName: { id: image } } }, (err, result) => {
        console.log(result)
        if (err) {
            return res.status(500).json({
                success: false,
                message: err,
            })
        } else if (!result) {
            return res.status(404).json({
                success: false,
                issue: 'Issue not found',
            })
        }

        try {
            fs.unlinkSync(path.join(__dirname, '..', '/assets/uploads/', name))
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error,
            })
        }

        return res.json({
            success: true,
        })
    })
}

//  })
