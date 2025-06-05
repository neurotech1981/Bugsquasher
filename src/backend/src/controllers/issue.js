import validateInput from '../../../validation/input-validation.mjs'
import Data from '../models/issue.js'
import Project from '../models/project.js'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

console.log('=== JAVASCRIPT ISSUE CONTROLLER LOADED ===');
console.log('Project model loaded:', Project);
console.log('Available models after import:', mongoose.modelNames());

const createIssue = async (req, res) => {
    try {
        console.log('=== JAVASCRIPT createIssue CALLED ===');
        console.log('REQ.BODY:', JSON.stringify(req.body, null, 2))
        const { errors, isValid } = validateInput(req.body.data)
        if (!isValid) {
            return res.status(400).json(errors)
        }

        // Remove any accidental root-level id field
        const { id, ...cleanedData } = req.body.data

        // Also, clean id fields from imageName array
        if (Array.isArray(cleanedData.imageName)) {
            cleanedData.imageName = cleanedData.imageName.map(({ id, ...rest }) => rest)
        }

        // Ensure reporter is set - use from cleanedData if provided, otherwise fall back
        const reporter = cleanedData.reporter
        console.log('Reporter from request:', reporter)

        const data = new Data({
            ...cleanedData
        })

        const savedData = await data.save()
        return res.status(200).json({
            success: true,
            document: savedData,
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            error: err.message,
        })
    }
}

const getAllIssues = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const startIndex = (page - 1) * limit

        const [data, count] = await Promise.all([
            Data.find().skip(startIndex).limit(limit).exec(),
            Data.countDocuments()
        ])

        return res.json({
            success: true,
            data,
            page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        })
    }
}

const updateIssueStatus = async (req, res) => {
    try {
        const data = await Data.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        )

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            })
        }

        return res.json({
            success: true,
            data
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

const updateDelegated = async (req, res) => {
    try {
        const data = await Data.findByIdAndUpdate(
            req.params.id,
            { delegated: req.body.delegated },
            { new: true }
        )

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            })
        }

        return res.json({
            success: true,
            data
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

const updateIssue = async (req, res) => {
    try {
        const data = await Data.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('reporter', 'name')
         .populate('delegated', 'name')
         .populate('project', 'name')

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            })
        }

        return res.json({
            success: true,
            data
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

const getIssueById = async (req, res) => {
    try {
        console.log('=== getIssueById called ===');
        console.log('Issue ID:', req.params.id);

        // First, let's check what models are available
        console.log('Available models:', mongoose.modelNames());

        const data = await Data.findById(req.params.id)
            .populate('reporter', 'name')
            .populate('delegated', 'name')
            .populate('project', 'name')

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            })
        }

        console.log('Raw issue data:', JSON.stringify(data, null, 2));
        console.log('Reporter field:', data.reporter);
        console.log('Reporter name:', data.reporter?.name);
        console.log('Project field:', data.project);
        console.log('Project name:', data.project?.name);
        console.log('Project type:', typeof data.project);
        console.log('Delegated field:', data.delegated);

        // Let's also try to manually fetch the project
        if (data.project && typeof data.project === 'string') {
            console.log('Project is still a string, trying manual fetch...');
            try {
                const manualProject = await Project.findById(data.project);
                console.log('Manual project fetch result:', manualProject);
                // Manually populate the project if the automatic populate failed
                if (manualProject) {
                    data.project = manualProject;
                    console.log('Manually populated project:', data.project);
                }
            } catch (manualErr) {
                console.error('Manual project fetch error:', manualErr);
            }
        }

        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error('Error in getIssueById:', err);
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

const deleteIssue = async (req, res) => {
    try {
        const data = await Data.findByIdAndDelete(req.params.id)

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            })
        }

        // Delete associated images
        for (const image of data.imageName) {
            if (image.path) {
                fs.unlinkSync(path.join(path.resolve(), '..', '/assets/uploads/', image.path))
            }
        }

        return res.json({
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

const addImage = async (req, res) => {
    try {
        console.log('=== addImage called ===');
        console.log('req.params.id:', req.params.id);
        console.log('req.body:', JSON.stringify(req.body, null, 2));

        const issueId = req.params.id;
        const fileName = req.body.name;

        if (!issueId || !fileName) {
            return res.status(400).json({
                success: false,
                error: 'Missing issue ID or file name'
            });
        }

        // Create image object to add
        const imageToAdd = {
            name: fileName,
            path: fileName // Using filename as path since that's what frontend expects
        };

        const data = await Data.findByIdAndUpdate(
            issueId,
            { $addToSet: { imageName: imageToAdd } },
            { new: true }
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            });
        }

        console.log('Image added successfully:', imageToAdd);
        return res.json({
            success: true,
            data: data
        });
    } catch (err) {
        console.error('Error in addImage:', err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

const deleteImage = async (req, res) => {
    try {
        const { image, name } = req.body
        const { id } = req.params

        if (!image || !name || !id) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: image, name, or id'
            })
        }

        const data = await Data.findOneAndUpdate(
            { _id: id },
            { $pull: { imageName: { id: image } } },
            { new: true }
        )

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            })
        }

        fs.unlinkSync(path.join(path.resolve(), '..', '/assets/uploads/', name))

        return res.json({
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export {
    createIssue,
    createIssue as addIssue,
    getAllIssues,
    updateIssueStatus,
    updateDelegated,
    updateIssue,
    getIssueById,
    deleteIssue,
    addImage,
    deleteImage
}
