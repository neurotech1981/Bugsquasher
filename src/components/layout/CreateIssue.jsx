/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react'

// Polyfill for setImmediate (required for Draft.js)
if (typeof setImmediate === 'undefined') {
    global.setImmediate = (callback) => setTimeout(callback, 0)
}
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSocket } from '../../components/SocketProvider'
import { useNavigate, useSearchParams } from 'react-router-dom'
import auth from '../auth/auth-helper'
import { createTheme, ThemeProvider, adaptV4Theme } from '@mui/material/styles'
import { makeStyles, withStyles } from '@mui/styles'
import issueService from '../../services/issueService'
import Icon from '@mui/material/Icon'
// eslint-disable-neAlertxt-line no-unused-vars
import {
    EditorState,
    AtomicBlockUtils,
    //convertFromRaw,
    convertToRaw,
    ContentState,
} from 'draft-js'
import {
    Typography,
    Snackbar,
    TextField,
    Container,
    Grid,
    Button,
    CssBaseline,
    Autocomplete,
    Card,
    CardContent,
    CardHeader,
    Box,
    Paper,
    Divider,
    Chip,
    useTheme,
    alpha,
    Stack,
    FormControl,
    InputLabel,
    Avatar,
    LinearProgress,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Collapse,
    Alert,
    AlertTitle,
    CircularProgress
} from '@mui/material'
import MuiMenuItem from '@mui/material/MenuItem'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
//import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs'
import { useDispatch, useSelector } from 'react-redux'
import Previews from './ImageUploader'
import { findUserProfile, getUsers } from '../utils/api-user'
import { clearAction } from '../../redux/store'
import { getProjects } from '../../services/projectService'
import { v4 as uuid } from 'uuid'
import {
    BugReport,
    Assignment,
    Person,
    Category,
    Speed,
    PriorityHigh,
    Replay,
    BusinessCenter,
    Description,
    ListAlt,
    AttachFile,
    Send,
    Info,
    CheckCircle,
    ExpandMore,
    ExpandLess,
    PlayArrow,
    ArrowForward
} from '@mui/icons-material'

const jwt = auth.isAuthenticated()

// Modern dropdown options with better styling
const alvorlighetsGrad = [
    { value: 'Ingen valgt', label: 'Ingen valgt', color: '#9E9E9E', icon: '❓' },
    { value: 'Tekst', label: 'Tekst', color: '#4CAF50', icon: '📝' },
    { value: 'Justering', label: 'Justering', color: '#2196F3', icon: '🔧' },
    { value: 'Triviell', label: 'Triviell', color: '#8BC34A', icon: '🟢' },
    { value: 'Mindre alvorlig', label: 'Mindre alvorlig', color: '#FFC107', icon: '🟡' },
    { value: 'Alvorlig', label: 'Alvorlig', color: '#FF9800', icon: '🟠' },
    { value: 'Kræsj', label: 'Kræsj', color: '#F44336', icon: '🔴' },
    { value: 'Blokkering', label: 'Blokkering', color: '#E91E63', icon: '🚫' },
]

const Kategori = [
    { value: 'Ingen valgt', label: 'Ingen valgt', color: '#9E9E9E', icon: '❓' },
    { value: 'Triviell', label: 'Triviell', color: '#4CAF50', icon: '💡' },
    { value: 'Tekst', label: 'Tekst', color: '#2196F3', icon: '📝' },
    { value: 'Justering', label: 'Justering', color: '#FF9800', icon: '⚙️' },
    { value: 'Mindre alvorlig', label: 'Mindre alvorlig', color: '#FFC107', icon: '🐛' },
    { value: 'Alvorlig', label: 'Alvorlig', color: '#F44336', icon: '🚨' },
    { value: 'Kræsj', label: 'Kræsj', color: '#E91E63', icon: '💥' },
    { value: 'Blokkering', label: 'Blokkering', color: '#9C27B0', icon: '🚫' },
]

