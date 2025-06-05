import Comment from '../models/comment.js'
import Data from '../models/issue.js'
import mongoose from 'mongoose'

console.log('=== COMMENT CONTROLLER LOADED ===')

export const addComment = async (req, res) => {
    try {
        console.log('=== addComment called ===')
        console.log('Issue ID:', req.params.id)
        console.log('Request body:', JSON.stringify(req.body, null, 2))

        const issueId = req.params.id
        const { author, content } = req.body

        if (!issueId || !author || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: issueId, author, or content'
            })
        }

        // Create new comment
        const comment = new Comment({
            author,
            content,
            createdAt: new Date()
        })

        const savedComment = await comment.save()
        console.log('Comment saved:', savedComment._id)

        // Add comment ID to issue's comments array
        const issue = await Data.findByIdAndUpdate(
            issueId,
            { $push: { comments: savedComment._id } },
            { new: true }
        )

        if (!issue) {
            // If issue not found, delete the created comment to avoid orphaned data
            await Comment.findByIdAndDelete(savedComment._id)
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            })
        }

        console.log('Comment added to issue successfully')
        return res.status(201).json({
            success: true,
            data: savedComment
        })
    } catch (err) {
        console.error('Error in addComment:', err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const getComments = async (req, res) => {
    try {
        console.log('=== getComments called ===')
        console.log('Issue ID:', req.params.id)

        const issueId = req.params.id
        if (!issueId) {
            return res.status(400).json({
                success: false,
                error: 'Issue ID is required'
            })
        }

        // Find the issue and populate its comments
        const issue = await Data.findById(issueId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name email'
                }
            })

        if (!issue) {
            return res.status(404).json({
                success: false,
                error: 'Issue not found'
            })
        }

        console.log(`Found ${issue.comments.length} comments`)
        return res.json({
            success: true,
            response: {
                comments: issue.comments || []
            }
        })
    } catch (err) {
        console.error('Error in getComments:', err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const updateComment = async (req, res) => {
    try {
        console.log('=== updateComment called ===')
        console.log('Comment ID:', req.params.commentId)
        console.log('Request body:', JSON.stringify(req.body, null, 2))

        const commentId = req.params.commentId
        const { content } = req.body

        if (!commentId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Comment ID and content are required'
            })
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content, updatedAt: new Date() },
            { new: true }
        ).populate('author', 'name email')

        if (!updatedComment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            })
        }

        console.log('Comment updated successfully')
        return res.json({
            success: true,
            data: updatedComment
        })
    } catch (err) {
        console.error('Error in updateComment:', err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const deleteComment = async (req, res) => {
    try {
        console.log('=== deleteComment called ===')
        console.log('Issue ID:', req.params.id)
        console.log('Comment ID:', req.params.commentId)

        const issueId = req.params.id
        const commentId = req.params.commentId

        if (!issueId || !commentId) {
            return res.status(400).json({
                success: false,
                error: 'Issue ID and Comment ID are required'
            })
        }

        // Delete the comment
        const deletedComment = await Comment.findByIdAndDelete(commentId)
        if (!deletedComment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            })
        }

        // Remove comment ID from issue's comments array
        await Data.findByIdAndUpdate(
            issueId,
            { $pull: { comments: commentId } }
        )

        console.log('Comment deleted successfully')
        return res.json({
            success: true
        })
    } catch (err) {
        console.error('Error in deleteComment:', err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const voteComment = async (req, res) => {
    try {
        console.log('=== voteComment called ===')
        console.log('Comment ID:', req.params.commentId)
        console.log('Request body:', JSON.stringify(req.body, null, 2))
        console.log('req.user:', JSON.stringify(req.user, null, 2))

                const commentId = req.params.commentId
        const { voteType, userId: bodyUserId } = req.body

        // Try multiple ways to get user ID - prioritize JWT token, fallback to body
        const userId = req.user?._id || req.user?.id || req.user?.userId || req.user?.sub || bodyUserId

        console.log('Extracted userId:', userId)
        console.log('typeof req.user:', typeof req.user)
        console.log('Object.keys(req.user):', req.user ? Object.keys(req.user) : 'no user object')
        console.log('bodyUserId:', bodyUserId)

        if (!commentId) {
            return res.status(400).json({
                success: false,
                error: 'Comment ID is required'
            })
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User authentication required - no user ID found in token'
            })
        }

        if (voteType && !['like', 'dislike'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid vote type. Must be "like", "dislike", or null'
            })
        }

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            })
        }

        // Find existing vote by this user
        const existingVoteIndex = comment.votes.findIndex(vote =>
            vote.user.toString() === userId.toString()
        )

        // Remove existing vote if it exists
        if (existingVoteIndex !== -1) {
            const existingVote = comment.votes[existingVoteIndex]
            if (existingVote.voteType === 'like') {
                comment.likes = Math.max(0, comment.likes - 1)
            } else if (existingVote.voteType === 'dislike') {
                comment.dislikes = Math.max(0, comment.dislikes - 1)
            }
            comment.votes.splice(existingVoteIndex, 1)
        }

        // Add new vote if voteType is provided (not null)
        if (voteType) {
            comment.votes.push({
                user: userId,
                voteType: voteType,
                createdAt: new Date()
            })

            if (voteType === 'like') {
                comment.likes += 1
            } else if (voteType === 'dislike') {
                comment.dislikes += 1
            }
        }

        const updatedComment = await comment.save()
        console.log('Comment vote updated successfully')

        return res.json({
            success: true,
            data: {
                likes: updatedComment.likes,
                dislikes: updatedComment.dislikes,
                userVote: voteType
            }
        })
    } catch (err) {
        console.error('Error in voteComment:', err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}