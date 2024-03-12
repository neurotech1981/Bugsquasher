/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import openSocket from 'socket.io-client'

const socket = openSocket('http://localhost:4000')
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles'
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
import { Typography, Snackbar, TextField, Container, Grid, Button, CssBaseline, Autocomplete } from '@mui/material'
import MuiMenuItem from '@mui/material/MenuItem'
import { Editor } from 'react-draft-wysiwyg'
//import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs'
import { AlertTitle } from '@mui/lab'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Previews from './ImageUploader'
import auth from '../auth/auth-helper'
import { findUserProfile, getUsers } from '../utils/api-user'
import { clearAction } from '../../redux/store'
import Alert from '@mui/material/Alert'
import { getProjects } from '../../services/projectService'

const alvorlighetsGrad = [
    {
        value: 0,
        label: 'Ingen valgt',
    },
    {
        value: 1,
        label: 'Tekst',
    },
    {
        value: 2,
        label: 'Justering',
    },
    {
        value: 3,
        label: 'Triviell',
    },
    {
        value: 4,
        label: 'Mindre alvorlig',
    },
    {
        value: 5,
        label: 'Alvorlig',
    },
    {
        value: 6,
        label: 'Kræsj',
    },
    {
        value: 7,
        label: 'Blokkering',
    },
]

const Kategori = [
    {
        value: 0,
        label: 'Ingen valgt',
    },
    {
        value: 1,
        label: 'Triviell',
    },
    {
        value: 2,
        label: 'Tekst',
    },
    {
        value: 3,
        label: 'Justering',
    },
    {
        value: 4,
        label: 'Mindre alvorlig',
    },
    {
        value: 5,
        label: 'Alvorlig',
    },
    {
        value: 6,
        label: 'Kræsj',
    },
    {
        value: 7,
        label: 'Blokkering',
    },
]

const prioritet = [
    {
        value: 0,
        label: 'Ingen valgt',
    },
    {
        value: 1,
        label: 'Ingen',
    },
    {
        value: 2,
        label: 'Lav',
    },
    {
        value: 3,
        label: 'Normal',
    },
    {
        value: 4,
        label: 'Høy',
    },
    {
        value: 5,
        label: 'Haster',
    },
    {
        value: 6,
        label: 'Øyeblikkelig',
    },
]

const reprodusere = [
    {
        value: 0,
        label: 'Ingen valgt',
        color: '#F2CBD1',
    },
    {
        value: 2,
        label: 'Alltid',
        color: '#F2CBD1',
    },
    {
        value: 3,
        label: 'Noen ganger',
        color: '#F49CA9',
    },
    {
        value: 4,
        label: 'Tilfeldig',
        color: '#F26A7E',
    },
    {
        value: 5,
        label: 'Har ikke forsøkt',
        color: '#F20024',
    },
    {
        value: 6,
        label: 'Kan ikke reprodusere',
        color: '#870D1F',
    },
    {
        value: 7,
        label: 'Ingen',
        color: '#7B0C1D',
    },
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
        width: '100%',
        margin: '0 auto',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    headerOne: {
        margin: '0 auto',
        padding: '0.5em',
        fontSize: '3em',
        color: 'darkslategray',
    },
    active: {
        backgroundColor: 'rgba(155, 205, 155, 0.12)',
    },
    container: {
        paddingTop: '20px',
        marginTop: '100px',
        marginBottom: '100px',
        paddingBottom: '50px',
        display: 'grid',
        flexWrap: 'wrap',
        borderRadius: '1em',
        boxShadow: '0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 5px 15px -3px rgba(0, 0, 0, 0.05)',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        height: '80%',
        margin: '0 auto',
        backdropFilter: 'blur(6px) saturate(180%)',
        webkitBackdropFilter: 'blur(6px) saturate(180%)',
        backgroundColor: 'rgb(225 245 239)',
        [theme.breakpoints.up('xs')]: {
            maxWidth: '100%',
            width: '100%',
        },
    },

    input: {
        backgroundColor: theme.palette.background.paper,
        maxWidth: '100%',
        webkitTransition: '0.18s ease-out',
        mozTransition: '0.18s ease-out',
        oTransition: '0.18s ease-out',
        transition: '0.18s ease-out',
    },
    textField: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        width: '100%',
    },
    BoxErrorField: {
        backgroundColor: '#ffe4e7',
        color: 'red',
    },
    dense: {
        marginTop: theme.spacing(2),
    },
    menu: {
        width: 200,
    },
    button: {
        marginTop: '20px',
        height: '50px',
        margin: '0 auto',
        fontSize: 20,
        borderRadius: 15,
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
    },
    iconSmall: {
        fontSize: '1.2em',
    },
    selected: {
        '&:hover': {
            backgroundColor: 'green',
            color: 'green',
        },
    },
}))

