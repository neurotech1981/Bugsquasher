/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import issueService from '../../services/issueService'
import '../../App.css'
import CommentForm from '../Comments/CommentForm'
import Comments from '../Comments/Comments'
import moment from 'moment'
import CssBaseline from '@mui/material/CssBaseline'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import DeleteIcon from '@mui/icons-material/Delete'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Autocomplete from '@mui/material/Autocomplete'
import Alert from '@mui/material/Alert'
import { AlertTitle } from '@mui/lab'
import UpdateIcon from '@mui/icons-material/Update'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import CategoryIcon from '@mui/icons-material/Category'
import BugReportIcon from '@mui/icons-material/BugReport'
import PersonIcon from '@mui/icons-material/Person'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DescriptionIcon from '@mui/icons-material/Description'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import Avatar from '@mui/material/Avatar'
import MenuItem from '@mui/material/MenuItem'
import ModalImage from 'react-modal-image'
import { deepPurple } from '@mui/material/colors'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import Box from '@mui/material/Box'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import auth from '../auth/auth-helper'
import { EditorState, convertFromRaw } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { findUserProfile, getUsers } from '../utils/api-user'
import DeleteImageDialog from '../Dialogs/DeleteImage'
import Previews from './ImageUploader'
import { InsertDriveFile } from '@mui/icons-material'

const drawerWidth = 240

const formattedDate = (value) => (value ? moment(value).format('DD/MM-YYYY') : 'N/A')

// Helper function to get status chip color and icon
const getStatusChip = (status) => {
    const statusMap = {
        'Åpen': { color: 'error', icon: '🔓' },
        'Løst': { color: 'success', icon: '✅' },
        'Lukket': { color: 'default', icon: '🔐' },
        'Under arbeid': { color: 'warning', icon: '👷' }
    }
    return statusMap[status] || { color: 'default', icon: '❓' }
}

// Helper function to get priority chip color
const getPriorityChip = (priority) => {
    const priorityMap = {
        'Høy': { color: 'error' },
        'Middels': { color: 'warning' },
        'Lav': { color: 'success' },
        'Øyeblikkelig': { color: 'error' }
    }
    return priorityMap[priority] || { color: 'default' }
}

const theme = createTheme({
    typography: {
        body1: {
            fontWeight: 600,
        },
    },
})

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
    },
    paper: {
        flexShrink: 0,
    },
    button: {
        margin: theme.spacing(1),
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(2),
        paddingTop: '50px',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: '100%',
    },
    dateText: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: '100%',
        color: 'black',
    },
    textFieldStatus: {
        margin: theme.spacing(0),
        width: '100%',
        marginTop: '0',
    },
    avatar: {
        margin: 10,
    },
    purpleAvatar: {
        margin: 0,
        left: 0,
        width: '70px',
        height: '70px',
        color: '#fff',
        backgroundColor: deepPurple[500],
    },
    formControl: {
        margin: theme.spacing(1),
    },
    flexContainer: {
        display: 'grid',
        position: 'absolute', // Fixed typo: posistion -> position
        flexDirection: 'row',
        width: '50vh',
        height: '50%',
        padding: '1rem',
        backgroundColor: 'azure',
    },
    icon: {
        margin: theme.spacing(1), // Fixed syntax: 'theme.spacing(1)' -> theme.spacing(1)
        fontSize: 24,
        position: 'absolute',
        top: '0',
        right: '0',
        cursor: 'pointer',
        borderColor: 'black',
        color: 'gray',
        backgroundColor: 'transparent',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
            color: 'darkred',
            boxShadow: '0 0px 0px 0px rgba(0, 0, 0, .3)',
        },
    },
    thumb: {
        display: '-webkit-inline-box',
        position: 'relative',
        borderRadius: 2,
        border: '3px solid #eaeaea',
        marginBottom: 8,
        height: 150,
        padding: 4,
        boxSizing: 'border-box',
        marginLeft: '10px',
        margin: '0 auto',
        '&:after': {
            content: '""', // Fixed empty string: '' -> '""'
            display: 'table',
            clear: 'both',
        },
    },
    BoxErrorField: {
        // Added missing style
        color: 'red',
        fontSize: '0.8rem',
        marginTop: '0.5rem',
    },
}))

