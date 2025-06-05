import { Request, Response } from 'express'
import Data from '../models/issue.js'
import { AppError } from '../utils/AppError.js'

export const addImage = async (req: Request, res: Response) => {
    try {
        console.log('=== TS addImage called ===');
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

        const issue = await Data.findByIdAndUpdate(
            issueId,
            { $addToSet: { imageName: imageToAdd } },
            { new: true }
        );

        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        console.log('Image added successfully:', imageToAdd);
        return res.status(201).json({
            success: true,
            data: issue
        });
    } catch (err) {
        console.error('Error in TS addImage:', err);
        return res.status(err instanceof AppError ? err.statusCode : 500).json({
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred',
        });
    }
}

export const deleteImage = async (req: Request, res: Response) => {
    try {
        console.log('=== TS deleteImage called ===');
        console.log('req.params.id:', req.params.id);
        console.log('req.params.imageId:', req.params.imageId);

        const issueId = req.params.id;
        const imagePath = req.params.imageId; // This is actually the file path/name

        // Pull by path since that's what we're using as the identifier
        const issue = await Data.findByIdAndUpdate(
            issueId,
            { $pull: { imageName: { path: imagePath } } },
            { new: true }
        );

        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        console.log('Image deleted successfully for path:', imagePath);
        return res.json({
            success: true,
            data: {}
        });
    } catch (err: unknown) {
        console.error('Error in TS deleteImage:', err);
        const error = err as Error | AppError;
        return res.status(error instanceof AppError ? error.statusCode : 500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        });
    }
}