const theme = createTheme(
    adaptV4Theme({
        typography: {
            body1: {
                fontWeight: 600,
                padding: '0.3rem',
            },
        },
    })
)

export default function CreateIssue(props) {
    const { id } = useParams()
    const jwt = auth.isAuthenticated()

    const initialState = {
        setID: 0,
        setNavn: '',
        setDelegated: '',
        setKategori: 'Ingen valgt',
        setAlvorlighetsgrad: 'Ingen valgt',
        setPrioritet: 'Ingen valgt',
        setReprodusere: 'Ingen valgt',
        setOppsummering: '',
        setBeskrivelse: '',
        setStegReprodusere: '',
        setImageName: [''],
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

    const initStateDescription = contentBlockDescription
        ? EditorState.createWithContent(ContentState.createFromBlockArray(contentBlockDescription.contentBlocks))
        : EditorState.createEmpty()

    const initStateStepReproduce = contentBlockReproduce
        ? EditorState.createWithContent(ContentState.createFromBlockArray(contentBlockReproduce.contentBlocks))
        : EditorState.createEmpty()

    const [editorStateDesc, setEditorStateDesc] = useState(initStateDescription)
    const [editorStateRep, setEditorStateRep] = useState(initStateStepReproduce)

    const dispatch = useDispatch()
    const clearStoreImage = (files) => dispatch(clearAction(files))
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState('')

    const classes = useStyles()
    const [values, setValues] = useState(initialState)
    const [errors, setErrors] = useState('')
    const [users, setUsers] = useState([])
    const [userinfo, setUserinfo] = useState({
        user: [],
        redirectToSignin: false,
    })
    const [open, setOpen] = useState(false)

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const images = useSelector((state) => state)

    const init = (userId) => {
        findUserProfile(
            {
                userId,
            },
            { t: jwt.token }
        ).then((data) => {
            if (data.error) {
                setUserinfo({ redirectToSignin: true })
            } else {
                setUserinfo({ user: data })
                setValues({ setNavn: data.name })
            }
        })
        console.log('Token: ', jwt.token)
        getUsers({ t: jwt.token }).then((data) => {
            if (data.error) {
                setValues({ redirectToSignin: true })
            } else {
                setUsers(data.data)
            }
        })
    }

    useEffect(() => {
        if (!users.length) {
            init(id)
        }

        getProjects({ t: jwt.token }).then((data) => {
            console.log('Data', data.data)
            if (data.error) {
                setValues({ redirectToSignin: true })
            } else {
                setProjects(data.data)
            }
        })
    }, [id, users.length])

    const handleChange = (name) => (event) => {
        console.log(JSON.stringify(images))
        setValues({
            ...values,
            [name]: event.target.value,
        })
    }

    const insertImage = (url) => {
        const contentState = editorStateDesc.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity('IMAGE', 'MUTABLE', {
            src: '/uploads/' + url,
            height: '100%',
            width: '70%',
        })
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        const newEditorState = EditorState.set(editorStateDesc, { currentContent: contentStateWithEntity })
        return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
    }

    const handlePastedFiles = (files, editor) => {
        const formData = new FormData()
        formData.append('imageData', files[0])
        fetch('/api/uploadImage', {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                if (data[0]) {
                    setEditorStateDesc(insertImage(data[0].filename)) //created below
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const errorAlert = (error) => (
        <Snackbar open={open} autohideduration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="error" variant="standard">
                <AlertTitle>Feil</AlertTitle>
                Noe gikk galt - {error}!
            </Alert>
        </Snackbar>
    )

    /*const onChangeImageDrop = (event) => {
    event.preventDefault();
    setValues((prevState) => ({
      ...prevState,
      setImageName: [...images.imageupload],
    }));
    console.log('IMAGE UPLOAD FILE >>>', images.imageupload);
  };*/

    // Legg inn ny sak
    const createIssue = async (e) => {
        e.preventDefault()
        console.log('Image 123', images)

        let imageNameValue = 'none'
        if (images.state.imgUploadState) {
            console.log('Upload state true')
            imageNameValue = images.state.imageupload[1][0].name
        }

        const htmlContentStateDesc = JSON.stringify(convertToRaw(editorStateDesc.getCurrentContent()))
        values.setBeskrivelse = htmlContentStateDesc

        const htmlContentStateRep = JSON.stringify(convertToRaw(editorStateRep.getCurrentContent()))
        values.setStegReprodusere = htmlContentStateRep
        let data = {
            name: userinfo.user.name,
            reporter_id: userinfo.user._id,
            category: values.setKategori,
            description: values.setBeskrivelse,
            reproduce: values.setReprodusere,
            severity: values.setAlvorlighetsgrad,
            priority: values.setPrioritet,
            summary: values.setOppsummering,
            delegated: values.setDelegated,
            step_reproduce: values.setStegReprodusere,
            imageName: imageNameValue, //images.imgUploadState ? images.state.imageupload[1][0].name : 'none',
            // eslint-disable-next-line no-underscore-dangle
            userid: userinfo.user._id,
            project: selectedProject,
        }
        const jwt = auth.isAuthenticated()

        issueService
            .addIssue({ data }, jwt.token)
            .then((response) => {
                if (response.status === 200) {
                    setOpen(true)
                    clearState()
                    console.log('Response on create issue: ', response.data)
                    let issueData = {
                        issue_id: response.data.document._id,
                        reporter: userinfo.user.name,
                    }
                    socket.emit('new_issue', issueData, values.setDelegated)
                    setTimeout(function () {
                        clearStoreImage(clearAction)
                        props.history.push('/vis-sak/' + issueData.issue_id)
                    }, 2000)
                }
            })
            .catch((err) => {
                setErrors(err.response.data)
                errorAlert(err.response.data)
                window.scrollTo(0, 0)
            })
        // clear errors on submit if any present, before correcting old error
    }

    const clearState = () => {
        setValues({ ...initialState })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // setImages(prevState => ({...prevState, setImageName: [...images.imageupload[1].name]}));
        createIssue()
    }

    const onEditorStateChangeDesc = (editorState) => {
        setEditorStateDesc(editorState)
    }

    const onEditorStateChangeRep = (editorState) => {
        setEditorStateRep(editorState)
    }

    return (
        <div className={classes.root}>
            <Container>
                <form
                    encType="multipart/form-data"
                    className={classes.container}
                    autoComplete="disabled"
                    //onSubmit={(e) => handleSubmit(e)}
                >
                    <h3 className={classes.headerOne}>Skriv inn saksdetaljer</h3>
                    <Box textAlign="center">
                        <Typography variant="body2">Alle felt merket med en stjerne (*) er obligatoriske</Typography>
                    </Box>
                    <Grid container alignItems="flex-start" spacing={2} style={{ paddingRight: '2rem' }}>
                        <CssBaseline />
                        <Grid item xs={6}>
                            <TextField
                                id="outlined-select-delegert"
                                select
                                label="Deleger til"
                                name="delegert"
                                defaultValue="Ingen valgt"
                                className={classes.textField}
                                value={values.setDelegated || initialState.setDelegated}
                                onChange={handleChange('setDelegated')}
                                InputProps={{
                                    className: classes.input,
                                }}
                                SelectProps={{
                                    MenuProps: {
                                        className: classes.menu,
                                    },
                                }}
                                margin="normal"
                                variant="outlined"
                            >
                                {users.map((option) => (
                                    <MenuItem key={option._id} value={option._id}>
                                        {option.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {errors.delegated ? (
                                <Box
                                    className={classes.BoxErrorField}
                                    fontFamily="Monospace"
                                    color="error.main"
                                    p={1}
                                    m={1}
                                >
                                    {errors.delegated} ⚠️
                                </Box>
                            ) : (
                                ''
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id="outlined-select-alvorlighetsgrad"
                                select
                                label="Kategori *"
                                name="kategori"
                                className={classes.textField}
                                value={values.setKategori || 'Ingen valgt'}
                                onChange={handleChange('setKategori')}
                                InputProps={{
                                    className: classes.input,
                                }}
                                SelectProps={{
                                    MenuProps: {
                                        className: classes.menu,
                                    },
                                }}
                                margin="normal"
                                variant="outlined"
                            >
                                {Kategori.map((option) => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {errors.category ? (
                                <Box
                                    className={classes.BoxErrorField}
                                    fontFamily="Monospace"
                                    color="error.main"
                                    p={1}
                                    m={1}
                                >
                                    {errors.category} ⚠️
                                </Box>
                            ) : (
                                ''
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id="outlined-select-alvorlighetsgrad"
                                select
                                name="alvorlighetsgrad"
                                label="Alvorlighetsgrad *"
                                value={values.setAlvorlighetsgrad || 'Ingen valgt'}
                                className={classes.textField}
                                onChange={handleChange('setAlvorlighetsgrad')}
                                InputProps={{
                                    className: classes.input,
                                }}
                                SelectProps={{
                                    MenuProps: {
                                        className: classes.menu,
                                    },
                                }}
                                margin="normal"
                                variant="outlined"
                            >
                                {alvorlighetsGrad.map((option) => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {errors.severity ? (
                                <Box
                                    className={classes.BoxErrorField}
                                    fontFamily="Monospace"
                                    color="error.main"
                                    p={1}
                                    m={1}
                                >
                                    {errors.severity} ⚠️
                                </Box>
                            ) : (
                                ''
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id="outlined-select-prioritet"
                                select
                                name="prioritet"
                                label="Prioritet *"
                                className={classes.textField}
                                value={values.setPrioritet || 'Ingen valgt'}
                                onChange={handleChange('setPrioritet')}
                                InputProps={{
                                    className: classes.input,
                                }}
                                SelectProps={{
                                    MenuProps: {
                                        className: classes.menu,
                                    },
                                }}
                                margin="normal"
                                variant="outlined"
                            >
                                {prioritet.map((option) => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {errors.priority ? (
                                <Box
                                    className={classes.BoxErrorField}
                                    fontFamily="Monospace"
                                    color="error.main"
                                    p={1}
                                    m={1}
                                >
                                    {errors.priority} ⚠️
                                </Box>
                            ) : (
                                ''
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id="outlined-select-prioritet"
                                select
                                name="reprodusere"
                                label="Reprodusere *"
                                className={classes.textField}
                                value={values.setReprodusere || 'Ingen valgt'}
                                onChange={handleChange('setReprodusere')}
                                InputProps={{
                                    className: classes.input,
                                }}
                                SelectProps={{
                                    MenuProps: {
                                        className: classes.menu,
                                    },
                                }}
                                margin="normal"
                                variant="outlined"
                            >
                                {reprodusere.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.label}
                                        selected
                                        style={{
                                            backgroundColor: option.color,
                                            color: 'white',
                                        }}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {errors.reproduce ? (
                                <Box
                                    className={classes.BoxErrorField}
                                    fontFamily="Monospace"
                                    color="error.main"
                                    p={1}
                                    m={1}
                                >
                                    {errors.reproduce} ⚠️
                                </Box>
                            ) : (
                                ''
                            )}
                        </Grid>
                        <Grid item xs={6} sx={{ mt: 2 }}>
                            <Autocomplete
                                name="prosjekt"
                                className={classes.textField}
                                options={projects}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedProject}
                                onChange={(event, newValue) => {
                                    setSelectedProject(newValue)
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        className={classes.input}
                                        {...params}
                                        label="Select Project"
                                        variant="outlined"
                                        required
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="outlined-oppsummering"
                                label="Oppsummering *"
                                name="oppsummering"
                                value={[values.setOppsummering]}
                                onChange={handleChange('setOppsummering')}
                                className={classes.textField}
                                InputProps={{
                                    className: classes.input,
                                }}
                                margin="normal"
                                variant="outlined"
                            />
                            {errors.summary ? (
                                <Box
                                    className={classes.BoxErrorField}
                                    fontFamily="Monospace"
                                    color="error.main"
                                    p={1}
                                    m={1}
                                >
                                    {errors.summary} ⚠️
                                </Box>
                            ) : (
                                ''
                            )}
                        </Grid>
                        <Grid item xs={12} style={{ paddingLeft: '2rem' }}>
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={theme}>
                                    <Typography variant="body1">Beskrivelse *</Typography>
                                </ThemeProvider>
                            </StyledEngineProvider>
                            <Editor
                                placeholder="Skriv inn tekst her..."
                                editorState={editorStateDesc}
                                editorStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid lightgray',
                                    borderTop: '0px solid lightgray',
                                    minHeight: '100%',
                                    height: '350px',
                                    padding: '1em',
                                    borderRadius: '0 0 0.5rem 0.5rem',
                                }}
                                toolbarStyle={{
                                    borderRadius: '0.5rem 0.5rem 0 0',
                                    marginBottom: '1px',
                                }}
                                wrapperClassName="wrapper"
                                toolbarClassName="toolbar"
                                editorClassName="editor"
                                handlePastedFiles={handlePastedFiles}
                                onEditorStateChange={onEditorStateChangeDesc}
                                toolbar={{
                                    link: { inDropdown: true },
                                    list: { inDropdown: true },
                                    options: [
                                        'fontFamily',
                                        'fontSize',
                                        'inline',
                                        'image',
                                        'blockType',
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
                            {errors.description ? (
                                <Box
                                    className={classes.BoxErrorField}
                                    fontFamily="Monospace"
                                    color="error.main"
                                    p={1}
                                    m={1}
                                >
                                    {errors.description} ⚠️
                                </Box>
                            ) : (
                                ''
                            )}
                        </Grid>
                        <Grid item xs={12} style={{ paddingLeft: '2rem' }}>
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={theme}>
                                    <Typography variant="body1">Steg for å reprodusere</Typography>
                                </ThemeProvider>
                            </StyledEngineProvider>
                            <Editor
                                placeholder="Skriv inn tekst her..."
                                editorState={editorStateRep}
                                editorStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid lightgray',
                                    borderTop: '0px solid lightgray',
                                    minHeight: '100%',
                                    height: '350px',
                                    padding: '1em',
                                    borderRadius: '0 0 0.5rem 0.5rem',
                                }}
                                onEditorStateChange={onEditorStateChangeRep}
                                handlePastedText={() => false}
                                toolbarStyle={{
                                    borderRadius: '0.5rem 0.5rem 0 0',
                                    marginBottom: '1px',
                                }}
                                wrapperClassName="wrapper"
                                toolbarClassName="toolbar"
                                editorClassName="editor"
                                toolbar={{
                                    link: { inDropdown: true },
                                    list: { inDropdown: true },
                                    options: [
                                        'fontFamily',
                                        'fontSize',
                                        'image',
                                        'inline',
                                        'blockType',
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
                                    image: {
                                        urlEnabled: true,
                                        uploadEnabled: true,
                                        alignmentEnabled: true,
                                        uploadCallback: undefined,
                                        previewImage: true,
                                        inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                                        alt: { present: false, mandatory: false },
                                        defaultSize: {
                                            height: '50%',
                                            width: '50%',
                                        },
                                    },
                                    inline: {
                                        options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
                                    },
                                }}
                                hashtag={{
                                    separator: ' ',
                                    trigger: '#',
                                }}
                            />
                            {errors.step_reproduce ? (
                                <Box
                                    className={classes.BoxErrorField}
                                    fontFamily="Monospace"
                                    color="error.main"
                                    p={1}
                                    m={1}
                                >
                                    {errors.step_reproduce} ⚠️
                                </Box>
                            ) : (
                                ''
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Previews imageBool={false} />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                //disabled={images.imgUploadState}
                                type="submit"
                                value="Submit"
                                variant="contained"
                                color="primary"
                                className={classes.button}
                                onClick={(e) => createIssue(e)}
                                style={{
                                    margin: '0 auto',
                                    display: 'flex',
                                    padding: '1rem',
                                    borderRadius: '1em',
                                }}
                            >
                                Send inn sak
                                <Icon className={classes.rightIcon}>send</Icon>
                            </Button>
                        </Grid>
                        <Snackbar
                            open={open}
                            autohideduration={3000}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        >
                            <Alert onClose={handleClose} severity="success" variant="standard">
                                <AlertTitle>Suksess</AlertTitle>
                                Sak ble opprettet!
                            </Alert>
                        </Snackbar>
                    </Grid>
                </form>
            </Container>
        </div>
    )
}
