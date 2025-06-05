import { Request, Response } from 'express'
import Data from '../models/issue.js'
import Comment from '../models/comment.js'
import { AppError } from '../utils/AppError.js'

export const addReply = async (req: Request, res: Response) => {
    try {
        console.log('=== TS addReply called ===');
        console.log('Issue ID:', req.params.id);
        console.log('Comment ID:', req.params.commentId);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const { commentId } = req.params;
        const { content, userID } = req.body;

        if (!commentId || !content || !userID) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: commentId, content, or userID'
            });
        }

        // Find the parent comment
        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({
                success: false,
                error: 'Parent comment not found'
            });
        }

        // Create a new Comment document for the reply
        const reply = new Comment({
            author: userID,
            content: content
        });

        const savedReply = await reply.save();
        console.log('Reply saved:', savedReply._id);

        // Add reply ID to parent comment's comments array
        parentComment.comments = parentComment.comments || [];
        parentComment.comments.push(savedReply._id);

        await parentComment.save();
        console.log('Reply added to parent comment successfully');

        return res.status(201).json({
            success: true,
            data: savedReply
        });
    } catch (err: unknown) {
        console.error('Error in TS addReply:', err);
        return res.status(err instanceof AppError ? err.statusCode : 500).json({
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred',
        })
    }
}

export const deleteReply = async (req: Request, res: Response) => {
    try {
        console.log('=== TS deleteReply called ===');
        console.log('Issue ID:', req.params.id);
        console.log('Comment ID:', req.params.commentId);
        console.log('Reply ID:', req.params.replyId);

        const { commentId, replyId } = req.params;

        if (!commentId || !replyId) {
            return res.status(400).json({
                success: false,
                error: 'Comment ID and Reply ID are required'
            });
        }

        // Find the parent comment and remove the reply
        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({
                success: false,
                error: 'Parent comment not found'
            });
        }

        // Remove the reply from the comments array
        const initialCommentsCount = parentComment.comments.length;
        parentComment.comments = parentComment.comments.filter((commentObjectId: any) => commentObjectId.toString() !== replyId);

        if (parentComment.comments.length === initialCommentsCount) {
            return res.status(404).json({
                success: false,
                error: 'Reply not found in parent comment'
            });
        }

        // Delete the actual reply Comment document
        await Comment.findByIdAndDelete(replyId);
        await parentComment.save();
        console.log('Reply deleted successfully');

        return res.json({
            success: true,
            data: {}
        });
    } catch (err: unknown) {
        console.error('Error in TS deleteReply:', err);
        return res.status(err instanceof AppError ? err.statusCode : 500).json({
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred',
        })
    }
}