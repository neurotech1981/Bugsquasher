import {
    Avatar,
    Box,
    Button,
    Chip,
    Collapse,
    Divider,
    FormControl,
    IconButton,
    Menu,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Zoom,
    Alert,
    Snackbar,
} from '@mui/material'
import {
    ThumbUp,
    ThumbDown,
    ThumbUpOutlined,
    ThumbDownOutlined,
    Reply as ReplyIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandMore,
    ExpandLess,
    Sort as SortIcon,
} from '@mui/icons-material'
import { AlertTitle } from '@mui/lab'
import { randAvatar } from '@ngneat/falso'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'

const formattedDate = (value) => {
    const now = moment()
    const commentTime = moment(value)
    const diffMinutes = now.diff(commentTime, 'minutes')
    const diffHours = now.diff(commentTime, 'hours')
    const diffDays = now.diff(commentTime, 'days')

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return commentTime.format('DD/MM-YYYY')
}

const Comments = ({ comments, issueID, userID, onCommentsUpdated }) => {
    const jwt = auth.isAuthenticated()
    const [comment, setComments] = useState([])
    const [sortOrder, setSortOrder] = useState('newest') // 'newest', 'oldest', 'popular'
    const [showReplies, setShowReplies] = useState({})
    const [showReplyForm, setShowReplyForm] = useState({})
    const [showEditForm, setShowEditForm] = useState({})
    const [replyText, setReplyText] = useState('')
    const [editText, setEditText] = useState('')
    const [menuAnchor, setMenuAnchor] = useState({})
    const [message, setMessage] = useState('')
    const [open, setOpen] = useState(false)
    const [votes, setVotes] = useState({}) // Store voting state

    // Initialize votes state from comments
    useEffect(() => {
        const initialVotes = {}
        comments?.forEach(comment => {
            initialVotes[comment._id] = {
                likes: comment.likes || 0,
                dislikes: comment.dislikes || 0,
                userVote: comment.userVote || null // 'like', 'dislike', or null
            }
            comment.comments?.forEach(reply => {
                initialVotes[reply._id] = {
                    likes: reply.likes || 0,
                    dislikes: reply.dislikes || 0,
                    userVote: reply.userVote || null
                }
            })
        })
        setVotes(initialVotes)
    }, [comments])

    useEffect(() => {
        setComments(comments || [])
    }, [comments])

    const handleVote = async (commentId, voteType, isReply = false, parentCommentId = null) => {
        const currentVote = votes[commentId]?.userVote
        let newVoteType = null

        // If clicking the same vote type, remove the vote
        if (currentVote === voteType) {
            newVoteType = null
        } else {
            newVoteType = voteType
        }

        // Store the previous state for potential rollback
        const previousVote = { ...votes[commentId] }

        // Optimistically update UI
        setVotes(prev => ({
            ...prev,
            [commentId]: {
                ...prev[commentId],
                likes: prev[commentId]?.likes +
                    (newVoteType === 'like' ? 1 : 0) -
                    (currentVote === 'like' ? 1 : 0),
                dislikes: prev[commentId]?.dislikes +
                    (newVoteType === 'dislike' ? 1 : 0) -
                    (currentVote === 'dislike' ? 1 : 0),
                userVote: newVoteType
            }
        }))

        // Send vote to backend
        try {
            if (isReply && parentCommentId) {
                await issueService.voteCommentReply(issueID, parentCommentId, commentId, newVoteType, jwt.token, userID)
            } else {
                await issueService.voteComment(issueID, commentId, newVoteType, jwt.token, userID)
            }
        } catch (error) {
            console.error('Error voting on comment:', error)
            // Revert optimistic update on error
            setVotes(prev => ({
                ...prev,
                [commentId]: previousVote
            }))
            // Show error message
            setMessage('Kunne ikke registrere stemme. Prøv igjen.')
            setOpen(true)
        }
    }

    const toggleReplies = (commentId) => {
        setShowReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }))
    }

    const toggleReplyForm = (commentId) => {
        setShowReplyForm(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }))
        setReplyText('')
    }

    const toggleEditForm = (commentId, currentContent = '') => {
        setShowEditForm(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }))
        setEditText(currentContent)
    }

    const handleMenuOpen = (event, commentId) => {
        setMenuAnchor(prev => ({
            ...prev,
            [commentId]: event.currentTarget
        }))
    }

    const handleMenuClose = (commentId) => {
        setMenuAnchor(prev => ({
            ...prev,
            [commentId]: null
        }))
    }

    const submitReply = async (commentId) => {
        if (!replyText.trim()) return

        try {
            await issueService.addCommentReply(userID, replyText, jwt.token, issueID, commentId, 0)
            setMessage('Svar ble lagt til')
            setOpen(true)
            setReplyText('')
            toggleReplyForm(commentId)

            if (onCommentsUpdated) {
                await onCommentsUpdated()
            }
        } catch (error) {
            console.error('Error submitting reply:', error)
        }
    }

    const submitEdit = async (commentId) => {
        if (!editText.trim()) return

        try {
            await issueService.updateComment(editText, issueID, jwt.token, commentId, 0)
            setMessage('Kommentar ble oppdatert')
            setOpen(true)
            setEditText('')
            toggleEditForm(commentId)

            if (onCommentsUpdated) {
                await onCommentsUpdated()
            }
        } catch (error) {
            console.error('Error updating comment:', error)
        }
    }

    const deleteComment = async (commentId, isReply = false, parentCommentId = null) => {
        if (window.confirm('Er du sikker på at du vil slette denne kommentaren?')) {
            try {
                if (isReply && parentCommentId) {
                    await issueService.deleteCommentReply(issueID, parentCommentId, commentId, jwt.token)
                } else {
                    await issueService.deleteComment(issueID, commentId, jwt.token)
                }

                setMessage('Kommentar ble slettet')
                setOpen(true)

                if (onCommentsUpdated) {
                    await onCommentsUpdated()
                }
            } catch (error) {
                console.error('Error deleting comment:', error)
                setMessage('Kunne ikke slette kommentar. Prøv igjen.')
                setOpen(true)
            }
        }
    }

    const sortedComments = [...comment].sort((a, b) => {
        switch (sortOrder) {
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt)
            case 'popular':
                const aScore = (votes[a._id]?.likes || 0) - (votes[a._id]?.dislikes || 0)
                const bScore = (votes[b._id]?.likes || 0) - (votes[b._id]?.dislikes || 0)
                return bScore - aScore
            case 'newest':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt)
        }
    })

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return
        setOpen(false)
    }

    const CommentItem = ({ comment: commentData, isReply = false, parentCommentId = null }) => {
        const isAuthor = commentData.author._id === jwt.user._id
        const commentVotes = votes[commentData._id] || { likes: 0, dislikes: 0, userVote: null }

        return (
            <Box sx={{
                mb: isReply ? 2 : 3,
                ml: isReply ? 6 : 0,
                pb: isReply ? 1 : 2,
                borderBottom: isReply ? 'none' : '1px solid #f0f0f0'
            }}>
                <Stack direction="row" spacing={2}>
                    {/* Avatar */}
                    <Avatar
                        src={randAvatar()}
                        alt={commentData.author.name}
                        sx={{ width: isReply ? 32 : 40, height: isReply ? 32 : 40 }}
                    />

                    {/* Comment Content */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {/* Header with name, badge, and timestamp */}
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="600">
                                {commentData.author.name}
                            </Typography>
                            {/* You could add badges here like "Author", "Verified", etc. */}
                            <Typography variant="caption" color="text.secondary">
                                {formattedDate(commentData.updatedAt)}
                            </Typography>
                        </Stack>

                        {/* Comment Text */}
                        {!showEditForm[commentData._id] ? (
                            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5 }}>
                                {commentData.content}
                            </Typography>
                        ) : (
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => submitEdit(commentData._id)}
                                        sx={{ bgcolor: '#F79B72', '&:hover': { bgcolor: '#e8895f' } }}
                                    >
                                        Lagre
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => toggleEditForm(commentData._id)}
                                    >
                                        Avbryt
                                    </Button>
                                </Stack>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                            {/* Like Button */}
                            <IconButton
                                size="small"
                                onClick={() => handleVote(commentData._id, 'like', isReply, parentCommentId)}
                                sx={{
                                    color: commentVotes.userVote === 'like' ? '#F79B72' : 'text.secondary',
                                    '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.1)' }
                                }}
                            >
                                {commentVotes.userVote === 'like' ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                            </IconButton>
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: '20px' }}>
                                {commentVotes.likes || ''}
                            </Typography>

                            {/* Dislike Button */}
                            <IconButton
                                size="small"
                                onClick={() => handleVote(commentData._id, 'dislike', isReply, parentCommentId)}
                                sx={{
                                    color: commentVotes.userVote === 'dislike' ? '#d32f2f' : 'text.secondary',
                                    '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' }
                                }}
                            >
                                {commentVotes.userVote === 'dislike' ? <ThumbDown fontSize="small" /> : <ThumbDownOutlined fontSize="small" />}
                            </IconButton>
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: '20px' }}>
                                {commentVotes.dislikes || ''}
                            </Typography>

                            {/* Reply Button */}
                            {!isReply && (
                                <IconButton
                                    size="small"
                                    onClick={() => toggleReplyForm(commentData._id)}
                                    sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                                >
                                    <ReplyIcon fontSize="small" />
                                </IconButton>
                            )}

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
                                onClick={() => !isReply && toggleReplyForm(commentData._id)}
                            >
                                {!isReply ? 'Reply' : ''}
                            </Typography>

                            {/* More Actions Menu */}
                            <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, commentData._id)}
                                sx={{ color: 'text.secondary', ml: 'auto !important' }}
                            >
                                <MoreVertIcon fontSize="small" />
                            </IconButton>

                            <Menu
                                anchorEl={menuAnchor[commentData._id]}
                                open={Boolean(menuAnchor[commentData._id])}
                                onClose={() => handleMenuClose(commentData._id)}
                            >
                                {isAuthor && [
                                    <MenuItem
                                        key="edit"
                                        onClick={() => {
                                            toggleEditForm(commentData._id, commentData.content)
                                            handleMenuClose(commentData._id)
                                        }}
                                    >
                                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                        Rediger
                                    </MenuItem>,
                                    <MenuItem
                                        key="delete"
                                        onClick={() => {
                                            deleteComment(commentData._id, isReply, parentCommentId)
                                            handleMenuClose(commentData._id)
                                        }}
                                        sx={{ color: 'error.main' }}
                                    >
                                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                        Slett
                                    </MenuItem>
                                ]}
                                {!isAuthor && (
                                    <MenuItem onClick={() => handleMenuClose(commentData._id)}>
                                        Rapporter
                                    </MenuItem>
                                )}
                            </Menu>
                        </Stack>

                        {/* Reply Form */}
                        {showReplyForm[commentData._id] && (
                            <Zoom in={showReplyForm[commentData._id]}>
                                <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #f0f0f0' }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Skriv et svar..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        sx={{ mb: 1 }}
                                    />
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => submitReply(commentData._id)}
                                            sx={{ bgcolor: '#F79B72', '&:hover': { bgcolor: '#e8895f' } }}
                                        >
                                            Svar
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => toggleReplyForm(commentData._id)}
                                        >
                                            Avbryt
                                        </Button>
                                    </Stack>
                                </Box>
                            </Zoom>
                        )}

                        {/* Replies Toggle and List */}
                        {!isReply && commentData.comments && commentData.comments.length > 0 && (
                            <>
                                <Button
                                    size="small"
                                    startIcon={showReplies[commentData._id] ? <ExpandLess /> : <ExpandMore />}
                                    onClick={() => toggleReplies(commentData._id)}
                                    sx={{
                                        mt: 1,
                                        color: '#F79B72',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.1)' }
                                    }}
                                >
                                    {showReplies[commentData._id] ? 'Skjul' : 'Vis'} {commentData.comments.length} svar
                                </Button>

                                <Collapse in={showReplies[commentData._id]}>
                                    <Box sx={{ mt: 2 }}>
                                        {commentData.comments.map((reply) => (
                                            <CommentItem
                                                key={reply._id}
                                                comment={reply}
                                                isReply={true}
                                                parentCommentId={commentData._id}
                                            />
                                        ))}
                                    </Box>
                                </Collapse>
                            </>
                        )}
                    </Box>
                </Stack>
            </Box>
        )
    }

    return (
        <Box>
            {/* Comments Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                    Comments {comment.length > 0 && (
                        <Chip
                            label={comment.length}
                            size="small"
                            sx={{
                                ml: 1,
                                bgcolor: '#F79B72',
                                color: 'white',
                                fontWeight: 600
                            }}
                        />
                    )}
                </Typography>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
                        sx={{
                            '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center'
                            }
                        }}
                    >
                        <MenuItem value="newest">Most recent</MenuItem>
                        <MenuItem value="oldest">Oldest first</MenuItem>
                        <MenuItem value="popular">Most popular</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {/* Comments List */}
            {sortedComments.length > 0 ? (
                sortedComments.map((commentData) => (
                    <CommentItem key={commentData._id} comment={commentData} />
                ))
            ) : (
                <Box sx={{
                    textAlign: 'center',
                    py: 6,
                    color: 'text.secondary',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2
                }}>
                    <Typography variant="body1">Ingen kommentarer enda</Typography>
                    <Typography variant="body2">Bli den første til å kommentere!</Typography>
                </Box>
            )}

            {/* Notification Snackbar */}
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity={message.includes('Kunne ikke') ? 'error' : 'success'}
                    variant="filled"
                >
                    <AlertTitle>{message.includes('Kunne ikke') ? 'Feil' : 'Suksess'}</AlertTitle>
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default Comments