const prioritet = [
    { value: 'Ingen valgt', label: 'Ingen valgt', color: '#9E9E9E', icon: '❓' },
    { value: 'Ingen', label: 'Ingen', color: '#9E9E9E', icon: '⚪' },
    { value: 'Lav', label: 'Lav', color: '#4CAF50', icon: '🟢' },
    { value: 'Normal', label: 'Normal', color: '#2196F3', icon: '🔵' },
    { value: 'Høy', label: 'Høy', color: '#FF9800', icon: '🟠' },
    { value: 'Haster', label: 'Haster', color: '#F44336', icon: '🔴' },
    { value: 'Øyeblikkelig', label: 'Øyeblikkelig', color: '#E91E63', icon: '🚨' },
]

const reprodusere = [
    { value: 'Ingen valgt', label: 'Ingen valgt', color: '#9E9E9E', icon: '❓' },
    { value: 'Alltid', label: 'Alltid', color: '#4CAF50', icon: '✅' },
    { value: 'Noen ganger', label: 'Noen ganger', color: '#FF9800', icon: '🔄' },
    { value: 'Tilfeldig', label: 'Tilfeldig', color: '#F44336', icon: '🎲' },
    { value: 'Har ikke forsøkt', label: 'Har ikke forsøkt', color: '#9E9E9E', icon: '❌' },
    { value: 'Kan ikke reprodusere', label: 'Kan ikke reprodusere', color: '#E91E63', icon: '🚫' },
    { value: 'Ingen', label: 'Ingen', color: '#9C27B0', icon: '⛔' },
]

const MenuItem = withStyles({
    root: {
        display: 'table',
        width: '100%',
        justifyContent: 'flex-end',
    },
})(MuiMenuItem)

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
        backgroundColor: '#EEEEEE',
        paddingTop: theme.spacing(12), // Account for top navigation bar
        paddingBottom: theme.spacing(6),
        marginLeft: '288px', // Account for sidebar width
        marginTop: '80px', // Account for top nav height
        width: 'calc(100% - 288px)',
        '@media (max-width: 900px)': {
            marginLeft: 0,
            width: '100%',
            marginTop: '72px',
        },
    },
    mainCard: {
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, #F79B72 0%, #2A4759 100%)',
        color: 'white',
        marginBottom: theme.spacing(3),
    },
    formCard: {
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        marginBottom: theme.spacing(3),
        overflow: 'visible',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        marginBottom: theme.spacing(2),
        color: '#F79B72',
        fontWeight: 600,
    },
    textField: {
        '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.light,
            },
        },
    },
    submitButton: {
        borderRadius: 12,
        padding: theme.spacing(1.5, 4),
        fontSize: '1.1rem',
        fontWeight: 600,
        background: 'linear-gradient(135deg, #F79B72 0%, #2A4759 100%)',
        boxShadow: '0 4px 20px rgba(247, 155, 114, 0.4)',
        '&:hover': {
            background: 'linear-gradient(135deg, #e8895f 0%, #1e3440 100%)',
            boxShadow: '0 6px 25px rgba(247, 155, 114, 0.6)',
            transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease',
    },
    editorWrapper: {
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'white',
        '&:hover': {
            borderColor: theme.palette.primary.light,
        },
        '&:focus-within': {
            borderColor: theme.palette.primary.main,
        },
        '& .rdw-editor-wrapper': {
            border: 'none',
        },
        '& .rdw-editor-toolbar': {
            borderBottom: '1px solid #e0e0e0',
            marginBottom: 0,
            padding: theme.spacing(1),
        },
        '& .rdw-editor-main': {
            minHeight: 200,
            padding: theme.spacing(2),
            '& .public-DraftEditor-content': {
                minHeight: 150,
            },
        },
    },
    priorityChip: {
        fontWeight: 600,
        borderRadius: 8,
    },
    progressContainer: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
}))

const theme = createTheme({
    typography: {
        h4: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h6: {
            fontWeight: 600,
        },
    },
    palette: {
        primary: {
            main: '#F79B72',
            light: '#fad5b8',
            dark: '#ca6539',
        },
        secondary: {
            main: '#2A4759',
            light: '#d3dce5',
            dark: '#152127',
        },
    },
})

