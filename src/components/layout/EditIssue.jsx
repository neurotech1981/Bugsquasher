/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Assignment as AssignmentIcon,
    BugReport as BugReportIcon,
    Category as CategoryIcon,
    Delete as DeleteIcon,
    Description as DescriptionIcon,
    Edit as EditIcon,
    InsertDriveFile,
    Person as PersonIcon,
    PriorityHigh as PriorityHighIcon,
    Refresh as RefreshIcon,
    Save as SaveIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import ModalImage from 'react-modal-image'
import moment from 'moment'

import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'
import { getUsers } from '../utils/api-user'
import { getProjects } from '../../services/projectService'

const formattedDate = (value) => (value ? moment(value).format('DD/MM-YYYY HH:mm') : 'N/A')

const priorityOptions = [
    { value: 1, label: '❌ Ingen', color: '#9E9E9E' },
    { value: 2, label: '🟢 Lav', color: '#4CAF50' },
    { value: 3, label: '🟡 Normal', color: '#FF9800' },
    { value: 4, label: '🔴 Høy', color: '#F44336' },
    { value: 5, label: '🚨 Haster', color: '#E91E63' },
    { value: 6, label: '⚡ Øyeblikkelig', color: '#9C27B0' },
]

const severityOptions = [
    { value: 1, label: '📝 Tekst', color: '#2196F3' },
    { value: 2, label: '🔧 Justering', color: '#00BCD4' },
    { value: 3, label: '🔹 Triviell', color: '#4CAF50' },
    { value: 4, label: '🟡 Mindre alvorlig', color: '#FF9800' },
    { value: 5, label: '🔴 Alvorlig', color: '#F44336' },
    { value: 6, label: '💥 Kræsj', color: '#E91E63' },
    { value: 7, label: '🚫 Blokkering', color: '#9C27B0' },
]

const categoryOptions = [
    { value: 1, label: '🔹 Triviell', color: '#4CAF50' },
    { value: 2, label: '📝 Tekst', color: '#2196F3' },
    { value: 3, label: '🔧 Justering', color: '#00BCD4' },
    { value: 4, label: '🟡 Mindre alvorlig', color: '#FF9800' },
    { value: 5, label: '🔴 Alvorlig', color: '#F44336' },
    { value: 6, label: '💥 Kræsj', color: '#E91E63' },
    { value: 7, label: '🚫 Blokkering', color: '#9C27B0' },
]

const reproduceOptions = [
    { value: 2, label: '✅ Alltid', color: '#4CAF50' },
    { value: 3, label: '🔄 Noen ganger', color: '#FF9800' },
    { value: 4, label: '🎲 Tilfeldig', color: '#F44336' },
    { value: 5, label: '❓ Har ikke forsøkt', color: '#9E9E9E' },
    { value: 6, label: '🚫 Kan ikke reprodusere', color: '#E91E63' },
    { value: 7, label: '⛔ Ingen', color: '#9C27B0' },
]

const statusOptions = [
    { value: 0, label: '📋 Åpen', color: '#F79B72' },
    { value: 1, label: '✅ Løst', color: '#4CAF50' },
    { value: 2, label: '🔒 Lukket', color: '#9E9E9E' },
    { value: 3, label: '⚡ Under arbeid', color: '#2A4759' },
]

