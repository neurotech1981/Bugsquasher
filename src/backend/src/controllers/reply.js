import Comment from '../models/comment.js'

console.log('=== REPLY CONTROLLER LOADED ===')

export const addReply = async (req, res) => {
    try {
        console.log('=== addReply called ===')
        console.log('Issue ID:', req.params.id)
        console.log('Comment ID:', req.params.commentId)
        console.log('Request body:', JSON.stringify(req.body, null, 2))

        const { commentId } = req.params
        const { content, userID, index } = req.body

        if (!commentId || !content || !userID) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: commentId, content, or userID'
            })
        }

        // Find the parent comment
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            })
        }

                // Create a new Comment document for the reply
        const reply = new Comment({
            author: userID,
            content: content
        })

        const savedReply = await reply.save()
        console.log('Reply saved:', savedReply._id)

        // Add reply ID to parent comment's comments array
        comment.comments = comment.comments || []
        comment.comments.push(savedReply._id)

        const savedComment = await comment.save()
        console.log('Reply added to comment successfully')

        return res.status(201).json({
            success: true,
            data: savedReply
        })
    } catch (err) {
        console.error('Error in addReply:', err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const deleteReply = async (req, res) => {
    try {
        console.log('=== deleteReply called ===')
        console.log('Issue ID:', req.params.id)
        console.log('Comment ID:', req.params.commentId)
        console.log('Reply ID:', req.params.replyId)

        const { commentId, replyId } = req.params

        if (!commentId || !replyId) {
            return res.status(400).json({
                success: false,
                error: 'Comment ID and Reply ID are required'
            })
        }

        // Find the comment and remove the reply
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            })
        }

                        // Remove the reply from the comments array
        const initialCommentsCount = comment.comments.length
        comment.comments = comment.comments.filter(commentId => commentId.toString() !== replyId)

        if (comment.comments.length === initialCommentsCount) {
            return res.status(404).json({
                success: false,
                error: 'Reply not found in parent comment'
            })
        }

        // Delete the actual reply Comment document
        await Comment.findByIdAndDelete(replyId)
        await comment.save()
        console.log('Reply deleted successfully')

        return res.json({
            success: true
        })
    } catch (err) {
        console.error('Error in deleteReply:', err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const voteReply = async (req, res) => {
    try {
        console.log('=== voteReply called ===')
        console.log('Reply ID:', req.params.replyId)
        console.log('Request body:', JSON.stringify(req.body, null, 2))

        const replyId = req.params.replyId
        const { voteType } = req.body
        const userId = req.user?._id || req.user?.id // Get user ID from JWT token

        if (!replyId || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Reply ID and user authentication required'
            })
        }

        if (voteType && !['like', 'dislike'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid vote type. Must be "like", "dislike", or null'
            })
        }

        const reply = await Comment.findById(replyId)
        if (!reply) {
            return res.status(404).json({
                success: false,
                error: 'Reply not found'
            })
        }

        // Find existing vote by this user
        const existingVoteIndex = reply.votes.findIndex(vote =>
            vote.user.toString() === userId.toString()
        )

        // Remove existing vote if it exists
        if (existingVoteIndex !== -1) {
            const existingVote = reply.votes[existingVoteIndex]
            if (existingVote.voteType === 'like') {
                reply.likes = Math.max(0, reply.likes - 1)
            } else if (existingVote.voteType === 'dislike') {
                reply.dislikes = Math.max(0, reply.dislikes - 1)
            }
            reply.votes.splice(existingVoteIndex, 1)
        }

        // Add new vote if voteType is provided (not null)
        if (voteType) {
            reply.votes.push({
                user: userId,
                voteType: voteType,
                createdAt: new Date()
            })

            if (voteType === 'like') {
                reply.likes += 1
            } else if (voteType === 'dislike') {
                reply.dislikes += 1
            }
        }

        const updatedReply = await reply.save()
        console.log('Reply vote updated successfully')

        return res.json({
            success: true,
            data: {
                likes: updatedReply.likes,
                dislikes: updatedReply.dislikes,
                userVote: voteType
            }
        })
    } catch (err) {
        console.error('Error in voteReply:', err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}