export default function CreateIssue(props) {
    const classes = useStyles()
    const muiTheme = useTheme()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState(new Set())
    const [expandedSections, setExpandedSections] = useState(new Set([0]))

    const steps = [
        {
            label: 'Grunnleggende informasjon',
            description: 'Hvem, hva og hvor',
            icon: <Assignment />,
            required: true
        },
        {
            label: 'Kategorisering',
            description: 'Prioritet og alvorlighetsgrad',
            icon: <Category />,
            required: true
        },
        {
            label: 'Detaljert beskrivelse',
            description: 'Beskriv problemet',
            icon: <Description />,
            required: true
        },
        {
            label: 'Reproduksjonssteg',
            description: 'Hvordan reprodusere problemet',
            icon: <ListAlt />,
            required: false
        },
        {
            label: 'Vedlegg',
            description: 'Bilder og filer',
            icon: <AttachFile />,
            required: false
        }
    ]

    const initialState = {
        setDelegated: '',
        setKategori: 'Ingen valgt',
        setAlvorlighetsgrad: 'Ingen valgt',
        setPrioritet: 'Ingen valgt',
        setReprodusere: 'Ingen valgt',
        setOppsummering: '',
    }

    const contentBlockDescription = htmlToDraft(`
      <h3>Description:</h3>
      <p>[Enter a brief description of the problem or bug here]</p>
      <h3>Screenshots:</h3>
      <p>[Include relevant screenshots here, if applicable or upload them seperate]</p>

      <h3>System Information:</h3>
      <ul>
        <li>OS: [Enter the operating system here]</li>
        <li>Browser: [Enter the browser name and version here]</li>
      </ul>

      <h3>Additional context:</h3>
      <p>[Enter any additional relevant information or context here, if applicable]</p>
    `)

    const contentBlockReproduce = htmlToDraft(`
      <h3>Steps to Reproduce:</h3>
      <ol>
        <li>[Enter the first step to reproduce the issue]</li>
        <li>[Enter the second step to reproduce the issue]</li>
        <li>[Enter the third step to reproduce the issue]</li>
        <li>[Enter the expected outcome or error]</li>
      </ol>

      <h3>Expected behavior:</h3>
      <p>[Enter the expected behavior of the system here]</p>
    `)

    const initStateDescription = (() => {
        try {
            return contentBlockDescription
                ? EditorState.createWithContent(ContentState.createFromBlockArray(contentBlockDescription.contentBlocks))
                : EditorState.createEmpty()
        } catch (error) {
            console.warn('Error creating description editor state:', error)
            return EditorState.createEmpty()
        }
    })()

    const initStateStepReproduce = (() => {
        try {
            return contentBlockReproduce
                ? EditorState.createWithContent(ContentState.createFromBlockArray(contentBlockReproduce.contentBlocks))
                : EditorState.createEmpty()
        } catch (error) {
            console.warn('Error creating reproduction steps editor state:', error)
            return EditorState.createEmpty()
        }
    })()

    const [editorStateDesc, setEditorStateDesc] = useState(initStateDescription)
    const [editorStateRep, setEditorStateRep] = useState(initStateStepReproduce)

    const dispatch = useDispatch()
    const clearStoreImage = (files) => dispatch(clearAction(files))
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState('')

    const initialFormState = {
        setDelegated: '',
        setKategori: '',
        setAlvorlighetsgrad: '',
        setPrioritet: '',
        setReprodusere: '',
        setOppsummering: '',
    }

    const [values, setValues] = useState(initialFormState)
    const [open, setOpen] = useState(false)
    const [userinfo, setUserinfo] = useState({
        user: {},
        redirectToSignin: false,
    })
    const [errors, setErrors] = useState({})
    const [users, setUsers] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState([])

    const { socket, isConnected, emit } = useSocket()

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const init = (userId) => {
        if (!userId) return
        findUserProfile({ userId }, { t: jwt.token }).then((data) => {
            if (data.error) {
                setUserinfo({ ...userinfo, redirectToSignin: true })
            } else {
                setUserinfo({ user: data })
            }
        })

        getUsers({ t: jwt.token }).then((data) => {
            if (data.error) {
                // Handle user loading error silently or show user-friendly error
                setErrors(prev => ({ ...prev, users: 'Failed to load users' }))
            } else {
                // Ensure unique users by ID and filter out any invalid entries
                const uniqueUsers = data.data?.filter((user, index, self) =>
                    user && user._id && self.findIndex(u => u._id === user._id) === index
                ) || []
                setUsers(uniqueUsers)
            }
        })

        getProjects(jwt.token).then((data) => {
            if (data.error) {
                // Handle project loading error silently or show user-friendly error
                setErrors(prev => ({ ...prev, projects: 'Failed to load projects' }))
            } else {
                setProjects(data.data)

                // Check for project URL parameter and pre-select project
                const projectId = searchParams.get('project')
                if (projectId && data.data) {
                    const project = data.data.find(p => p._id === projectId)
                    if (project) {
                        setSelectedProject(project)
                    }
                }
            }
        })
    }

    useEffect(() => {
        const jwt = auth.isAuthenticated()
        if (jwt) {
            init(jwt.user.id)
        }
    }, [])

    const handleChange = (name) => (event) => {
        setValues({ ...values, [name]: event.target.value })
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: undefined })
        }
    }

    const createIssue = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const issue = {
                name: userinfo.user.name || undefined,
                delegated: values.setDelegated || undefined,
                category: values.setKategori || undefined,
                severity: values.setAlvorlighetsgrad || undefined,
                priority: values.setPrioritet || undefined,
                reproduce: values.setReprodusere || undefined,
                summary: values.setOppsummering || undefined,
                description: JSON.stringify(convertToRaw(editorStateDesc.getCurrentContent())) || undefined,
                step_reproduce: JSON.stringify(convertToRaw(editorStateRep.getCurrentContent())) || undefined,
                userid: jwt.user._id || undefined,
                reporter: jwt.user._id || undefined, // Set the reporter field for population
                project: selectedProject?._id || undefined,
                uuid: uuid(),
                imageName: uploadedFiles.length > 0 ? uploadedFiles : undefined,
            }

            console.log('Values state:', values)
            console.log('Selected project:', selectedProject)
            console.log('Final issue data being sent:', JSON.stringify(issue, null, 2))
            const result = await issueService.addIssue(issue, jwt.token)

            if (result.data && result.data.success && result.data.document) {
                setOpen(true)
                clearState()

                const createdIssue = result.data.document

                if (socket) {
                    socket.emit('newIssue', {
                        userId: jwt.user._id,
                        issueId: createdIssue._id,
                        message: `Ny sak: ${issue.summary}`,
                    })
                }

                toast.success('Sak opprettet!', {
                    position: 'bottom-right',
                    autoClose: 3000,
                })

                // Redirect to the newly created issue after a short delay
                setTimeout(() => {
                    navigate(`/vis-sak/${createdIssue._id}`)
                }, 1500)
            } else {
                // Fallback success handling for different response structures
                if (result.status === 201 || result.status === 200) {
                    let createdIssue = result.data?.document || result.data?.data || result.data
                    if (createdIssue && createdIssue._id) {
                        toast.success('Sak opprettet!', {
                            position: 'bottom-right',
                            autoClose: 3000,
                        })

                        setTimeout(() => {
                            navigate(`/vis-sak/${createdIssue._id}`)
                        }, 1500)
                    }
                }
            }
        } catch (error) {
            // Handle error silently - user feedback is provided via toast
            if (error.response?.data?.error) {
                setErrors(error.response.data.error)
            }
            toast.error('Feil ved opprettelse av sak', {
                position: 'bottom-right',
                autoClose: 3000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const clearState = () => {
        setValues(initialFormState)
        setEditorStateDesc(EditorState.createEmpty())
        setEditorStateRep(EditorState.createEmpty())
        setSelectedProject(null)
        setErrors({})
        setUploadedFiles([])
    }

    // Callback function to receive uploaded files from ImageUploader
    const handleUploadedFiles = (files) => {
        setUploadedFiles(prevFiles => [...prevFiles, ...files])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await createIssue(e)
    }

    const onEditorStateChangeDesc = (editorState) => {
        try {
            setEditorStateDesc(editorState)
            if (errors.description) {
                setErrors({ ...errors, description: undefined })
            }
        } catch (error) {
            console.warn('Error updating description editor state:', error)
        }
    }

    const onEditorStateChangeRep = (editorState) => {
        try {
            setEditorStateRep(editorState)
            if (errors.step_reproduce) {
                setErrors({ ...errors, step_reproduce: undefined })
            }
        } catch (error) {
            console.warn('Error updating reproduction steps editor state:', error)
        }
    }

    const handleStepClick = (stepIndex) => {
        if (expandedSections.has(stepIndex)) {
            setExpandedSections(prev => {
                const newSet = new Set(prev)
                newSet.delete(stepIndex)
                return newSet
            })
        } else {
            setExpandedSections(prev => new Set([...prev, stepIndex]))
        }
    }

    const validateStep = (stepIndex) => {
        switch (stepIndex) {
            case 0: // Basic information
                return values.setOppsummering.trim() && values.setDelegated
            case 1: // Categorization
                return values.setKategori !== 'Ingen valgt' && values.setPrioritet !== 'Ingen valgt'
            case 2: // Description
                return editorStateDesc.getCurrentContent().hasText()
            default:
                return true
        }
    }

    const getStepIcon = (stepIndex, isCompleted, isExpanded) => {
        if (isCompleted) {
            return <CheckCircle sx={{ color: '#4CAF50' }} />
        }
        if (isExpanded) {
            return <ExpandLess sx={{ color: '#F79B72' }} />
        }
        return <ExpandMore sx={{ color: '#9E9E9E' }} />
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
            {submitting && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
                    <LinearProgress sx={{ bgcolor: '#F79B72' }} />
                </Box>
            )}

            <Container maxWidth="lg" sx={{ px: 0 }}>
                {/* Header */}
                <Paper elevation={0} sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid rgba(221, 221, 221, 0.3)',
                    bgcolor: 'white',
                    background: 'linear-gradient(135deg, rgba(247, 155, 114, 0.1), rgba(42, 71, 89, 0.05))'
                }}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                        <Avatar sx={{
                            width: 80,
                            height: 80,
                            bgcolor: '#F79B72',
                            background: 'linear-gradient(135deg, #F79B72, #2A4759)'
                        }}>
                            <BugReport sx={{ fontSize: 40, color: 'white' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="#2A4759" gutterBottom>
                                Opprett Ny Sak
                            </Typography>
                            <Typography variant="h6" color="#F79B72" sx={{ mb: 1 }}>
                                Rapporter en feil eller foreslå en forbedring
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ opacity: 0.7 }}>
                                <Info fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                    Følg stegene nedenfor for å opprette en detaljert saksrapport
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>

                    <form onSubmit={handleSubmit} autoComplete="off">
                        {/* Step 1: Basic Information */}
                        <Card elevation={0} sx={{
                            mb: 2,
                            borderRadius: 3,
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            bgcolor: 'white'
                        }}>
                            <CardContent
                                sx={{
                                    p: 3,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.02)' }
                                }}
                                onClick={() => handleStepClick(0)}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{
                                            bgcolor: validateStep(0) ? '#4CAF50' : '#F79B72',
                                            width: 48,
                                            height: 48
                                        }}>
                                            {validateStep(0) ? <CheckCircle /> : <Assignment />}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                                1. Grunnleggende Informasjon
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Sammendrag, tildeling og prosjekt
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    {expandedSections.has(0) ?
                                        <ExpandLess sx={{ color: '#F79B72' }} /> :
                                        <ExpandMore sx={{ color: '#9E9E9E' }} />
                                    }
                                </Stack>
                            </CardContent>

                            <Collapse in={expandedSections.has(0)}>
                                <CardContent sx={{ pt: 0, pb: 3 }}>

                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Sammendrag *"
                                            value={values.setOppsummering}
                                            onChange={handleChange('setOppsummering')}
                                            fullWidth
                                            placeholder="Kort beskrivelse av problemet..."
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#F79B72',
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            options={users}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={users.find(user => user._id === values.setDelegated) || null}
                                            onChange={(event, newValue) => {
                                                setValues({ ...values, setDelegated: newValue?._id || '' })
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Tildel til *"
                                                    placeholder="Velg en bruker..."
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#F79B72',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#F79B72',
                                                            },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#F79B72',
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <Box component="li" {...props}>
                                                    <Avatar sx={{ bgcolor: '#F79B72', mr: 2, width: 32, height: 32 }}>
                                                        <Person fontSize="small" />
                                                    </Avatar>
                                                    <Typography>{option.name}</Typography>
                                                </Box>
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            options={projects}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={selectedProject}
                                            onChange={(event, newValue) => setSelectedProject(newValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Prosjekt"
                                                    placeholder="Velg et prosjekt..."
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#F79B72',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#F79B72',
                                                            },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#F79B72',
                                                        },
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <Box component="li" {...props}>
                                                    <Avatar sx={{ bgcolor: '#2A4759', mr: 2, width: 32, height: 32 }}>
                                                        <BusinessCenter fontSize="small" />
                                                    </Avatar>
                                                    <Typography>{option.name}</Typography>
                                                </Box>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                                </CardContent>
                            </Collapse>
                        </Card>

                        {/* Step 2: Categorization */}
                        <Card elevation={0} sx={{
                            mb: 2,
                            borderRadius: 3,
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            bgcolor: 'white'
                        }}>
                            <CardContent
                                sx={{
                                    p: 3,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.02)' }
                                }}
                                onClick={() => handleStepClick(1)}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{
                                            bgcolor: validateStep(1) ? '#4CAF50' : '#F79B72',
                                            width: 48,
                                            height: 48
                                        }}>
                                            {validateStep(1) ? <CheckCircle /> : <Category />}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                                2. Kategorisering
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Prioritet, alvorlighetsgrad og kategori
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    {expandedSections.has(1) ?
                                        <ExpandLess sx={{ color: '#F79B72' }} /> :
                                        <ExpandMore sx={{ color: '#9E9E9E' }} />
                                    }
                                </Stack>
                            </CardContent>

                            <Collapse in={expandedSections.has(1)}>
                                <CardContent sx={{ pt: 0, pb: 3 }}>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            select
                                            label="Prioritet *"
                                            value={values.setPrioritet}
                                            onChange={handleChange('setPrioritet')}
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#F79B72',
                                                },
                                            }}
                                        >
                                            {prioritet.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <span>{option.icon}</span>
                                                        <Typography>{option.label}</Typography>
                                                        <Chip
                                                            size="small"
                                                            sx={{
                                                                bgcolor: option.color,
                                                                color: 'white',
                                                                minWidth: 8,
                                                                height: 8,
                                                                '& .MuiChip-label': { px: 0 }
                                                            }}
                                                        />
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            select
                                            label="Alvorlighetsgrad"
                                            value={values.setAlvorlighetsgrad}
                                            onChange={handleChange('setAlvorlighetsgrad')}
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#F79B72',
                                                },
                                            }}
                                        >
                                            {alvorlighetsGrad.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <span>{option.icon}</span>
                                                        <Typography>{option.label}</Typography>
                                                        <Chip
                                                            size="small"
                                                            sx={{
                                                                bgcolor: option.color,
                                                                color: 'white',
                                                                minWidth: 8,
                                                                height: 8,
                                                                '& .MuiChip-label': { px: 0 }
                                                            }}
                                                        />
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            select
                                            label="Kategori"
                                            value={values.setKategori}
                                            onChange={handleChange('setKategori')}
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#F79B72',
                                                },
                                            }}
                                        >
                                            {Kategori.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <span>{option.icon}</span>
                                                        <Typography>{option.label}</Typography>
                                                        <Chip
                                                            size="small"
                                                            sx={{
                                                                bgcolor: option.color,
                                                                color: 'white',
                                                                minWidth: 8,
                                                                height: 8,
                                                                '& .MuiChip-label': { px: 0 }
                                                            }}
                                                        />
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            label="Reproduserbarhet"
                                            value={values.setReprodusere}
                                            onChange={handleChange('setReprodusere')}
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#F79B72',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#F79B72',
                                                },
                                            }}
                                        >
                                            {reprodusere.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <span>{option.icon}</span>
                                                        <Typography>{option.label}</Typography>
                                                        <Chip
                                                            size="small"
                                                            sx={{
                                                                bgcolor: option.color,
                                                                color: 'white',
                                                                minWidth: 8,
                                                                height: 8,
                                                                '& .MuiChip-label': { px: 0 }
                                                            }}
                                                        />
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                                </CardContent>
                            </Collapse>
                        </Card>

                        {/* Step 3: Description */}
                        <Card elevation={0} sx={{
                            mb: 2,
                            borderRadius: 3,
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            bgcolor: 'white'
                        }}>
                            <CardContent
                                sx={{
                                    p: 3,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.02)' }
                                }}
                                onClick={() => handleStepClick(2)}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{
                                            bgcolor: validateStep(2) ? '#4CAF50' : '#F79B72',
                                            width: 48,
                                            height: 48
                                        }}>
                                            {validateStep(2) ? <CheckCircle /> : <Description />}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                                3. Detaljert Beskrivelse
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Beskriv problemet i detalj
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    {expandedSections.has(2) ?
                                        <ExpandLess sx={{ color: '#F79B72' }} /> :
                                        <ExpandMore sx={{ color: '#9E9E9E' }} />
                                    }
                                </Stack>
                            </CardContent>

                            <Collapse in={expandedSections.has(2)}>
                                <CardContent sx={{ pt: 0, pb: 3 }}>
                                    <Box sx={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            borderColor: '#F79B72',
                                        },
                                        '&:focus-within': {
                                            borderColor: '#F79B72',
                                        },
                                        '& .rdw-editor-wrapper': {
                                            border: 'none',
                                        },
                                        '& .rdw-editor-toolbar': {
                                            borderBottom: '1px solid #e0e0e0',
                                            marginBottom: 0,
                                            padding: 1,
                                        },
                                        '& .rdw-editor-main': {
                                            minHeight: 200,
                                            padding: 2,
                                            '& .public-DraftEditor-content': {
                                                minHeight: 150,
                                            },
                                        },
                                    }}>
                                    <Editor
                                        editorState={editorStateDesc}
                                        onEditorStateChange={onEditorStateChangeDesc}
                                        placeholder="Beskriv problemet i detalj..."
                                        stripPastedStyles={false}
                                        toolbar={{
                                            options: [
                                                'inline',
                                                'blockType',
                                                'fontSize',
                                                'list',
                                                'textAlign',
                                                'colorPicker',
                                                'link',
                                                'history'
                                            ],
                                            inline: {
                                                inDropdown: false,
                                                options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace']
                                            },
                                            blockType: {
                                                inDropdown: true,
                                                options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']
                                            },
                                            link: {
                                                inDropdown: false,
                                                showOpenOptionOnHover: true,
                                                defaultTargetOption: '_self',
                                                options: ['link', 'unlink']
                                            },
                                            history: {
                                                inDropdown: false,
                                                options: ['undo', 'redo']
                                            }
                                        }}
                                    />
                                </Box>
                                {errors.description && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                        {errors.description} ⚠️
                                    </Typography>
                                )}
                                </CardContent>
                            </Collapse>
                        </Card>

                        {/* Step 4: Reproduction Steps */}
                        <Card elevation={0} sx={{
                            mb: 2,
                            borderRadius: 3,
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            bgcolor: 'white'
                        }}>
                            <CardContent
                                sx={{
                                    p: 3,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.02)' }
                                }}
                                onClick={() => handleStepClick(3)}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ bgcolor: '#2A4759', width: 48, height: 48 }}>
                                            <ListAlt />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                                4. Reproduksjonssteg
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Hvordan reprodusere problemet (valgfritt)
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    {expandedSections.has(3) ?
                                        <ExpandLess sx={{ color: '#F79B72' }} /> :
                                        <ExpandMore sx={{ color: '#9E9E9E' }} />
                                    }
                                </Stack>
                            </CardContent>

                            <Collapse in={expandedSections.has(3)}>
                                <CardContent sx={{ pt: 0, pb: 3 }}>
                                    <Box sx={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            borderColor: '#F79B72',
                                        },
                                        '&:focus-within': {
                                            borderColor: '#F79B72',
                                        },
                                        '& .rdw-editor-wrapper': {
                                            border: 'none',
                                        },
                                        '& .rdw-editor-toolbar': {
                                            borderBottom: '1px solid #e0e0e0',
                                            marginBottom: 0,
                                            padding: 1,
                                        },
                                        '& .rdw-editor-main': {
                                            minHeight: 200,
                                            padding: 2,
                                            '& .public-DraftEditor-content': {
                                                minHeight: 150,
                                            },
                                        },
                                    }}>
                                    <Editor
                                        editorState={editorStateRep}
                                        onEditorStateChange={onEditorStateChangeRep}
                                        placeholder="Beskriv stegene for å reprodusere problemet..."
                                        stripPastedStyles={false}
                                        toolbar={{
                                            options: [
                                                'inline',
                                                'blockType',
                                                'fontSize',
                                                'list',
                                                'textAlign',
                                                'colorPicker',
                                                'link',
                                                'history'
                                            ],
                                            inline: {
                                                inDropdown: false,
                                                options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace']
                                            },
                                            blockType: {
                                                inDropdown: true,
                                                options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']
                                            },
                                            link: {
                                                inDropdown: false,
                                                showOpenOptionOnHover: true,
                                                defaultTargetOption: '_self',
                                                options: ['link', 'unlink']
                                            },
                                            history: {
                                                inDropdown: false,
                                                options: ['undo', 'redo']
                                            }
                                        }}
                                    />
                                </Box>
                                {errors.step_reproduce && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                        {errors.step_reproduce} ⚠️
                                    </Typography>
                                )}
                                </CardContent>
                            </Collapse>
                        </Card>

                        {/* Step 5: Attachments */}
                        <Card elevation={0} sx={{
                            mb: 4,
                            borderRadius: 3,
                            border: '1px solid rgba(221, 221, 221, 0.3)',
                            bgcolor: 'white'
                        }}>
                            <CardContent
                                sx={{
                                    p: 3,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(247, 155, 114, 0.02)' }
                                }}
                                onClick={() => handleStepClick(4)}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ bgcolor: '#2A4759', width: 48, height: 48 }}>
                                            <AttachFile />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="600" color="#2A4759">
                                                5. Vedlegg
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Last opp skjermbilder eller andre filer (valgfritt)
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    {expandedSections.has(4) ?
                                        <ExpandLess sx={{ color: '#F79B72' }} /> :
                                        <ExpandMore sx={{ color: '#9E9E9E' }} />
                                    }
                                </Stack>
                            </CardContent>

                            <Collapse in={expandedSections.has(4)}>
                                <CardContent sx={{ pt: 0, pb: 3 }}>
                                    <Previews imageBool={false} func_image={handleUploadedFiles} />
                                </CardContent>
                            </Collapse>
                        </Card>

                        {/* Submit Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={submitting || !validateStep(0) || !validateStep(1) || !validateStep(2)}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                sx={{
                                    borderRadius: 3,
                                    px: 6,
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #F79B72 0%, #2A4759 100%)',
                                    boxShadow: '0 4px 20px rgba(247, 155, 114, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #e8895f 0%, #1e3440 100%)',
                                        boxShadow: '0 6px 25px rgba(247, 155, 114, 0.6)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:disabled': {
                                        background: '#9E9E9E',
                                        boxShadow: 'none',
                                        transform: 'none',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                {submitting ? 'Oppretter sak...' : 'Send inn sak'}
                            </Button>
                        </Box>
                    </form>

                    <ToastContainer
                        position="bottom-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </Container>
            </Box>
        )
}