export default function EditIssue() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [dataset, setData] = useState({})
    const [users, setUsers] = useState([])
    const [projects, setProjects] = useState([])
    const [images, setImages] = useState([])
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [dataFetched, setDataFetched] = useState(false)

    // Editor states
    const [editorStateDesc, setEditorStateDesc] = useState(EditorState.createEmpty())
    const [editorStateRep, setEditorStateRep] = useState(EditorState.createEmpty())

    const goBack = () => {
        navigate(-1)
    }

    const handleDataChange = (name) => (event) => {
        setData({
            ...dataset,
            [name]: event.target.value,
        })
    }

    // Fetch users data
    const fetchUsers = async () => {
        const jwt = auth.isAuthenticated()
        if (!jwt) return

        try {
            const data = await getUsers({ t: jwt.token })
            if (data.error) {
                setErrors((prev) => ({ ...prev, users: 'Failed to load users' }))
                return
            }
            setUsers(data.data || [])
        } catch (err) {
            console.error('Error fetching users:', err)
            setErrors((prev) => ({ ...prev, users: 'Failed to load users' }))
        }
    }

    // Fetch projects data
    const fetchProjects = async () => {
        const jwt = auth.isAuthenticated()
        if (!jwt) return

        try {
            const data = await getProjects(jwt.token)
            if (data.error) {
                setErrors((prev) => ({ ...prev, projects: 'Failed to load projects' }))
                return
            }
            setProjects(data.data || [])
        } catch (err) {
            console.error('Error fetching projects:', err)
            setErrors((prev) => ({ ...prev, projects: 'Failed to load projects' }))
        }
    }

    // Fetch issue data by ID
    const getIssueByID = async (id, token) => {
        try {
            setLoading(true)
            const res = await issueService.getIssueByID(id, token)

            // Parse description
            try {
                if (res.description) {
                    const descContent = JSON.parse(res.description)
                    const editorStateDesc = EditorState.createWithContent(convertFromRaw(descContent))
                    setEditorStateDesc(editorStateDesc)
                }
            } catch (err) {
                console.error('Error parsing description:', err)
                setEditorStateDesc(EditorState.createEmpty())
            }

            // Parse reproduction steps
            try {
                if (res.step_reproduce) {
                    const repContent = JSON.parse(res.step_reproduce)
                    const editorStateRep = EditorState.createWithContent(convertFromRaw(repContent))
                    setEditorStateRep(editorStateRep)
                }
            } catch (err) {
                console.error('Error parsing reproduction steps:', err)
                setEditorStateRep(EditorState.createEmpty())
            }

            setData(res)

            // Handle images
            if (
                !res.imageName ||
                res.imageName === '' ||
                res.imageName === '[none]' ||
                res.imageName === 'none' ||
                res.imageName === undefined
            ) {
                setImages(['none'])
            } else {
                setImages(res.imageName)
            }

            return true
        } catch (err) {
            console.error('Error fetching issue:', err)
            setErrors((prev) => ({ ...prev, fetch: 'Failed to load issue' }))
            return false
        } finally {
            setLoading(false)
        }
    }

    // Load data on component mount
    useEffect(() => {
        const jwt = auth.isAuthenticated()
        if (!jwt) {
            navigate('/signin')
            return
        }

        if (!dataFetched) {
            const loadData = async () => {
                await Promise.all([getIssueByID(id, jwt.token), fetchUsers(), fetchProjects()])
                setDataFetched(true)
            }

            loadData()
        }
    }, [id, dataFetched, navigate])

    const updateIssueByID = async () => {
        try {
            setSaving(true)
            const jwt = auth.isAuthenticated()
            if (!jwt) {
                navigate('/signin')
                return
            }

            const issueId = dataset._id
            if (!issueId) {
                setErrors((prev) => ({ ...prev, general: 'Missing issue ID' }))
                return
            }

            // Prepare updated data
            const updatedData = { ...dataset }

            // Ensure project is sent as ID only (not the full object)
            if (updatedData.project && typeof updatedData.project === 'object') {
                updatedData.project = updatedData.project._id
            }

            // Convert editor content to raw JSON
            const htmlContentStateDesc = JSON.stringify(convertToRaw(editorStateDesc.getCurrentContent()))
            updatedData.description = htmlContentStateDesc

            const htmlContentStateRep = JSON.stringify(convertToRaw(editorStateRep.getCurrentContent()))
            updatedData.step_reproduce = htmlContentStateRep

            // Send update request
            await issueService.upDateIssue(issueId, updatedData, jwt.token)

            // Navigate back to issue view
            navigate('/vis-sak/' + issueId)
        } catch (err) {
            console.error('Error updating issue:', err)
            setErrors((prev) => ({ ...prev, general: 'Failed to update issue' }))
        } finally {
            setSaving(false)
        }
    }

    const onDelete = async () => {
        try {
            setSaving(true)
            const jwt = auth.isAuthenticated()
            if (!jwt) {
                navigate('/signin')
                return
            }

            const issueId = dataset._id
            if (!issueId) {
                setErrors((prev) => ({ ...prev, general: 'Missing issue ID' }))
                return
            }

            await issueService.deleteIssueByID(issueId, jwt.token)

            const userId = jwt && jwt.user ? jwt.user._id : null
            if (userId) {
                navigate('/saker/' + userId)
            } else {
                navigate('/signin')
            }
        } catch (err) {
            console.error('Error deleting issue:', err)
            setErrors((prev) => ({ ...prev, general: 'Failed to delete issue' }))
        } finally {
            setSaving(false)
        }
    }

    const onEditorStateChangeDesc = (editorState) => {
        setEditorStateDesc(editorState)
    }

    const onEditorStateChangeRep = (editorState) => {
        setEditorStateRep(editorState)
    }

    // Render attachments
    const attachmentList = images.map((file, index) => {
        if (file === 'none') return null

        const path = file.path || file
        const fileUrl = process.env.NODE_ENV === 'production'
            ? `https://bug-tracker-backend-5m7k.onrender.com/assets/uploads/${path}`
            : `http://localhost:3001/assets/uploads/${path}`

        const fileExtension = path.split('.').pop()?.toLowerCase()
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
        const isImage = imageExtensions.includes(fileExtension)

        // Extract clean filename using UUID regex
        const cleanFilename = (() => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i;
            const match = path.match(uuidRegex);
            return match ? match[1] : path;
        })()

        return (
            <Paper
                key={index}
                elevation={1}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                        borderColor: '#F79B72',
                        elevation: 2
                    },
                    transition: 'all 0.2s ease'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    {/* File Icon/Preview */}
                    <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isImage ? 'transparent' : '#f8f9fa'
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
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    // Simple modal for image preview
                                    const modal = document.createElement('div');
                                    modal.style.cssText = `
                                        position: fixed;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        height: 100%;
                                        background: rgba(0,0,0,0.9);
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        z-index: 9999;
                                        cursor: pointer;
                                    `;
                                    const img = document.createElement('img');
                                    img.src = fileUrl;
                                    img.style.cssText = 'max-width: 90%; max-height: 90%; object-fit: contain;';
                                    modal.appendChild(img);
                                    modal.onclick = () => document.body.removeChild(modal);
                                    document.body.appendChild(modal);
                                }}
                            />
                        ) : (
                            <InsertDriveFile sx={{ fontSize: 32, color: '#F79B72' }} />
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
                    <Stack direction="row" spacing={1}>
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
                            <InsertDriveFile fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>
            </Paper>
        )
    })

    // Form field styling
    const fieldStyling = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
                borderColor: '#F79B72',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#F79B72',
                borderWidth: 1,
            },
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#F79B72',
        },
        '& .MuiOutlinedInput-input': {
            padding: '14px 16px',
        },
    }

    if (loading) {
        return (
            <Box sx={{
                marginLeft: { xs: 0, sm: '288px' },
                marginTop: { xs: '72px', sm: '80px' },
                width: { xs: '100%', sm: 'calc(100% - 288px)' },
                minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 80px)' },
                bgcolor: '#EEEEEE',
                p: { xs: 2, md: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center', maxWidth: 400 }}>
                    <CircularProgress sx={{ color: '#F79B72', mb: 3 }} size={56} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Laster saksdata...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vennligst vent mens vi henter saksinformasjon
                    </Typography>
                </Paper>
            </Box>
        )
    }

    return (
        <Box sx={{
            marginLeft: { xs: 0, sm: '288px' },
            marginTop: { xs: '72px', sm: '80px' },
            width: { xs: '100%', sm: 'calc(100% - 288px)' },
            minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 80px)' },
            bgcolor: '#EEEEEE',
            p: { xs: 2, md: 3 }
        }}>
            <Container maxWidth="lg" sx={{ px: 0 }}>
                {/* Header Section */}
                <Paper elevation={0} sx={{
                    p: { xs: 3, md: 4 },
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid rgba(221, 221, 221, 0.3)',
                    bgcolor: 'white'
                }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton
                            size="medium"
                            onClick={goBack}
                            sx={{
                                color: '#F79B72',
                                '&:hover': {
                                    bgcolor: 'rgba(247, 155, 114, 0.04)',
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <EditIcon sx={{ color: '#F79B72', fontSize: 24, mr: 1 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography
                                variant="h4"
                                component="h1"
                                fontWeight="700"
                                sx={{
                                    color: '#2A4759',
                                    fontSize: { xs: '1.75rem', md: '2rem' },
                                    lineHeight: 1.2,
                                    mb: 0.5
                                }}
                            >
                                {dataset.summary || 'Rediger sak'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Opprettet: {formattedDate(dataset.createdAt)} • Sist oppdatert: {formattedDate(dataset.updatedAt)}
                            </Typography>
                        </Box>
                        {dataset.reporter && (
                            <Avatar
                                sx={{
                                    bgcolor: '#2A4759',
                                    color: 'white',
                                    width: 48,
                                    height: 48,
                                    fontSize: '1.2rem',
                                    fontWeight: 600
                                }}
                            >
                                {dataset.reporter?.name?.charAt(0) || '?'}
                            </Avatar>
                        )}
                    </Stack>
                </Paper>
                {errors.general && (
                    <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
                        {errors.general}
                    </Alert>
                )}

                <Stack spacing={3}>
                    {/* Basic Information Card */}
                    <Card elevation={0} sx={{
                        border: '1px solid rgba(221, 221, 221, 0.3)',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            bgcolor: 'rgba(247, 155, 114, 0.02)',
                            borderBottom: '1px solid rgba(221, 221, 221, 0.3)',
                            p: 3
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <BugReportIcon sx={{ color: '#F79B72', fontSize: 24 }} />
                                <Typography variant="h5" fontWeight="700" color="#2A4759">
                                    Grunnleggende informasjon
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                {/* Issue Name */}
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        name="summary"
                                        label="Saksnavn"
                                        variant="outlined"
                                        value={dataset.summary || ''}
                                        onChange={handleDataChange('summary')}
                                        fullWidth
                                        required
                                        sx={fieldStyling}
                                    />
                                </Grid>

                                {/* Status */}
                                <Grid item xs={12} md={4}>
                                    <Autocomplete
                                        options={statusOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={statusOptions.find(option =>
                                            option.label.includes(dataset.status)
                                        ) || null}
                                        onChange={(event, newValue) => {
                                            const statusText = newValue?.label?.replace(/^[^\s]+\s/, '') || 'Åpen'
                                            setData(prev => ({ ...prev, status: statusText }))
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Status"
                                                fullWidth
                                                sx={fieldStyling}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ gap: 1 }}>
                                                <Chip
                                                    label={option.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: option.color,
                                                        color: 'white',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Classification Card */}
                    <Card elevation={0} sx={{
                        border: '1px solid rgba(221, 221, 221, 0.3)',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            bgcolor: 'rgba(247, 155, 114, 0.02)',
                            borderBottom: '1px solid rgba(221, 221, 221, 0.3)',
                            p: 3
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <CategoryIcon sx={{ color: '#F79B72', fontSize: 24 }} />
                                <Typography variant="h5" fontWeight="700" color="#2A4759">
                                    Klassifisering
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                {/* Priority */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={priorityOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={priorityOptions.find(option =>
                                            option.label.includes(dataset.priority)
                                        ) || null}
                                        onChange={(event, newValue) => {
                                            const priorityText = newValue?.label?.replace(/^[^\s]+\s/, '') || ''
                                            setData(prev => ({ ...prev, priority: priorityText }))
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Prioritet"
                                                fullWidth
                                                sx={fieldStyling}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ gap: 1 }}>
                                                <Chip
                                                    label={option.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: option.color,
                                                        color: 'white',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                </Grid>

                                {/* Severity */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={severityOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={severityOptions.find(option =>
                                            option.label.includes(dataset.severity)
                                        ) || null}
                                        onChange={(event, newValue) => {
                                            const severityText = newValue?.label?.replace(/^[^\s]+\s/, '') || ''
                                            setData(prev => ({ ...prev, severity: severityText }))
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Alvorlighetsgrad"
                                                fullWidth
                                                sx={fieldStyling}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ gap: 1 }}>
                                                <Chip
                                                    label={option.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: option.color,
                                                        color: 'white',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                </Grid>

                                {/* Category */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={categoryOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={categoryOptions.find(option =>
                                            option.label.includes(dataset.category)
                                        ) || null}
                                        onChange={(event, newValue) => {
                                            const categoryText = newValue?.label?.replace(/^[^\s]+\s/, '') || ''
                                            setData(prev => ({ ...prev, category: categoryText }))
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Kategori"
                                                fullWidth
                                                sx={fieldStyling}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ gap: 1 }}>
                                                <Chip
                                                    label={option.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: option.color,
                                                        color: 'white',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                </Grid>

                                {/* Reproducibility */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={reproduceOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={reproduceOptions.find(option =>
                                            option.label.includes(dataset.reproduce)
                                        ) || null}
                                        onChange={(event, newValue) => {
                                            const reproduceText = newValue?.label?.replace(/^[^\s]+\s/, '') || ''
                                            setData(prev => ({ ...prev, reproduce: reproduceText }))
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Reproduserbarhet"
                                                fullWidth
                                                sx={fieldStyling}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ gap: 1 }}>
                                                <Chip
                                                    label={option.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: option.color,
                                                        color: 'white',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Assignment Card */}
                    <Card elevation={0} sx={{
                        border: '1px solid rgba(221, 221, 221, 0.3)',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            bgcolor: 'rgba(247, 155, 114, 0.02)',
                            borderBottom: '1px solid rgba(221, 221, 221, 0.3)',
                            p: 3
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <PersonIcon sx={{ color: '#F79B72', fontSize: 24 }} />
                                <Typography variant="h5" fontWeight="700" color="#2A4759">
                                    Tildeling
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                {/* Project */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={projects}
                                        getOptionLabel={(option) => option.title || ''}
                                        value={projects.find(project => project._id === dataset.project) || null}
                                        onChange={(event, newValue) => {
                                            setData(prev => ({ ...prev, project: newValue?._id || '' }))
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Prosjekt"
                                                fullWidth
                                                sx={fieldStyling}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Assigned To */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={users}
                                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                                        value={users.find(user => user._id === dataset.assigned_to) || null}
                                        onChange={(event, newValue) => {
                                            setData(prev => ({ ...prev, assigned_to: newValue?._id || '' }))
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Tildelt bruker"
                                                fullWidth
                                                sx={fieldStyling}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#F79B72' }}>
                                                        {option.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body1">
                                                            {option.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {option.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Content Card */}
                    <Card elevation={0} sx={{
                        border: '1px solid rgba(221, 221, 221, 0.3)',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            bgcolor: 'rgba(247, 155, 114, 0.02)',
                            borderBottom: '1px solid rgba(221, 221, 221, 0.3)',
                            p: 3
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <DescriptionIcon sx={{ color: '#F79B72', fontSize: 24 }} />
                                <Typography variant="h5" fontWeight="700" color="#2A4759">
                                    Beskrivelse og reproduksjon
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                {/* Description */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" fontWeight={600} color="#2A4759" sx={{ mb: 2 }}>
                                        Beskrivelse
                                    </Typography>
                                    <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                                        <Editor
                                            placeholder="Skriv inn detaljert beskrivelse av saken..."
                                            editorState={editorStateDesc}
                                            editorStyle={{
                                                backgroundColor: 'white',
                                                minHeight: '200px',
                                                padding: '16px',
                                                border: 'none',
                                                fontSize: '14px',
                                                lineHeight: '1.5'
                                            }}
                                            toolbarStyle={{
                                                borderBottom: '1px solid rgba(221, 221, 221, 0.3)',
                                                marginBottom: '0px',
                                                padding: '8px',
                                                backgroundColor: 'rgba(247, 155, 114, 0.02)'
                                            }}
                                            onEditorStateChange={onEditorStateChangeDesc}
                                        />
                                    </Paper>
                                </Grid>

                                {/* Reproduction Steps */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" fontWeight={600} color="#2A4759" sx={{ mb: 2 }}>
                                        Steg for å reprodusere
                                    </Typography>
                                    <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(221, 221, 221, 0.3)' }}>
                                        <Editor
                                            placeholder="Beskriv stegene for å reprodusere problemet..."
                                            editorState={editorStateRep}
                                            editorStyle={{
                                                backgroundColor: 'white',
                                                minHeight: '200px',
                                                padding: '16px',
                                                border: 'none',
                                                fontSize: '14px',
                                                lineHeight: '1.5'
                                            }}
                                            toolbarStyle={{
                                                borderBottom: '1px solid rgba(221, 221, 221, 0.3)',
                                                marginBottom: '0px',
                                                padding: '8px',
                                                backgroundColor: 'rgba(247, 155, 114, 0.02)'
                                            }}
                                            onEditorStateChange={onEditorStateChangeRep}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Attachments Card */}
                    {images && images.length > 0 && images[0] !== 'none' && (
                        <Card elevation={0} sx={{
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            borderRadius: 3,
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                bgcolor: 'rgba(247, 155, 114, 0.02)',
                                borderBottom: '1px solid rgba(221, 221, 221, 0.3)',
                                p: 3
                            }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <AssignmentIcon sx={{ color: '#F79B72', fontSize: 24 }} />
                                    <Typography variant="h5" fontWeight="700" color="#2A4759">
                                        Vedlegg
                                    </Typography>
                                </Stack>
                            </Box>
                            <CardContent sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    {attachmentList}
                                </Stack>
                            </CardContent>
                        </Card>
                    )}
                </Stack>

                {/* Action Buttons */}
                <Box sx={{
                    p: { xs: 3, md: 4 },
                    bgcolor: 'rgba(247, 155, 114, 0.02)',
                    borderTop: '1px solid rgba(221, 221, 221, 0.3)',
                    borderRadius: '0 0 12px 12px',
                    mt: 3
                }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="space-between"
                    >
                        <Button
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={onDelete}
                            disabled={saving}
                            sx={{
                                borderColor: '#f44336',
                                color: '#f44336',
                                px: 3,
                                py: 1.5,
                                fontWeight: 600,
                                borderRadius: 3,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#d32f2f',
                                    bgcolor: 'rgba(244, 67, 54, 0.04)',
                                }
                            }}
                        >
                            {saving ? 'Sletter...' : 'Slett sak'}
                        </Button>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="outlined"
                                onClick={goBack}
                                disabled={saving}
                                sx={{
                                    borderColor: '#2A4759',
                                    color: '#2A4759',
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: '#1e3440',
                                        bgcolor: 'rgba(42, 71, 89, 0.04)',
                                    }
                                }}
                            >
                                Avbryt
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={updateIssueByID}
                                disabled={saving}
                                sx={{
                                    bgcolor: '#F79B72',
                                    color: 'white',
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 20px rgba(247, 155, 114, 0.4)',
                                    '&:hover': {
                                        bgcolor: '#e8895f',
                                        boxShadow: '0 6px 25px rgba(247, 155, 114, 0.6)',
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {saving ? 'Lagrer...' : 'Lagre endringer'}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Container>
        </Box>
    )
}
