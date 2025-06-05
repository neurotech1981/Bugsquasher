/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
// Using global app theme, no custom theme needed
import issueService from '../../services/issueService'
import { getProjects } from '../../services/projectService'
import '../../App.css'
import CommentForm from '../Comments/CommentForm'
import Comments from '../Comments/Comments'
import moment from 'moment'
import CssBaseline from '@mui/material/CssBaseline'
import {
    Alert,
    AlertTitle,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import {
    AccessTime as AccessTimeIcon,
    ArrowBack as ArrowBackIcon,
    Assignment as AssignmentIcon,
    AttachFile as AttachFileIcon,
    BugReport as BugReportIcon,
    Category as CategoryIcon,
    Delete as DeleteIcon,
    Description as DescriptionIcon,
    Edit as EditIcon,
    InsertDriveFile,
    Person as PersonIcon,
    PlaylistAddCheck as PlaylistAddCheckIcon,
    PriorityHigh as PriorityHighIcon,
    SettingsSuggest as SettingsSuggestIcon,
    Update as UpdateIcon,
    Visibility,
} from '@mui/icons-material'
import ModalImage from 'react-modal-image'
import { deepPurple } from '@mui/material/colors'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import auth from '../auth/auth-helper'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { findUserProfile, getUsers } from '../utils/api-user'
import DeleteImageDialog from '../Dialogs/DeleteImage'
import Previews from './ImageUploader'

const formattedDate = (value) => (value ? moment(value).format('DD/MM-YYYY HH:mm') : 'N/A')
const formattedDateShort = (value) => (value ? moment(value).format('DD/MM-YYYY') : 'N/A')

// Helper function to get status chip color and icon
const getStatusChip = (status) => {
    const statusMap = {
        'Åpen': { color: '#F79B72', icon: '🔓' },
        'Løst': { color: '#2A4759', icon: '✅' },
        'Lukket': { color: '#DDDDDD', icon: '🔐' },
        'Under arbeid': { color: '#e8895f', icon: '👷' }
    }
    return statusMap[status] || { color: '#999999', icon: '❓' }
}

// Helper function to get priority chip color
const getPriorityChip = (priority) => {
    const priorityMap = {
        'Høy': { color: '#F79B72' },
        'Middels': { color: '#e8895f' },
        'Lav': { color: '#2A4759' },
        'Øyeblikkelig': { color: '#F79B72' },
        'Normal': { color: '#2A4759' },
        'Haster': { color: '#F79B72' }
    }
    return priorityMap[priority] || { color: '#999999' }
}

// Using the global app theme instead of custom theme

// Status options
const Status = [
    { value: 0, label: '🔓 Åpen', id: 'Åpen', uniqueId: 'status-open' },
    { value: 1, label: '✅ Løst', id: 'Løst', uniqueId: 'status-solved' },
    { value: 2, label: '🔐 Lukket', id: 'Lukket', uniqueId: 'status-closed' },
    { value: 3, label: '👷 Under arbeid', id: 'Under arbeid', uniqueId: 'status-in-progress' },
]

// Priority options
const priorityOptions = [
    { value: 1, label: '❌ Ingen', text: 'Ingen' },
    { value: 2, label: '🟢 Lav', text: 'Lav' },
    { value: 3, label: '🟡 Normal', text: 'Normal' },
    { value: 4, label: '🔴 Høy', text: 'Høy' },
    { value: 5, label: '🚨 Haster', text: 'Haster' },
    { value: 6, label: '⚡ Øyeblikkelig', text: 'Øyeblikkelig' },
]

// Severity options
const severityOptions = [
    { value: 1, label: '📝 Tekst', text: 'Tekst' },
    { value: 2, label: '🔧 Justering', text: 'Justering' },
    { value: 3, label: '🔹 Triviell', text: 'Triviell' },
    { value: 4, label: '🟡 Mindre alvorlig', text: 'Mindre alvorlig' },
    { value: 5, label: '🔴 Alvorlig', text: 'Alvorlig' },
    { value: 6, label: '💥 Kræsj', text: 'Kræsj' },
    { value: 7, label: '🚫 Blokkering', text: 'Blokkering' },
]

// Category options
const categoryOptions = [
    { value: 1, label: '🔹 Triviell', text: 'Triviell' },
    { value: 2, label: '📝 Tekst', text: 'Tekst' },
    { value: 3, label: '🔧 Justering', text: 'Justering' },
    { value: 4, label: '🟡 Mindre alvorlig', text: 'Mindre alvorlig' },
    { value: 5, label: '🔴 Alvorlig', text: 'Alvorlig' },
    { value: 6, label: '💥 Kræsj', text: 'Kræsj' },
    { value: 7, label: '🚫 Blokkering', text: 'Blokkering' },
]

// Reproducibility options
const reproduceOptions = [
    { value: 2, label: '✅ Alltid', text: 'Alltid' },
    { value: 3, label: '🔄 Noen ganger', text: 'Noen ganger' },
    { value: 4, label: '🎲 Tilfeldig', text: 'Tilfeldig' },
    { value: 5, label: '❓ Har ikke forsøkt', text: 'Har ikke forsøkt' },
    { value: 6, label: '🚫 Kan ikke reprodusere', text: 'Kan ikke reprodusere' },
    { value: 7, label: '⛔ Ingen', text: 'Ingen' },
]

export default function ViewIssueProfessional() {
    const [dataset, setData] = useState({})
    const [showAside, setShowAside] = useState(true)
    const [editorStateDesc, setEditorStateDesc] = useState(EditorState.createEmpty())
    const [editorStateRep, setEditorStateRep] = useState(EditorState.createEmpty())
    const [images, setImages] = useState([])
    const [openStatusUpdate, setOpenStatusUpdate] = useState({
        openStatusSnackbar: false,
        verticalStatusUpdate: 'bottom',
        horizontalStatusUpdate: 'center',
    })
    const [saving, setSaving] = useState({
        status: false,
        delegated: false,
        summary: false,
        priority: false,
        severity: false,
        category: false,
        reproduce: false,
        description: false,
        reproduction: false,
        project: false
    })
    const [successMessage, setSuccessMessage] = useState('')
    const [editing, setEditing] = useState({
        summary: false,
        description: false,
        reproduction: false
    })
    const [userinfo, setUserinfo] = useState({
        user: {},
        redirectToSignin: false,
    })
    const [errors, setErrors] = useState({})
    const [open, setOpen] = useState(false)
    const [openNewComment, setOpenNewComment] = useState(false)
    const [comments, setComments] = useState([])
    const [users, setUsers] = useState([])
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [projectName, setProjectName] = useState('')

    // Attachment preview modal state
    const [previewModal, setPreviewModal] = useState({
        open: false,
        fileUrl: '',
        filename: '',
        isImage: false
    })

    const navigate = useNavigate()
    const { id } = useParams()

    // Toggle sidebar visibility
    const toggleAside = () => setShowAside(!showAside)

    // Preview modal functions
    const openPreviewModal = (fileUrl, filename, isImage) => {
        setPreviewModal({
            open: true,
            fileUrl,
            filename,
            isImage
        })
    }

    const closePreviewModal = () => {
        setPreviewModal({
            open: false,
            fileUrl: '',
            filename: '',
            isImage: false
        })
    }

    // Handle image deletion
    const pull_data = (index) => {
        const updatedImages = images.filter((_, i) => i !== index)
        setImages(updatedImages.length > 0 ? updatedImages : ['none'])
    }

    // Handle new images
    const image_changes = (newImages) => {
        setImages((prevImages) => [...prevImages, ...newImages])

        // Refresh the issue data to get updated attachments from server
        if (newImages && newImages.length > 0) {
            const jwt = auth.isAuthenticated()
            if (jwt && jwt.token && id) {
                // Small delay to ensure backend has processed the attachment
                setTimeout(() => {
                    getIssueByID(id, jwt.token)
                }, 1000)
            }
        }
    }

    // Initialize user data
    const init = useCallback(async () => {
        const jwt = auth.isAuthenticated()
        if (!jwt) {
            console.error('Authentication required')
            setUserinfo({ redirectToSignin: true })
            return
        }

        if (!jwt.user || !jwt.user.id) {
            console.error('Invalid user data in authentication token:', jwt)
            setUserinfo({ redirectToSignin: true })
            return
        }

        try {
            // Get user data
            const userData = await findUserProfile(
                { userId: jwt.user.id },
                { t: jwt.token }
            )

            if (userData.error) {
                console.error('Failed to fetch user data:', userData.error)
                setUserinfo({ redirectToSignin: true })
                return
            }

            if (!userData) {
                console.error('No user data returned from findUserProfile')
                setUserinfo({ redirectToSignin: true })
                return
            }

            setUserinfo({ user: userData })

            // Get all users
            const usersData = await getUsers({ t: jwt.token })
            if (usersData.error) {
                setErrors((prev) => ({ ...prev, users: 'Could not load users' }))
            } else {
                setUsers(usersData.data || [])
            }

            // Get all projects
            const projectsData = await getProjects(jwt.token)
            if (projectsData.error) {
                setErrors((prev) => ({ ...prev, projects: 'Could not load projects' }))
            } else {
                setProjects(projectsData.data || [])
            }
        } catch (error) {
            console.error('Initialization error:', error)
            setErrors((prev) => ({ ...prev, init: 'Failed to initialize data' }))
            setUserinfo({ redirectToSignin: true })
        }
    }, [])

    // Navigate to home
    const goHome = () => {
        const jwt = auth.isAuthenticated()
        if (jwt && jwt.user) {
            navigate('/saker/' + jwt.user._id)
        } else {
            navigate('/')
        }
    }

    // Dialog handlers
    const handleClickOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    const handleStatusUpdateClose = () => {
        setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: false })
    }
    const handleConfirmDelete = () => onDelete()

    // Fetch issue by ID
    const getIssueByID = useCallback(async (issueId, token) => {
        if (!issueId || !token) return

        setIsLoading(true)
        try {
            const result = await issueService.getIssueByID(issueId, token)

            // Debug project data
            console.log('=== ViewIssueProfessional Issue Data Debug ===')
            console.log('Full result:', result)
            console.log('Project field:', result.project)
            console.log('Project name:', result.project?.name)
            console.log('Project _id:', result.project?._id)

            // Set images
            setImages(result.imageName && result.imageName.length > 0 ? result.imageName : ['none'])

            // Set issue data
            console.log('📋 Setting issue data:', result)
            console.log('🏗️ Project field in issue:', result.project)
            setData(result)

            // Fetch project name if project ID exists
            if (result.project && typeof result.project === 'string') {
                try {
                    const jwt = auth.isAuthenticated()
                    const projectsResponse = await getProjects(jwt.token)
                    const project = projectsResponse.data.find(p => p._id === result.project)
                    if (project) {
                        console.log('🎯 Found project by ID:', project)
                        setProjectName(project.name)
                    } else {
                        console.log('❌ Project not found for ID:', result.project)
                    }
                } catch (error) {
                    console.error('Error fetching project:', error)
                }
            } else if (result.project && result.project.name) {
                // Project is already populated
                console.log('✅ Project already populated:', result.project)
                setProjectName(result.project.name)
            } else {
                console.log('📝 No project assigned to this issue')
            }

            // Parse description
            try {
                if (result.description) {
                    const descContent = JSON.parse(result.description)
                    const editorStateDesc = EditorState.createWithContent(convertFromRaw(descContent))
                    setEditorStateDesc(editorStateDesc)
                }
            } catch (e) {
                console.error('Error parsing description:', e)
                setEditorStateDesc(EditorState.createEmpty())
            }

            // Parse reproduction steps
            try {
                if (result.step_reproduce) {
                    const repContent = JSON.parse(result.step_reproduce)
                    const editorStateRep = EditorState.createWithContent(convertFromRaw(repContent))
                    setEditorStateRep(editorStateRep)
                }
            } catch (e) {
                console.error('Error parsing reproduction steps:', e)
                setEditorStateRep(EditorState.createEmpty())
            }
        } catch (error) {
            console.error('Error fetching issue by ID: ', error)
            setErrors((prev) => ({ ...prev, fetch: 'Could not load issue' }))
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch comments
    const getComments = useCallback(async () => {
        if (!id) return

        const jwt = auth.isAuthenticated()
        if (!jwt) return

        try {
            const response = await issueService.getComments(id, jwt.token)
            console.log('=== ViewIssue getComments response ===')
            console.log('Full response:', response)
            console.log('response.response:', response?.response)
            console.log('response.response.comments:', response?.response?.comments)

            if (response && response.response && response.response.comments) {
                console.log('Setting comments:', response.response.comments)
                setComments(response.response.comments)
            } else {
                console.log('No comments found, setting empty array')
                setComments([])
            }
        } catch (error) {
            console.error('Comment error: ', error)
            setErrors((prev) => ({ ...prev, comments: 'Could not load comments' }))
        }
    }, [id])

    // Update issue status
    const upDateIssueStatus = async (issueId, status) => {
        if (!issueId) return

        setSaving(prev => ({ ...prev, status: true }))
        const jwt = auth.isAuthenticated()

        try {
            await issueService.upDateIssueStatus(issueId, { status }, jwt.token)
            setData((prevData) => ({ ...prevData, status }))
            setSuccessMessage(`Status endret til "${status}"`)
            setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            console.error('Update issue error: ', error)
            setErrors((prev) => ({ ...prev, status: 'Kunne ikke oppdatere status' }))
        } finally {
            setSaving(prev => ({ ...prev, status: false }))
        }
    }

    // Update delegated user
    const upDateDelegated = async (issueId, userId) => {
        if (!issueId) return

        setSaving(prev => ({ ...prev, delegated: true }))
        const jwt = auth.isAuthenticated()

        try {
            // Handle clearing delegation (userId is empty)
            if (!userId) {
                await issueService.upDateDelegated(issueId, { delegated: null }, jwt.token)
                setData((prevData) => ({ ...prevData, delegated: null }))
                setSuccessMessage('Delegering fjernet')
                setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })

                setTimeout(() => setSuccessMessage(''), 3000)
                return
            }

            const selectedUser = users.find((user) => user._id === userId)
            if (!selectedUser) {
                setErrors((prev) => ({ ...prev, delegated: 'Bruker ikke funnet' }))
                return
            }

            await issueService.upDateDelegated(issueId, { delegated: selectedUser._id }, jwt.token)
            setData((prevData) => ({ ...prevData, delegated: selectedUser }))
            setSuccessMessage(`Delegert til ${selectedUser.name}`)
            setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })

            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            console.error('Update delegated user error: ', error)
            setErrors((prev) => ({ ...prev, delegated: 'Kunne ikke oppdatere delegering' }))
        } finally {
            setSaving(prev => ({ ...prev, delegated: false }))
        }
    }

    // Update project assignment
    const updateProjectAssignment = async (projectId) => {
        if (!dataset._id) return

        // Add persistent debugging
        localStorage.setItem('debug_project_assignment', JSON.stringify({
            timestamp: new Date().toISOString(),
            step: 'starting',
            projectId,
            issueId: dataset._id
        }))

        setSaving(prev => ({ ...prev, project: true }))
        const jwt = auth.isAuthenticated()

        try {
            // Handle clearing project assignment (projectId is empty/null)
            if (!projectId) {
                localStorage.setItem('debug_project_assignment', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    step: 'clearing_project'
                }))

                const clearResponse = await issueService.upDateIssue(dataset._id, { project: null }, jwt.token)
                console.log('🗑️ Clear project response:', clearResponse)

                localStorage.setItem('debug_project_assignment', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    step: 'clear_response_received',
                    response: clearResponse?.data
                }))

                // Update local state directly instead of refreshing from backend
                setData((prevData) => ({ ...prevData, project: null }))
                setProjectName('')

                setSuccessMessage('Prosjekt fjernet')
                setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })
                setTimeout(() => setSuccessMessage(''), 3000)
                return
            }

            const selectedProject = projects.find((project) => (project._id === projectId || project.id === projectId))
            if (!selectedProject) {
                setErrors((prev) => ({ ...prev, project: 'Prosjekt ikke funnet' }))
                return
            }

            localStorage.setItem('debug_project_assignment', JSON.stringify({
                timestamp: new Date().toISOString(),
                step: 'updating_project',
                selectedProject: selectedProject.name
            }))

            // Update the issue with new project
            const updateResponse = await issueService.upDateIssue(dataset._id, { project: projectId }, jwt.token)
            console.log('📋 Project update response:', updateResponse)
            console.log('📋 Update response data field:', updateResponse?.data)

            localStorage.setItem('debug_project_assignment', JSON.stringify({
                timestamp: new Date().toISOString(),
                step: 'update_response_received',
                response: updateResponse?.data,
                projectInResponse: updateResponse?.data?.project
            }))

            // Update local state directly with the response data if it contains the project
            if (updateResponse?.data?.project) {
                console.log('✅ Using project from response:', updateResponse.data.project)
                setData((prevData) => ({ ...prevData, project: updateResponse.data.project }))
                setProjectName(updateResponse.data.project.name || selectedProject.name)
            } else {
                // Fallback: update with selected project
                console.log('⚠️ No project in response, using selected project')
                setData((prevData) => ({ ...prevData, project: selectedProject }))
                setProjectName(selectedProject.name)
            }

            setSuccessMessage(`Tildelt til prosjekt: ${selectedProject.name}`)
            setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })
            setTimeout(() => setSuccessMessage(''), 3000)

            localStorage.setItem('debug_project_assignment', JSON.stringify({
                timestamp: new Date().toISOString(),
                step: 'completed_successfully'
            }))

        } catch (error) {
            console.error('Update project error: ', error)
            localStorage.setItem('debug_project_assignment', JSON.stringify({
                timestamp: new Date().toISOString(),
                step: 'error',
                error: error.message
            }))
            setErrors((prev) => ({ ...prev, project: 'Kunne ikke oppdatere prosjekt' }))
        } finally {
            setSaving(prev => ({ ...prev, project: false }))
        }
    }

    // Generic update function for issue fields
    const updateIssueField = async (field, value, displayValue) => {
        if (!dataset._id) return

        setSaving(prev => ({ ...prev, [field]: true }))
        const jwt = auth.isAuthenticated()

        try {
            const updateData = { [field]: value }
            await issueService.upDateIssue(dataset._id, updateData, jwt.token)
            setData((prevData) => ({ ...prevData, [field]: value }))
            setSuccessMessage(`${displayValue} oppdatert`)
            setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })

            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            console.error(`Update ${field} error: `, error)
            setErrors((prev) => ({ ...prev, [field]: `Kunne ikke oppdatere ${displayValue.toLowerCase()}` }))
        } finally {
            setSaving(prev => ({ ...prev, [field]: false }))
        }
    }

    // Update summary
    const updateSummary = async (newSummary) => {
        if (!dataset._id || !newSummary.trim()) return
        await updateIssueField('summary', newSummary.trim(), 'Sammendrag')
        setEditing(prev => ({ ...prev, summary: false }))
    }

    // Update description
    const updateDescription = async () => {
        if (!dataset._id) return

        setSaving(prev => ({ ...prev, description: true }))
        const jwt = auth.isAuthenticated()

        try {
            const htmlContentStateDesc = JSON.stringify(convertToRaw(editorStateDesc.getCurrentContent()))
            await issueService.upDateIssue(dataset._id, { description: htmlContentStateDesc }, jwt.token)
            setSuccessMessage('Beskrivelse oppdatert')
            setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })
            setEditing(prev => ({ ...prev, description: false }))

            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            console.error('Update description error: ', error)
            setErrors((prev) => ({ ...prev, description: 'Kunne ikke oppdatere beskrivelse' }))
        } finally {
            setSaving(prev => ({ ...prev, description: false }))
        }
    }

    // Update reproduction steps
    const updateReproduction = async () => {
        if (!dataset._id) return

        setSaving(prev => ({ ...prev, reproduction: true }))
        const jwt = auth.isAuthenticated()

        try {
            const htmlContentStateRep = JSON.stringify(convertToRaw(editorStateRep.getCurrentContent()))
            await issueService.upDateIssue(dataset._id, { step_reproduce: htmlContentStateRep }, jwt.token)
            setSuccessMessage('Reproduksjonssteg oppdatert')
            setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })
            setEditing(prev => ({ ...prev, reproduction: false }))

            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            console.error('Update reproduction error: ', error)
            setErrors((prev) => ({ ...prev, reproduction: 'Kunne ikke oppdatere reproduksjonssteg' }))
        } finally {
            setSaving(prev => ({ ...prev, reproduction: false }))
        }
    }

    // Delete issue
    const onDelete = async () => {
        if (!dataset._id) return

        const jwt = auth.isAuthenticated()
        try {
            await issueService.deleteIssueByID(dataset._id, jwt.token)
            setOpen(false)
            goHome()
        } catch (error) {
            console.error('Deleting issue error: ', error)
            setErrors((prev) => ({ ...prev, delete: 'Failed to delete issue' }))
        }
    }

    // Clean up image URLs
    useEffect(() => {
        return () => {
            images.forEach((file) => {
                if (file && file.preview) {
                    URL.revokeObjectURL(file.preview)
                }
            })
        }
    }, [images])

    // Submit new comment
    const onSubmit = async (data) => {
        if (!data.content || !id) return

        const jwt = auth.isAuthenticated()
        if (!jwt || !jwt.user) return

        const userId = jwt.user._id || jwt.user.id

        const commentData = {
            author: userId,
            content: data.content,
        }

        console.log('=== Frontend comment submission ===')
        console.log('JWT user:', jwt.user)
        console.log('User ID:', userId)
        console.log('Issue ID:', id)
        console.log('Comment data being sent:', commentData)

        try {
            await issueService.addComment(commentData, jwt.token, id)
            await getComments()
            setOpenNewComment(true)
        } catch (error) {
            console.error('Comment submission error:', error)
            setErrors((prev) => ({ ...prev, commentSubmit: 'Failed to submit comment' }))
        }
    }

    // Initial data loading
    useEffect(() => {
        const jwt = auth.isAuthenticated()
        if (!jwt) return

        // Set viewport-based sidebar state
        const toggled = window.screen.width >= 1024
        setShowAside(toggled)

        // Initialize
        init()

        // Load issue and comments
        const fetchData = async () => {
            try {
                await getComments()
                await getIssueByID(id, jwt.token)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchData()
    }, [id, init, getComments, getIssueByID])

    // Handle editor state changes
    const onEditorStateChangeDesc = (editorState) => setEditorStateDesc(editorState)
    const onEditorStateChangeRep = (editorState) => setEditorStateRep(editorState)

    // Render image list
    const ImageList = images.map((file, index) => {
        if (!file || file === 'none') {
            return (
                <Box key={index} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    color: 'text.secondary'
                }}>
                    <Stack alignItems="center" spacing={1}>
                        <AttachFileIcon sx={{ fontSize: 48 }} />
                        <Typography variant="body2">Ingen vedlegg</Typography>
                    </Stack>
                </Box>
            )
        }

        let path = file.path
        if (Array.isArray(file) && file[0] && file[0].path) {
            path = file[0].path
        } else if (!file.path) {
            return (
                <Box key={index} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    color: 'text.secondary'
                }}>
                    <Stack alignItems="center" spacing={1}>
                        <AttachFileIcon sx={{ fontSize: 48 }} />
                        <Typography variant="body2">Ingen vedlegg</Typography>
                    </Stack>
                </Box>
            )
        }

        const fileUrl = `http://localhost:3001/assets/uploads/${path}`
        const fileExtension = path.split('.').pop()?.toLowerCase()
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)

                const cleanFilename = (() => {
            // Extract original filename by removing UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-filename)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i;
            const match = path.match(uuidRegex);
            return match ? match[1] : path;
        })()

        const getFileIcon = () => {
            const iconProps = { fontSize: 'large', sx: { color: '#F79B72' } }
            switch (fileExtension?.toLowerCase()) {
                case 'pdf': return <InsertDriveFile {...iconProps} />
                case 'doc':
                case 'docx': return <InsertDriveFile {...iconProps} />
                case 'xls':
                case 'xlsx': return <InsertDriveFile {...iconProps} />
                case 'ppt':
                case 'pptx': return <InsertDriveFile {...iconProps} />
                case 'txt': return <InsertDriveFile {...iconProps} />
                default: return <InsertDriveFile {...iconProps} />
            }
        }

        return (
            <Box key={index} sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                mb: 1,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    backgroundColor: '#f8f9fa',
                    borderColor: '#F79B72',
                    transform: 'translateX(4px)'
                }
            }}>
                {/* Thumbnail/Icon */}
                <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 1,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    flexShrink: 0,
                    border: '1px solid #e0e0e0',
                    cursor: isImage ? 'pointer' : 'default'
                }}>
                    {isImage ? (
                        <Box
                            component="img"
                            src={fileUrl}
                            alt={cleanFilename}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 1,
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                            onClick={() => openPreviewModal(fileUrl, cleanFilename, true)}
                        />
                    ) : (
                        <Box
                            sx={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)'
                                }
                            }}
                            onClick={() => openPreviewModal(fileUrl, cleanFilename, false)}
                        >
                            {getFileIcon()}
                        </Box>
                    )}
                </Box>

                {/* File Info */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                        variant="body1"
                        fontWeight="600"
                        sx={{
                            color: 'text.primary',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cleanFilename}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={fileExtension?.toUpperCase()}
                            size="small"
                            sx={{
                                bgcolor: isImage ? '#e8f5e8' : '#fff3e0',
                                color: isImage ? '#2e7d2e' : '#e65100',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 20
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {isImage ? 'Bilde' : 'Dokument'}
                        </Typography>
                    </Stack>
                </Box>

                                {/* Actions */}
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    {/* View/Download button */}
                    <IconButton
                        size="small"
                        onClick={() => window.open(fileUrl, '_blank')}
                        sx={{
                            color: '#F79B72',
                            '&:hover': {
                                backgroundColor: 'rgba(247, 155, 114, 0.1)'
                            }
                        }}
                    >
                        <Tooltip title={isImage ? "Åpne i nytt vindu" : "Last ned fil"}>
                            {isImage ? <Visibility fontSize="small" /> : <AttachFileIcon fontSize="small" />}
                        </Tooltip>
                    </IconButton>

                    {/* Delete button */}
                    <IconButton
                        size="small"
                        onClick={() => {
                            if (window.confirm(`Er du sikker på at du vil slette "${cleanFilename}"?`)) {
                                pull_data(index)
                            }
                        }}
                        sx={{
                            color: '#d32f2f',
                            '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.1)'
                            }
                        }}
                    >
                        <Tooltip title="Slett vedlegg">
                            <DeleteIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>
                </Stack>
            </Box>
        )
    })

    const { verticalStatusUpdate, horizontalStatusUpdate, openStatusSnackbar } = openStatusUpdate
    // Allow any authenticated user to edit any issue (team collaboration)
    const isAuthor = !!auth.isAuthenticated()

    if (userinfo.redirectToSignin) {
        return <Navigate to="/signin" />
    }

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="h5">Loading...</Typography>
            </Box>
        )
    }

    return (
        <>
            <CssBaseline />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Slett sak</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Er du sikker på at du vil slette sak?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{
                            bgcolor: '#d32f2f',
                            color: 'white',
                            '&:hover': {
                                bgcolor: '#c62828'
                            }
                        }}
                    >
                        Ja
                    </Button>
                    <Button onClick={handleClose} variant="outlined">
                        Nei
                    </Button>
                </DialogActions>
            </Dialog>

                        <Box sx={{
                marginLeft: { xs: 0, sm: '288px' },
                marginTop: { xs: '72px', sm: '80px' },
                width: { xs: '100%', sm: 'calc(100% - 288px)' },
                minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 80px)' },
                bgcolor: '#EEEEEE',
                p: { xs: 2, md: 3 }
            }}>
                {/* Header Section */}
                <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
                        spacing={2}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                            <IconButton
                            size="large"
                            onClick={goHome}
                            sx={{
                                color: '#F79B72',
                                '&:hover': {
                                    bgcolor: 'rgba(247, 155, 114, 0.08)'
                                }
                            }}
                        >
                                <ArrowBackIcon />
                            </IconButton>
                            <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                                {/* Editable Title */}
                                {editing.summary ? (
                                    <TextField
                                        value={dataset.summary || ''}
                                        onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))}
                                        onBlur={() => updateSummary(dataset.summary)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updateSummary(dataset.summary)
                                            } else if (e.key === 'Escape') {
                                                setEditing(prev => ({ ...prev, summary: false }))
                                            }
                                        }}
                                        disabled={saving.summary}
                                        autoFocus
                                        variant="outlined"
                                        multiline
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: { xs: '1.5rem', md: '2.125rem' },
                                                fontWeight: 'bold',
                                                color: '#2A4759',
                                                borderColor: '#F79B72',
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#F79B72',
                                                },
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                py: 0.5
                                            }
                                        }}
                                    />
                                ) : (
                                    <Typography
                                        variant="h4"
                                        component="h1"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{
                                            wordBreak: 'break-word',
                                            overflow: 'hidden',
                                            fontSize: { xs: '1.5rem', md: '2.125rem' },
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: 'rgba(247, 155, 114, 0.08)',
                                                borderRadius: 1,
                                                px: 1
                                            },
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                        onClick={() => setEditing(prev => ({ ...prev, summary: true }))}
                                    >
                                        {dataset.summary || 'Untitled Issue'}
                                        {saving.summary && <CircularProgress size={20} sx={{ color: '#F79B72' }} />}
                                    </Typography>
                                )}
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1}
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    sx={{ flexWrap: 'wrap' }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Issue #{dataset._id?.slice(-8)}
                                    </Typography>
                                    {dataset.status && (
                                        <Chip
                                            label={`${getStatusChip(dataset.status).icon} ${dataset.status}`}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatusChip(dataset.status).color,
                                                color: 'white',
                                                fontWeight: 600,
                                                '& .MuiChip-label': {
                                                    px: 2
                                                }
                                            }}
                                        />
                                    )}
                                    {dataset.priority && (
                                        <Chip
                                            label={dataset.priority}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                borderColor: getPriorityChip(dataset.priority).color,
                                                color: getPriorityChip(dataset.priority).color,
                                                fontWeight: 600,
                                                '& .MuiChip-label': {
                                                    px: 2
                                                }
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Stack>
                        </Stack>
                        <Stack
                            direction={{ xs: 'row', md: 'row' }}
                            spacing={1}
                            sx={{
                                width: { xs: '100%', md: 'auto' },
                                justifyContent: { xs: 'flex-end', md: 'flex-start' }
                            }}
                        >

                            <Button
                                variant="contained"
                                startIcon={<DeleteIcon />}
                                onClick={handleClickOpen}
                                size="small"
                                sx={{
                                    bgcolor: '#d32f2f',
                                    color: 'white',
                                    px: 3,
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: '#c62828'
                                    }
                                }}
                            >
                                SLETT
                            </Button>
                            <IconButton
                                size="large"
                                onClick={toggleAside}
                                sx={{
                                    color: '#F79B72',
                                    '&:hover': {
                                        bgcolor: 'rgba(247, 155, 114, 0.08)'
                                    }
                                }}
                            >
                                <SettingsSuggestIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Paper>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Main Content Area */}
                    <Grid item xs={12} lg={showAside ? 8 : 12}>
                        <Stack spacing={3}>
                            {/* Reporter Information Card */}
                            <Card elevation={1}>
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ bgcolor: '#F79B72', width: 56, height: 56 }}>
                                            {dataset.reporter?.name?.charAt(0) || '?'}
                                        </Avatar>
                                    }
                                    title={
                                        <Typography variant="h6" fontWeight="medium">
                                            {dataset.reporter?.name || dataset.name || 'Ukjent bruker'}
                                        </Typography>
                                    }
                                    subheader={
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" color="text.secondary">
                                                Opprettet: {formattedDate(dataset.createdAt)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Sist oppdatert: {formattedDate(dataset.updatedAt)}
                                            </Typography>
                                        </Stack>
                                    }
                                />
                            </Card>



                            {/* Description Card */}
                            <Card elevation={1}>
                                <CardHeader
                                    title={
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <DescriptionIcon sx={{ color: '#F79B72' }} />
                                                <Typography variant="h6">Beskrivelse</Typography>
                                            </Stack>
                                            {editing.description && (
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        size="small"
                                                        onClick={updateDescription}
                                                        disabled={saving.description}
                                                        sx={{ color: '#F79B72' }}
                                                    >
                                                        {saving.description ? <CircularProgress size={16} /> : 'Lagre'}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={() => setEditing(prev => ({ ...prev, description: false }))}
                                                        disabled={saving.description}
                                                    >
                                                        Avbryt
                                                    </Button>
                                                </Stack>
                                            )}
                                        </Stack>
                                    }
                                />
                                <CardContent>
                                    <Box
                                        sx={{
                                            minHeight: 200,
                                            border: editing.description ? '2px solid #F79B72' : '1px solid #e0e0e0',
                                            borderRadius: 1,
                                            p: 2,
                                            cursor: editing.description ? 'text' : 'pointer',
                                            transition: 'border-color 0.2s ease',
                                            '&:hover': {
                                                borderColor: editing.description ? '#F79B72' : '#F79B72'
                                            }
                                        }}
                                        onClick={() => !editing.description && setEditing(prev => ({ ...prev, description: true }))}
                                    >
                                        <Editor
                                            editorState={editorStateDesc}
                                            readOnly={!editing.description}
                                            toolbarHidden={!editing.description}
                                            onEditorStateChange={onEditorStateChangeDesc}
                                            placeholder="Klikk for å redigere beskrivelse..."
                                        />
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Reproduction Steps Card */}
                            <Card elevation={1}>
                                <CardHeader
                                    title={
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <PlaylistAddCheckIcon sx={{ color: '#F79B72' }} />
                                                <Typography variant="h6">Steg for å reprodusere</Typography>
                                            </Stack>
                                            {editing.reproduction && (
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        size="small"
                                                        onClick={updateReproduction}
                                                        disabled={saving.reproduction}
                                                        sx={{ color: '#F79B72' }}
                                                    >
                                                        {saving.reproduction ? <CircularProgress size={16} /> : 'Lagre'}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={() => setEditing(prev => ({ ...prev, reproduction: false }))}
                                                        disabled={saving.reproduction}
                                                    >
                                                        Avbryt
                                                    </Button>
                                                </Stack>
                                            )}
                                        </Stack>
                                    }
                                />
                                <CardContent>
                                    <Box
                                        sx={{
                                            minHeight: 200,
                                            border: editing.reproduction ? '2px solid #F79B72' : '1px solid #e0e0e0',
                                            borderRadius: 1,
                                            p: 2,
                                            cursor: editing.reproduction ? 'text' : 'pointer',
                                            transition: 'border-color 0.2s ease',
                                            '&:hover': {
                                                borderColor: editing.reproduction ? '#F79B72' : '#F79B72'
                                            }
                                        }}
                                        onClick={() => !editing.reproduction && setEditing(prev => ({ ...prev, reproduction: true }))}
                                    >
                                        <Editor
                                            editorState={editorStateRep}
                                            readOnly={!editing.reproduction}
                                            toolbarHidden={!editing.reproduction}
                                            onEditorStateChange={onEditorStateChangeRep}
                                            placeholder="Klikk for å redigere reproduksjonssteg..."
                                        />
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Attachments Card */}
                            <Card elevation={1}>
                                <CardHeader
                                    title={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AttachFileIcon sx={{ color: '#F79B72' }} />
                                            <Typography variant="h6">Vedlegg</Typography>
                                        </Stack>
                                    }
                                />
                                <CardContent>
                                    <Stack spacing={2}>
                                        {ImageList.length > 0 ? ImageList : (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 4,
                                                backgroundColor: '#f8f9fa',
                                                border: '2px dashed #e0e0e0',
                                                borderRadius: 2,
                                                color: 'text.secondary'
                                            }}>
                                                <Stack alignItems="center" spacing={1}>
                                                    <AttachFileIcon sx={{ fontSize: 48 }} />
                                                    <Typography variant="body2">Ingen vedlegg</Typography>
                                                </Stack>
                                            </Box>
                                        )}
                                        <Previews imageBool={true} issueID={dataset._id} func_image={image_changes} />
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Comments Section */}
                            <Card elevation={1}>
                                <CardHeader
                                    title={
                                        <Typography variant="h6">
                                            Kommentarer ({comments.length})
                                        </Typography>
                                    }
                                />
                                <CardContent>
                                    {comments.length > 0 ? (
                                        <Comments
                                            comments={comments}
                                            issueID={dataset._id}
                                            userID={userinfo.user.id}
                                            onCommentsUpdated={getComments}
                                        />
                                    ) : (
                                        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                            <Typography variant="body2">Ingen kommentarer enda</Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Comment Form */}
                            <Card elevation={1}>
                                <CardContent>
                                    <CommentForm
                                        onSubmit={onSubmit}
                                        openNewComment={openNewComment}
                                        setOpenNewComment={setOpenNewComment}
                                    />
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>

                    {/* Sidebar */}
                    {showAside && (
                        <Grid item xs={12} lg={4}>
                            <Stack spacing={3} sx={{ position: { xs: 'relative', lg: 'sticky' }, top: { xs: 'auto', lg: 24 } }}>
                                {/* Actions & Status Card */}
                                <Card elevation={1}>
                                    <CardHeader
                                        title={<Typography variant="h6">Actions & Status</Typography>}
                                    />
                                    <CardContent>
                                        <Stack spacing={3}>
                                                                                        {/* Status Update */}
                            <FormControl fullWidth>
                                <TextField
                                    select
                                    label="Status"
                                    value={dataset.status || 'Åpen'}
                                    onChange={(e) => upDateIssueStatus(dataset._id, e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    disabled={saving.status}
                                    InputProps={{
                                        endAdornment: saving.status && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                                <CircularProgress size={16} sx={{ color: '#F79B72' }} />
                                            </Box>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: '#F79B72',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#F79B72',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#F79B72',
                                        },
                                    }}
                                >
                                    {Status.map((option) => (
                                        <MenuItem key={option.uniqueId} value={option.id}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                                            {/* Delegated User */}
                                            <Autocomplete
                                                options={users}
                                                getOptionLabel={(option) => option.name}
                                                value={dataset.delegated || null}
                                                onChange={(event, newValue) =>
                                                    upDateDelegated(dataset._id, newValue?._id || '')
                                                }
                                                disabled={saving.delegated}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Delegert til"
                                                        variant="outlined"
                                                        size="small"
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <>
                                                                    {saving.delegated && (
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                                                            <CircularProgress size={16} sx={{ color: '#F79B72' }} />
                                                                        </Box>
                                                                    )}
                                                                    {params.InputProps.endAdornment}
                                                                </>
                                                            )
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                '&:hover fieldset': {
                                                                    borderColor: '#F79B72',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: '#F79B72',
                                                                },
                                                            },
                                                            '& .MuiInputLabel-root.Mui-focused': {
                                                                color: '#F79B72',
                                                            },
                                                        }}
                                                    />
                                                )}
                                                size="small"
                                            />

                                            <Divider />

                                            {/* Timestamps */}
                                            <Stack spacing={2}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        <AccessTimeIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                        Opprettet
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formattedDateShort(dataset.createdAt)}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        <UpdateIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                        Oppdatert
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formattedDateShort(dataset.updatedAt)}
                                                    </Typography>
                                                </Box>
                                                                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <AssignmentIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                        Prosjekt
                                    </Typography>
                                    <Autocomplete
                                        options={projects}
                                        getOptionLabel={(option) => option.name || 'Ukjent prosjekt'}
                                        value={(() => {
                                            // Handle both _id and id fields for projects
                                            const projectId = dataset.project?._id || dataset.project?.id || dataset.project
                                            const foundProject = projects.find(p => (p._id === projectId || p.id === projectId)) || null
                                            console.log('🔍 Project Autocomplete Debug:', {
                                                datasetProject: dataset.project,
                                                projectId,
                                                foundProject,
                                                allProjects: projects.length,
                                                projectsWithIds: projects.map(p => ({ name: p.name, _id: p._id, id: p.id }))
                                            })
                                            return foundProject
                                        })()}
                                        onChange={(event, newValue) => {
                                            console.log('📝 Project selection change:', {
                                                newValue,
                                                newValueId: newValue?._id,
                                                newValueAltId: newValue?.id,
                                                isClearing: !newValue
                                            })
                                            updateProjectAssignment(newValue?._id || newValue?.id || null)
                                        }}
                                        disabled={saving.project}
                                        size="small"
                                        clearText="Fjern prosjekt"
                                        noOptionsText="Ingen prosjekt tilgjengelig"
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Velg prosjekt..."
                                                variant="outlined"
                                                size="small"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {saving.project && (
                                                                <CircularProgress size={16} sx={{ color: '#F79B72' }} />
                                                            )}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    )
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': { borderColor: '#F79B72' },
                                                        '&.Mui-focused fieldset': { borderColor: '#F79B72' },
                                                    },
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => {
                                            const { key, ...otherProps } = props;
                                            return (
                                                <Box component="li" key={key} {...otherProps}>
                                                    <Stack>
                                                        <Typography variant="body2" fontWeight="500">
                                                            {option.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {option.description || 'Ingen beskrivelse'}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            );
                                        }}
                                    />
                                    {errors.project && (
                                        <Alert severity="error" sx={{ mt: 1 }}>
                                            {errors.project}
                                        </Alert>
                                    )}
                                </Box>
                                            </Stack>

                                            {errors.delegated && (
                                                <Alert severity="error">
                                                    {errors.delegated}
                                                </Alert>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Issue Details Card */}
                                <Card elevation={1}>
                                    <CardHeader
                                        title={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <BugReportIcon sx={{ color: '#F79B72' }} />
                                                <Typography variant="h6">Issue Details</Typography>
                                            </Stack>
                                        }
                                    />
                                    <CardContent>
                                        <Stack spacing={2}>
                                            {/* Priority */}
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    <PriorityHighIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                    Prioritet
                                                </Typography>
                                                <Autocomplete
                                                    options={priorityOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={priorityOptions.find(option => option.text === dataset.priority) || null}
                                                    onChange={(event, newValue) => {
                                                        updateIssueField('priority', newValue?.text || '', 'Prioritet')
                                                    }}
                                                    disabled={saving.priority}
                                                    size="small"
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Velg prioritet"
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                endAdornment: (
                                                                    <>
                                                                        {saving.priority && (
                                                                            <CircularProgress size={16} sx={{ color: '#F79B72' }} />
                                                                        )}
                                                                        {params.InputProps.endAdornment}
                                                                    </>
                                                                )
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    '&:hover fieldset': { borderColor: '#F79B72' },
                                                                    '&.Mui-focused fieldset': { borderColor: '#F79B72' },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>

                                            {/* Category */}
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    <CategoryIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                    Kategori
                                                </Typography>
                                                <Autocomplete
                                                    options={categoryOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={categoryOptions.find(option => option.text === dataset.category) || null}
                                                    onChange={(event, newValue) => {
                                                        updateIssueField('category', newValue?.text || '', 'Kategori')
                                                    }}
                                                    disabled={saving.category}
                                                    size="small"
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Velg kategori"
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                endAdornment: (
                                                                    <>
                                                                        {saving.category && (
                                                                            <CircularProgress size={16} sx={{ color: '#F79B72' }} />
                                                                        )}
                                                                        {params.InputProps.endAdornment}
                                                                    </>
                                                                )
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    '&:hover fieldset': { borderColor: '#F79B72' },
                                                                    '&.Mui-focused fieldset': { borderColor: '#F79B72' },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>

                                            {/* Severity */}
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    <PriorityHighIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                    Alvorlighetsgrad
                                                </Typography>
                                                <Autocomplete
                                                    options={severityOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={severityOptions.find(option => option.text === dataset.severity) || null}
                                                    onChange={(event, newValue) => {
                                                        updateIssueField('severity', newValue?.text || '', 'Alvorlighetsgrad')
                                                    }}
                                                    disabled={saving.severity}
                                                    size="small"
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Velg alvorlighetsgrad"
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                endAdornment: (
                                                                    <>
                                                                        {saving.severity && (
                                                                            <CircularProgress size={16} sx={{ color: '#F79B72' }} />
                                                                        )}
                                                                        {params.InputProps.endAdornment}
                                                                    </>
                                                                )
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    '&:hover fieldset': { borderColor: '#F79B72' },
                                                                    '&.Mui-focused fieldset': { borderColor: '#F79B72' },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>

                                            {/* Reproducibility */}
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    <PlaylistAddCheckIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                    Reproduserbarhet
                                                </Typography>
                                                <Autocomplete
                                                    options={reproduceOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={reproduceOptions.find(option => option.text === dataset.reproduce) || null}
                                                    onChange={(event, newValue) => {
                                                        updateIssueField('reproduce', newValue?.text || '', 'Reproduserbarhet')
                                                    }}
                                                    disabled={saving.reproduce}
                                                    size="small"
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Velg reproduserbarhet"
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                endAdornment: (
                                                                    <>
                                                                        {saving.reproduce && (
                                                                            <CircularProgress size={16} sx={{ color: '#F79B72' }} />
                                                                        )}
                                                                        {params.InputProps.endAdornment}
                                                                    </>
                                                                )
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    '&:hover fieldset': { borderColor: '#F79B72' },
                                                                    '&.Mui-focused fieldset': { borderColor: '#F79B72' },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>

                                            {/* Delegated User (Read-only display since it's editable in main Actions section) */}
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                    Delegert til
                                                </Typography>
                                                <Typography variant="body1">{dataset.delegated?.name || 'Ikke delegert'}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>
                    )}
                </Grid>

                {/* Status Update Snackbar */}
                <Snackbar
                    anchorOrigin={{ vertical: verticalStatusUpdate, horizontal: horizontalStatusUpdate }}
                    open={openStatusSnackbar}
                    onClose={handleStatusUpdateClose}
                    autoHideDuration={3000}
                >
                    <Alert
                        severity="success"
                        variant="filled"
                        onClose={handleStatusUpdateClose}
                        sx={{
                            bgcolor: '#4CAF50',
                            '& .MuiAlert-icon': {
                                color: 'white'
                            }
                        }}
                    >
                        <AlertTitle sx={{ color: 'white', fontWeight: 600 }}>
                            Lagret automatisk
                        </AlertTitle>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                            {successMessage || 'Endringer lagret'}
                        </Typography>
                    </Alert>
                </Snackbar>
            </Box>

            {/* Attachment Preview Modal */}
            <Dialog
                open={previewModal.open}
                onClose={closePreviewModal}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogActions sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                    <IconButton
                        onClick={closePreviewModal}
                        sx={{
                            color: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.2)'
                            }
                        }}
                    >
                        <Typography variant="h6">×</Typography>
                    </IconButton>
                </DialogActions>

                <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {previewModal.isImage ? (
                        <Box
                            component="img"
                            src={previewModal.fileUrl}
                            alt={previewModal.filename}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: 1
                            }}
                        />
                    ) : (
                        <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
                            <InsertDriveFile sx={{ fontSize: 120, color: '#F79B72' }} />
                            <Typography variant="h5" color="white" textAlign="center">
                                {previewModal.filename}
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AttachFileIcon />}
                                onClick={() => window.open(previewModal.fileUrl, '_blank')}
                                sx={{
                                    bgcolor: '#F79B72',
                                    '&:hover': { bgcolor: '#e8895f' }
                                }}
                            >
                                Åpne fil
                            </Button>
                        </Stack>
                    )}

                    <Typography
                        variant="body1"
                        color="white"
                        sx={{ mt: 2, textAlign: 'center', opacity: 0.8 }}
                    >
                        {previewModal.filename}
                    </Typography>
                </DialogContent>
            </Dialog>
        </>
    )
}