// Status options moved outside component
const Status = [
    { value: 0, label: '🔓 Åpen', id: 'Åpen', uniqueId: 'status-open' },
    { value: 1, label: '✅ Løst', id: 'Løst', uniqueId: 'status-solved' },
    { value: 2, label: '🔐 Lukket', id: 'Lukket', uniqueId: 'status-closed' },
    { value: 3, label: '👷 Under arbeid', id: 'Under arbeid', uniqueId: 'status-in-progress' },
]

export default function ViewIssue() {
    const classes = useStyles()
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
        delegated: false
    })
    const [successMessage, setSuccessMessage] = useState('')
    const [userinfo, setUserinfo] = useState({
        user: {},
        redirectToSignin: false,
    })
    const [errors, setErrors] = useState({})
    const [open, setOpen] = useState(false)
    const [openNewComment, setOpenNewComment] = useState(false)
    const [comments, setComments] = useState([])
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

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
            console.log('=== ViewIssue Issue Data Debug ===')
            console.log('Full result:', result)
            console.log('Project field:', result.project)
            console.log('Project name:', result.project?.name)
            console.log('Project _id:', result.project?._id)

            // Set images
            setImages(result.imageName && result.imageName.length > 0 ? result.imageName : ['none'])

            // Set issue data
            setData(result)

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

        const jwt = auth.isAuthenticated()
        try {
            await issueService.upDateIssueStatus(issueId, { status }, jwt.token)
            setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })
            setData((prevData) => ({ ...prevData, status }))
        } catch (error) {
            console.error('Update issue error: ', error)
            setErrors((prev) => ({ ...prev, status: 'Failed to update status' }))
        }
    }

    // Update delegated user
    const upDateDelegated = async (issueId, userId) => {
        if (!issueId || !userId) return

        const jwt = auth.isAuthenticated()
        try {
            const selectedUser = users.find((user) => user._id === userId)
            if (!selectedUser) {
                setErrors((prev) => ({ ...prev, delegated: 'User not found' }))
                return
            }

            await issueService.upDateDelegated(issueId, { delegated: selectedUser._id }, jwt.token)
            setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })
            setData((prevData) => ({ ...prevData, delegated: selectedUser }))
        } catch (error) {
            console.error('Update delegated user error: ', error)
            setErrors((prev) => ({ ...prev, delegated: 'Failed to update delegated user' }))
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
            return <div key={index}>Ingen vedlegg</div>
        }

        let path = file.path
        if (Array.isArray(file) && file[0] && file[0].path) {
            path = file[0].path
        } else if (!file.path) {
            return <div key={index}>Ingen vedlegg</div>
        }

                                const fileUrl = `http://localhost:3001/assets/uploads/${path}`
        const fileExtension = path.split('.').pop()?.toLowerCase()
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)

        return (
            <div key={index} className={classes.thumb}>
                <DeleteImageDialog
                    imageIndex={index}
                    images={images}
                    func={pull_data}
                    issueID={dataset._id}
                    name={path}
                />
                {isImage ? (
                    <Box
                        component="img"
                        src={fileUrl}
                        alt={path}
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
                        onClick={() => openPreviewModal(fileUrl, path.split('-').slice(1).join('-') || path, true)}
                    />
                ) : (
                    <Box
                        sx={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '16px',
                            textAlign: 'center',
                            backgroundColor: '#f5f5f5',
                            margin: '8px 0',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.02)',
                                borderColor: '#F79B72'
                            }
                        }}
                        onClick={() => openPreviewModal(fileUrl, path.split('-').slice(1).join('-') || path, false)}
                    >
                        <Stack spacing={1} alignItems="center">
                            <InsertDriveFile style={{ fontSize: 48, color: '#F79B72' }} />
                            <Typography variant="body2" fontWeight="bold">
                                {path.split('-').slice(1).join('-') || path}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {fileExtension?.toUpperCase()} File
                            </Typography>
                        </Stack>
                    </Box>
                )}
            </div>
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
        <div className={classes.root}>
            <CssBaseline />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Slett sak'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Er du sikker på at du vil slette sak?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDelete} color="primary" variant="contained">
                        Ja
                    </Button>
                    <Button onClick={handleClose} variant="outlined">
                        Nei
                    </Button>
                </DialogActions>
            </Dialog>

            <nav className={classes.drawer} aria-label="Drawer" />

            <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
                {/* Header with Navigation */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton size="large" onClick={goHome} color="primary">
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" component="h1" fontWeight="bold">
                                Issue #{dataset._id?.slice(-8)}
                            </Typography>
                            {dataset.status && (
                                <Chip
                                    label={`${getStatusChip(dataset.status).icon} ${dataset.status}`}
                                    color={getStatusChip(dataset.status).color}
                                    variant="outlined"
                                />
                            )}
                        </Stack>
                        <IconButton size="large" onClick={toggleAside} color="primary">
                            <SettingsSuggestIcon />
                        </IconButton>
                    </Stack>
                </Paper>

                <Grid container spacing={3}>
                    {/* Main Content Area */}
                    <Grid item xs={12} lg={showAside ? 8 : 12}>
                        <Stack spacing={3}>

                        {/* Reporter info */}
                        <div className="item1" style={{ paddingLeft: '5rem' }}>
                            <Typography variant="h6">
                                {dataset.reporter?.name || dataset.name || 'Ukjent bruker'}
                            </Typography>
                            <Typography variant="subtitle2">Opprettet: {formattedDate(dataset.createdAt)}</Typography>
                        </div>

                        {/* Priority */}
                        <div className="item2">
                            <TextField
                                label="Priority"
                                value={dataset.priority || ''}
                                className={classes.textField}
                                margin="normal"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </div>

                        {/* Last updated */}
                        <div className="item3">
                            <TextField
                                label="Sist oppdatert"
                                value={formattedDate(dataset.updatedAt)}
                                className={classes.textField}
                                margin="normal"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </div>

                        {/* Attachments */}
                        <div className="item14">
                            <InputLabel shrink htmlFor="select-multiple-native">
                                Vedlegg
                            </InputLabel>
                            {ImageList.length > 0 ? ImageList : <div>Ingen vedlegg</div>}
                            <Previews imageBool={true} issueID={dataset._id} func_image={image_changes} />
                        </div>

                        {/* Category */}
                        <div className="item4">
                            <TextField
                                label="Kategori"
                                value={dataset.category || ''}
                                className={classes.textField}
                                margin="normal"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </div>

                        {/* Avatar */}
                        <div className="item1">
                            <Grid container alignItems="flex-start">
                                <Avatar alt="Profile picture" className={classes.purpleAvatar}>
                                    {dataset.reporter?.name?.charAt(0) || '?'}
                                </Avatar>
                            </Grid>
                        </div>

                        {/* Severity */}
                        <div className="item7">
                            <TextField
                                label="Alvorlighetsgrad"
                                value={dataset.severity || ''}
                                className={classes.textField}
                                margin="normal"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </div>

                        {/* Reproducibility */}
                        <div className="item8">
                            <TextField
                                label="Mulighet å reprodusere"
                                value={dataset.reproduce || ''}
                                className={classes.textField}
                                margin="normal"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </div>

                        {/* Delegated to */}
                        <div className="item15">
                            <TextField
                                label="Delegert til"
                                value={dataset.delegated?.name || ''}
                                className={classes.textField}
                                margin="normal"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </div>

                        {/* Summary */}
                        <div className="item12">
                            <TextField
                                multiline
                                label="Oppsummering"
                                value={dataset.summary || ''}
                                className={classes.textField}
                                margin="normal"
                                variant="standard"
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </div>

                        {/* Description */}
                        <div className="item11">
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={theme}>
                                    <Typography gutterBottom variant="body1">
                                        Beskrivelse
                                    </Typography>
                                </ThemeProvider>
                            </StyledEngineProvider>
                            <Editor
                                placeholder="Skriv inn tekst her..."
                                editorState={editorStateDesc}
                                readOnly={true}
                                toolbarHidden={true}
                                editorStyle={{
                                    minHeight: '400px',
                                    padding: '1em',
                                    borderRadius: '0.5rem 0.5rem 0.5rem 0.5rem',
                                    border: '1px solid rgb(209 213 219 / 30%)',
                                }}
                                wrapperClassName="demo-wrapper"
                                toolbarClassName="flex sticky top-0 z-20 !justify-start"
                                editorClassName="mt-5 shadow-sm border min-h-editor p-2"
                                onEditorStateChange={onEditorStateChangeDesc}
                                toolbar={{
                                    link: { inDropdown: true },
                                    list: { inDropdown: true },
                                    options: [
                                        'fontFamily',
                                        'inline',
                                        'blockType',
                                        'fontSize',
                                        'list',
                                        'image',
                                        'textAlign',
                                        'colorPicker',
                                        'link',
                                        'embedded',
                                        'emoji',
                                        'remove',
                                        'history',
                                    ],
                                    inline: {
                                        options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
                                    },
                                }}
                                hashtag={{
                                    separator: ' ',
                                    trigger: '#',
                                }}
                            />
                        </div>

                        {/* Reproduction steps */}
                        <div className="item13">
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={theme}>
                                    <Typography gutterBottom variant="body1">
                                        Steg for å reprodusere
                                    </Typography>
                                </ThemeProvider>
                            </StyledEngineProvider>
                            <Editor
                                placeholder=""
                                readOnly={true}
                                toolbarHidden={true}
                                editorState={editorStateRep}
                                editorStyle={{
                                    minHeight: '400px',
                                    padding: '2em',
                                    borderRadius: '0.5rem 0.5rem 0.5rem 0.5rem',
                                    border: '1px solid rgb(209 213 219 / 30%)',
                                }}
                                wrapperClassName="demo-wrapper"
                                toolbarClassName="flex sticky top-0 z-20 !justify-start"
                                editorClassName="mt-5 shadow-sm border min-h-editor p-2"
                                onEditorStateChange={onEditorStateChangeRep}
                                toolbar={{
                                    link: { inDropdown: true },
                                    list: { inDropdown: true },
                                    options: [
                                        'fontFamily',
                                        'inline',
                                        'blockType',
                                        'fontSize',
                                        'list',
                                        'image',
                                        'textAlign',
                                        'colorPicker',
                                        'link',
                                        'embedded',
                                        'emoji',
                                        'remove',
                                        'history',
                                    ],
                                    inline: {
                                        options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
                                    },
                                }}
                                hashtag={{
                                    separator: ' ',
                                    trigger: '#',
                                }}
                            />
                        </div>

                        {/* Comments */}
                        <div className="item16">
                            {comments.length > 0 ? (
                                <Comments
                                    comments={comments}
                                    issueID={dataset._id}
                                    userID={userinfo.user.id}
                                    onCommentsUpdated={getComments}
                                />
                            ) : (
                                <Typography component="p" variant="subtitle1">
                                    Ingen kommentarer
                                </Typography>
                            )}
                        </div>

                        {/* Comment form */}
                        <div className="item17">
                            <CommentForm
                                onSubmit={onSubmit}
                                openNewComment={openNewComment}
                                setOpenNewComment={setOpenNewComment}
                            />
                        </div>
                    </div>
                </section>

                {/* Sidebar */}
                <Box sx={{ display: showAside ? 'block' : 'none' }}>
                    <aside className="two-columns__aside">
                        <List className="side-menu">
                            <ListItem>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    component={Link}
                                    startIcon={<EditIcon />}
                                    to={'/edit-issue/' + dataset._id}
                                    size="small"
                                    disabled={!isAuthor}
                                >
                                    Rediger
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    className={classes.button}
                                    startIcon={<DeleteIcon />}
                                    size="small"
                                    onClick={handleClickOpen}
                                >
                                    Slett sak
                                </Button>
                            </ListItem>
                            <ListItem>
                                <FormControl className={classes.textFieldStatus}>
                                    <TextField
                                        id="outlined-select-status"
                                        select
                                        label="Status"
                                        variant="outlined"
                                        name="Status"
                                        value={dataset.status || 'Åpen'}
                                        InputProps={{
                                            className: classes.input,
                                        }}
                                        SelectProps={{
                                            MenuProps: {
                                                className: classes.menu,
                                            },
                                        }}
                                        inputProps={{ 'aria-label': 'naked' }}
                                        onChange={(e) => upDateIssueStatus(dataset._id, e.target.value)}
                                    >
                                        {Status.map((option) => (
                                            <MenuItem key={option.uniqueId} value={option.id}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <Autocomplete
                                        id="delegated-select"
                                        options={users}
                                        getOptionLabel={(option) => option.name}
                                        value={dataset.delegated || null}
                                        onChange={(event, newValue) =>
                                            upDateDelegated(dataset._id, newValue?._id || '')
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Delegert til"
                                                variant="outlined"
                                                margin="normal"
                                            />
                                        )}
                                        filterSelectedOptions
                                        getOptionKey={(option) => option._id}
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                    />
                                    {errors.delegated && (
                                        <Box
                                            className={classes.BoxErrorField}
                                            fontFamily="Monospace"
                                            color="error.main"
                                            p={1}
                                            m={1}
                                        >
                                            {errors.delegated} ⚠️
                                        </Box>
                                    )}
                                    <Snackbar
                                        anchorOrigin={{ vertical: verticalStatusUpdate, horizontal: horizontalStatusUpdate }}
                                        open={openStatusSnackbar}
                                        onClose={handleStatusUpdateClose}
                                        message="Status oppdatert"
                                        key={verticalStatusUpdate + horizontalStatusUpdate}
                                    >
                                        <Alert severity="success" variant="standard" onClose={handleStatusUpdateClose}>
                                            <AlertTitle>Suksess</AlertTitle>
                                            Status ble endret!
                                        </Alert>
                                    </Snackbar>
                                </FormControl>
                                {errors.status && (
                                    <Box
                                        className={classes.BoxErrorField}
                                        fontFamily="Monospace"
                                        color="error.main"
                                        p={1}
                                        m={1}
                                    >
                                        {errors.status} ⚠️
                                    </Box>
                                )}
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    disableTypography
                                    className={classes.dateText}
                                    primary={
                                        <Typography type="body2" style={{ color: '#000' }}>
                                            Opprettet{' '}
                                            <AccessTimeIcon style={{ fontSize: 18, verticalAlign: 'text-top' }} />
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography type="body2" style={{ color: '#555' }}>
                                            {formattedDate(dataset.createdAt)}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    disableTypography
                                    className={classes.dateText}
                                    primary={
                                        <Typography type="body2" style={{ color: '#000' }}>
                                            Oppdatert <UpdateIcon style={{ fontSize: 18, verticalAlign: 'text-top' }} />
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography type="body2" style={{ color: '#555' }}>
                                            {formattedDate(dataset.updatedAt)}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    disableTypography
                                    className={classes.dateText}
                                    primary={
                                        <Typography type="body2" style={{ color: '#000' }}>
                                            Prosjekt <UpdateIcon style={{ fontSize: 18, verticalAlign: 'text-top' }} />
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography type="body2" style={{ color: '#555' }}>
                                            {dataset.project ? dataset.project.name : 'Ingen prosjekt'}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </List>
                    </aside>
                </Box>
            </div>

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
        </div>
    )
}
