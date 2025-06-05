import { Request, Response } from 'express'
import Data from '../models/issue.js'
import Comment from '../models/comment.js'
import { AppError } from '../utils/AppError.js'

export const getComments = async (req: Request, res: Response) => {
    try {
        console.log('=== TS getComments called ===');
        console.log('Issue ID:', req.params.id);

        // Find the issue and populate its comments with nested replies
        const issue = await Data.findById(req.params.id)
            .populate({
                path: 'comments',
                populate: [
                    {
                        path: 'author',
                        select: 'name email'
                    },
                    {
                        path: 'comments',
                        populate: {
                            path: 'author',
                            select: 'name email'
                        }
                    }
                ]
            })

        if (!issue) {
            throw new AppError('Issue not found', 404)
        }

        console.log(`Found ${(issue as any).comments?.length || 0} comments`);
        return res.json({
            success: true,
            response: {
                comments: (issue as any).comments || []
            }
        })
    } catch (err: unknown) {
        return res.status(err instanceof AppError ? err.statusCode : 500).json({
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred',
        })
    }
}

export const addComment = async (req: Request, res: Response) => {
    try {
        console.log('=== TS addComment called ===');
        console.log('Issue ID:', req.params.id);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const issueId = req.params.id;
        const { author, content } = req.body;

        if (!issueId || !author || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: issueId, author, or content'
            });
        }

        // Create new comment document
        const comment = new Comment({
            author,
            content
        });

        const savedComment = await comment.save();
        console.log('Comment saved:', savedComment._id);

        // Add comment ID to issue's comments array
        const issue = await Data.findByIdAndUpdate(
            issueId,
            { $push: { comments: savedComment._id } },
            { new: true }
        );

        if (!issue) {
            // If issue not found, delete the created comment to avoid orphaned data
            await Comment.findByIdAndDelete(savedComment._id);
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            });
        }

        console.log('Comment added to issue successfully');
        return res.status(201).json({
            success: true,
            data: savedComment
        });
    } catch (err: unknown) {
        console.error('Error in TS addComment:', err);
        return res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred',
        })
    }
}

export const updateComment = async (req: Request, res: Response) => {
    try {
        console.log('=== TS updateComment called ===');
        console.log('Comment ID:', req.params.commentId);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const commentId = req.params.commentId;
        const { content } = req.body;

        if (!commentId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Comment ID and content are required'
            });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content, updatedAt: new Date() },
            { new: true }
        ).populate('author', 'name email');

        if (!updatedComment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }

        console.log('Comment updated successfully');
        return res.json({
            success: true,
            data: updatedComment
        });
    } catch (err: unknown) {
        console.error('Error in TS updateComment:', err);
        return res.status(err instanceof AppError ? err.statusCode : 500).json({
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred',
        })
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        console.log('=== TS deleteComment called ===');
        console.log('Issue ID:', req.params.id);
        console.log('Comment ID:', req.params.commentId);

        const issueId = req.params.id;
        const commentId = req.params.commentId;

        if (!issueId || !commentId) {
            return res.status(400).json({
                success: false,
                error: 'Issue ID and Comment ID are required'
            });
        }

        // Delete the comment document
        const deletedComment = await Comment.findByIdAndDelete(commentId);
        if (!deletedComment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }

        // Remove comment ID from issue's comments array
        await Data.findByIdAndUpdate(
            issueId,
            { $pull: { comments: commentId } }
        );

        console.log('Comment deleted successfully');
        return res.json({
            success: true,
            data: {}
        });
    } catch (err: unknown) {
        console.error('Error in TS deleteComment:', err);
        return res.status(err instanceof AppError ? err.statusCode : 500).json({
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred',
        })
    }
}

export const voteComment = async (req: Request, res: Response) => {
    try {
        console.log('=== TS voteComment called ===');
        console.log('Comment ID:', req.params.commentId);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const commentId = req.params.commentId;
        const { voteType, userId: bodyUserId } = req.body;

        // Try multiple ways to get user ID - prioritize JWT token, fallback to body
        const userId = (req as any).user?._id || (req as any).user?.id || (req as any).user?.userId || (req as any).user?.sub || bodyUserId;

        console.log('Extracted userId:', userId);
        console.log('typeof req.user:', typeof (req as any).user);
        console.log('Object.keys(req.user):', (req as any).user ? Object.keys((req as any).user) : 'no user object');
        console.log('bodyUserId:', bodyUserId);

        if (!commentId) {
            return res.status(400).json({
                success: false,
                error: 'Comment ID is required'
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User authentication required - no user ID found in token'
            });
        }

        if (voteType && !['like', 'dislike'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid vote type. Must be "like", "dislike", or null'
            });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }

        // Find existing vote by this user
        const existingVoteIndex = (comment as any).votes?.findIndex((vote: any) =>
            vote.user.toString() === userId.toString()
        ) ?? -1;

        // Remove existing vote if it exists
        if (existingVoteIndex !== -1) {
            const existingVote = (comment as any).votes[existingVoteIndex];
            if (existingVote.voteType === 'like') {
                (comment as any).likes = Math.max(0, ((comment as any).likes || 0) - 1);
            } else if (existingVote.voteType === 'dislike') {
                (comment as any).dislikes = Math.max(0, ((comment as any).dislikes || 0) - 1);
            }
            (comment as any).votes.splice(existingVoteIndex, 1);
        }

        // Add new vote if voteType is provided (not null)
        if (voteType) {
            if (!(comment as any).votes) {
                (comment as any).votes = [];
            }

            (comment as any).votes.push({
                user: userId,
                voteType: voteType,
                createdAt: new Date()
            });

            if (voteType === 'like') {
                (comment as any).likes = ((comment as any).likes || 0) + 1;
            } else if (voteType === 'dislike') {
                (comment as any).dislikes = ((comment as any).dislikes || 0) + 1;
            }
        }

        const updatedComment = await comment.save();
        console.log('Comment vote updated successfully');

        return res.json({
            success: true,
            data: {
                likes: (updatedComment as any).likes || 0,
                dislikes: (updatedComment as any).dislikes || 0,
                userVote: voteType
            }
        });
    } catch (err: unknown) {
        console.error('Error in TS voteComment:', err);
        return res.status(err instanceof AppError ? err.statusCode : 500).json({
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred',
        })
    }
}