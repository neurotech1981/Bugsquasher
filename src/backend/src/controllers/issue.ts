import { Request, Response } from 'express'
import Data from '../models/issue.js'
import { AppError } from '../utils/AppError.js'

export const getAllIssues = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const startIndex = (page - 1) * limit

        // Fetch the data with pagination
        const data = await Data.find()
            .skip(startIndex)
            .limit(limit)
            .exec()

        // Get the total count of documents
        const count = await Data.countDocuments()

        // Return the paginated response
        return res.json({
            success: true,
            data: data,
            page: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
        })
    } catch (err: unknown) {
        const error = err as Error | AppError;
        return res.status(error instanceof AppError ? error.statusCode : 500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        })
    }
}

export const getIssueById = async (req: Request, res: Response) => {
    try {
        const issue = await Data.findById(req.params.id)
            .populate('reporter', 'name email')
            .populate('delegated', 'name email')
        if (!issue) {
            throw new AppError('Issue not found', 404)
        }
        return res.json({
            success: true,
            data: issue
        })
    } catch (err: unknown) {
        const error = err as Error | AppError;
        return res.status(error instanceof AppError ? error.statusCode : 500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        })
    }
}

export const addIssue = async (req: Request, res: Response) => {
    try {
        console.log('=== TYPESCRIPT addIssue CALLED ===');
        console.log('REQ.BODY:', JSON.stringify(req.body, null, 2));

        // Extract data from wrapped structure
        const issueData = req.body.data || req.body;

        // Remove any accidental root-level id field
        const { id, ...cleanedData } = issueData;

        // Also, clean id fields from imageName array
        if (Array.isArray(cleanedData.imageName)) {
            cleanedData.imageName = cleanedData.imageName.map(({ id, ...rest }: any) => rest);
        }

        console.log('Cleaned data for Mongoose:', JSON.stringify(cleanedData, null, 2));

        const issue = await Data.create(cleanedData)
        return res.status(201).json({
            success: true,
            data: issue
        })
    } catch (err: unknown) {
        const error = err as Error | AppError;
        console.log('Error creating issue:', error);
        return res.status(error instanceof AppError ? error.statusCode : 500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        })
    }
}

export const updateIssue = async (req: Request, res: Response) => {
    try {
        const issue = await Data.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!issue) {
            throw new AppError('Issue not found', 404)
        }
        return res.json({
            success: true,
            data: issue
        })
    } catch (err: unknown) {
        const error = err as Error | AppError;
        return res.status(error instanceof AppError ? error.statusCode : 500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        })
    }
}

export const deleteIssue = async (req: Request, res: Response) => {
    try {
        const issue = await Data.findByIdAndDelete(req.params.id)
        if (!issue) {
            throw new AppError('Issue not found', 404)
        }
        return res.json({
            success: true,
            data: {}
        })
    } catch (err: unknown) {
        const error = err as Error | AppError;
        return res.status(error instanceof AppError ? error.statusCode : 500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        })
    }
}

export const updateIssueStatus = async (req: Request, res: Response) => {
    try {
        const issue = await Data.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        )
        if (!issue) {
            throw new AppError('Issue not found', 404)
        }
        return res.json({
            success: true,
            data: issue
        })
    } catch (err: unknown) {
        const error = err as Error | AppError;
        return res.status(error instanceof AppError ? error.statusCode : 500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        })
    }
}

export const updateDelegated = async (req: Request, res: Response) => {
    try {
        const issue = await Data.findByIdAndUpdate(
            req.params.id,
            { delegated: req.body.delegated },
            { new: true, runValidators: true }
        )
            .populate('reporter', 'name email')
            .populate('delegated', 'name email')

        if (!issue) {
            throw new AppError('Issue not found', 404)
        }
        return res.json({
            success: true,
            data: issue
        })
    } catch (err: unknown) {
        const error = err as Error | AppError;
        return res.status(error instanceof AppError ? error.statusCode : 500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        })
    }
}