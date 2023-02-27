/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import issueService from '../../services/issueService'
import '../../App.css'
import CommentForm from '../Comments/CommentForm'
import Comments from '../Comments/Comments'
import moment from 'moment'
import CssBaseline from '@mui/material/CssBaseline'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { AlertTitle } from '@mui/lab'
import UpdateIcon from '@mui/icons-material/Update'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Avatar from '@mui/material/Avatar'
import MenuItem from '@mui/material/MenuItem'
import ModalImage from 'react-modal-image'
import { deepPurple } from '@mui/material/colors'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import Box from '@mui/material/Box'
import { Link } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import { useHistory } from 'react-router-dom'
import auth from '../auth/auth-helper'
import { EditorState, convertFromRaw, ContentState } from 'draft-js'
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
import htmlToDraft from 'html-to-draftjs'
import Previews from './ImageUploader'

const drawerWidth = 240

const formattedDate = (value) => moment(value).format('DD/MM-YYYY')

const theme = createTheme({
  typography: {
    body1: {
      fontWeight: 600, // or 'bold'
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
    posistion: 'absolute',
    flexDirection: 'row',
    width: '50vh',
    height: '50%',
    padding: '1rem',
    backgroundColor: 'azure',
  },
  icon: {
    margin: 'theme.spacing(1)',
    fontSize: 24,
    position: 'absolute',
    top: '0',
    right: '0',
    cursor: 'pointer',
    //borderStyle: 'double',
    borderColor: 'black',
    color: 'gray',
    backgroundColor: 'transparent',
    //boxShadow: '0 3px 2px 1px rgba(0, 0, 0, .2)',
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
      content: '',
      display: 'table',
      clear: 'both',
    },
  },
}))

export default function ViewIssue(props) {
  const classes = useStyles()
  const [dataset, setData] = useState([''])
  const [showAside, setShowAside] = useState(true)

  const toggleAside = () => {
    setShowAside(!showAside)
  }

  const contentBlock = htmlToDraft('')
  const initState = contentBlock
    ? EditorState.createWithContent(ContentState.createFromBlockArray(contentBlock.contentBlocks))
    : EditorState.createEmpty()

  const [editorStateDesc, setEditorStateDesc] = useState(initState)
  const [editorStateRep, setEditorStateRep] = useState(initState)

  const [images, setImages] = useState([])
  const [openStatusUpdate, setOpenStatusUpdate] = useState({
    openStatusSnackbar: false,
    verticalStatusUpdate: 'bottom',
    horizontalStatusUpdate: 'left',
  })
  const [userinfo, setUserinfo] = useState({
    user: [''],
    redirectToSignin: false,
  })
  const [errors, setErrors] = useState('')
  const [open, setOpen] = useState(false)
  const [opennewcomment, setOpenNewComment] = useState(false)
  const [comments, setComments] = useState([])
  const [users, setUsers] = useState([])

  const history = useHistory()

  const pull_data = (data) => {
    let array = [...images]
    if (data !== -1) {
      array.splice(data, 1)
      setImages(array.length > 0 ? array : ['none'])
    }
  }

  const image_changes = (data) => {
    let array = [...images]
    data.forEach((element) => {
      array.push(element)
    })
    setImages(array)
  }

  const init = () => {
    const jwt = auth.isAuthenticated()
    let userId = auth.isAuthenticated().user._id

    findUserProfile(
      {
        userId,
      },
      { t: jwt.token }
    ).then((data) => {
      if (data.error) {
        setUserinfo({ redirectToSignin: true })
        console.log('data error: ', data.error)
      } else {
        setUserinfo({ user: data })
      }
    })

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
      let toggled = window.screen.width >= 1024 ? true : false
      setShowAside(toggled)
      init()
    }
  }, [users.length])

  const goHome = () => {
    history.push('/saker/' + auth.isAuthenticated().user._id)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleStatusUpdateClose = () => {
    setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: false })
  }

  const handleConfirmDelete = () => {
    onDelete()
  }

  const { id } = props.match.params

  const getIssueByID = async (id, token) => {
    const res = issueService.getIssueByID(id, token)
    await res.then(function (result) {
      console.log('result: ', result.imageName)
      setImages(result.imageName.length > 0 ? result.imageName : ['none'])
      setData(result)

      let editorStateDesc = EditorState.createWithContent(convertFromRaw(JSON.parse(result.description)))
      setEditorStateDesc(editorStateDesc)

      let editorStateRep = EditorState.createWithContent(convertFromRaw(JSON.parse(result.step_reproduce)))
      setEditorStateRep(editorStateRep)
    })
  }

  const getComments = async () => {
    const jwt = auth.isAuthenticated()
    await issueService
      .getComments(id, jwt.token)
      .then((response) => {
        setComments(response.response.comments)
      })
      .catch((e) => {
        console.error('Comment error: ', e)
      })
  }

  const upDateIssueStatus = async (id, data) => {
    const jwt = auth.isAuthenticated()

    await issueService
      .upDateIssueStatus(id, { status: data }, jwt.token)
      .then((response) => {
        setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })
        setData({ ...dataset, status: data })
      })
      .catch((e) => {
        console.error('Update issue error: ', e)
      })
  }

  const upDateDelegated = async (id, data) => {
    const jwt = auth.isAuthenticated()

    await issueService
      .upDateDelegated(id, { delegated: data }, jwt.token)
      .then((response) => {
        setOpenStatusUpdate({ ...openStatusUpdate, openStatusSnackbar: true })
        setData({ ...dataset, delegated: data })
      })
      .catch((e) => {
        console.error('Update delegated user error: ', e)
      })
  }

  const onDelete = async () => {
    const jwt = auth.isAuthenticated()

    const id = dataset._id
    await issueService
      .deleteIssueByID(id, jwt.token)
      .then(() => {
        setOpen(false)
        goHome()
      })
      .catch((e) => {
        console.error('Deleting issue error: ', e)
      })
  }

  const Status = [
    {
      value: 0,
      label: '🔓 Åpen',
      id: 'Åpen',
    },
    {
      value: 1,
      label: '✅ Løst',
      id: 'Løst',
    },
    {
      value: 2,
      label: '🔐 Lukket',
      id: 'Lukket',
    },
    {
      value: 3,
      label: '👷 Under arbeid',
      id: 'Under arbeid',
    },
  ]

  useEffect(
    () => {
      // Make sure to revoke the data uris to avoid memory leaks
      images.forEach((file) => URL.revokeObjectURL(file.preview))
    },
    [images] // files
  )

  const ImageList = images.map((file, index) => {
    if (file[0] === null || file === undefined || file === 'none') {
      return <div key={index}>Ingen vedlegg</div>
    }

    let path = file.path
    if (!file.path) path = file[0].path
    const smallImg = process.env.PUBLIC_URL + '/uploads/' + path
    const largeImg = smallImg

    return (
      <div key={index} className={classes.thumb}>
        <DeleteImageDialog imageIndex={index} images={images} func={pull_data} issueID={dataset._id} name={path} />
        <ModalImage
          small={smallImg}
          large={largeImg}
          alt={path}
          key={index}
          imageBackgroundColor="transparent"
          loading="lazy"
        />
      </div>
    )
  })

  const onSubmit = async (data) => {
    const jwt = auth.isAuthenticated()
    let { _id } = auth.isAuthenticated().user

    const commentData = {
      author: _id || undefined,
      content: data.content || undefined,
    }

    await issueService
      .addComment(commentData, jwt.token, id)
      .then(() => {
        getComments()
        setOpenNewComment(true)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  useEffect(() => {
    let isSubscribed = true
    if (isSubscribed) {
      const jwt = auth.isAuthenticated()
      getComments()
      getIssueByID(id, jwt.token)
    }
    return () => (isSubscribed = false)
  }, [setData, setComments])

  const onEditorStateChangeDesc = (editorState) => {
    setEditorStateDesc(editorState)
  }

  const onEditorStateChangeRep = (editorState) => {
    setEditorStateRep(editorState)
  }

  const { verticalStatusUpdate, horizontalStatusUpdate, openStatusSnackbar } = openStatusUpdate

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Slett sak'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Er du sikker på at du vil slette sak ?</DialogContentText>
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
      <div className="grid-container two-columns__center">
        <section className="two-columns__main">
          <div className="form-grid">
            <div className="item0">
              <Stack justifyContent="flex-end" alignItems="flex-end" direction="row-reverse" spacing={1}>
                <IconButton size={'small'} onClick={goHome} color="secondary">
                  <ArrowBackIcon
                    style={{
                      fontSize: '3rem',
                      borderRadius: '100vh',
                    }}
                  />
                </IconButton>
              </Stack>
            </div>
            <div className="item0-right-toggle">
              <Stack justifyContent="flex-end" alignItems="flex-end" direction="column" spacing={1}>
                <IconButton
                  size={'small'}
                  style={{
                    fontSize: '3rem',
                    borderRadius: '100vh',
                  }}
                  aria-label="settings-suggestIcon"
                  onClick={toggleAside}
                  color="secondary"
                >
                  <SettingsSuggestIcon />
                </IconButton>
              </Stack>
            </div>
            <div className="item1" style={{ paddingLeft: '5rem' }}>
              <Typography variant="h6">{dataset.reporter != null ? dataset.reporter.name : 'Laster...'}</Typography>
              <Typography variant="subtitle2">Opprettet: {formattedDate(dataset.createdAt)}</Typography>
            </div>
            <div className="item2">
              <TextField
                label="Priority"
                value={[dataset.priority ? dataset.priority : '']}
                className={classes.textField}
                margin="normal"
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
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
            <div className="item14">
              <InputLabel shrink htmlFor="select-multiple-native">
                Vedlegg
              </InputLabel>
              {ImageList ? ImageList : <div>Ingen vedlegg</div>}
              <Previews imageBool={true} issueID={dataset._id} func_image={image_changes} />
            </div>
            <div className="item4">
              <TextField
                label="Kategori"
                value={[dataset.category ? dataset.category : '']}
                className={classes.textField}
                margin="normal"
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
            <div className="item1">
              <Grid container alignItems="flex-start">
                <Avatar alt="Profile picture" className={classes.purpleAvatar}></Avatar>
              </Grid>
            </div>
            <div className="item7">
              <TextField
                label="Alvorlighetsgrad"
                value={[dataset.severity ? dataset.severity : '']}
                className={classes.textField}
                margin="normal"
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
            <div className="item8">
              <TextField
                label="Mulighet å reprodusere"
                value={[dataset.reproduce ? dataset.reproduce : '']}
                className={classes.textField}
                margin="normal"
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
            <div className="item15">
              <TextField
                label="Delegert til"
                value={[dataset.delegated != null ? dataset.delegated.name : 'Laster...']}
                className={classes.textField}
                margin="normal"
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
            <div className="item12">
              <TextField
                multiline
                label="Oppsummering"
                value={[dataset.summary ? dataset.summary : '']}
                className={classes.textField}
                margin="normal"
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
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
            <div className="item16">
              {comments.length > 0 ? (
                <>
                  <Comments comments={comments} issueID={dataset._id} userID={userinfo.user.id} />
                </>
              ) : (
                <Typography component={'p'} variant={'subtitle1'}>
                  Ingen kommentarer
                </Typography>
              )}
            </div>
            <div className="item17">
              <CommentForm onSubmit={onSubmit} openNewComment={opennewcomment} setOpenNewComment={setOpenNewComment} />
            </div>
          </div>
        </section>

        <Box sx={{ visibility: showAside ? 'visible' : 'hidden' }}>
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
                  disabled={auth.isAuthenticated().user._id !== dataset.userid}
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
                    value={[dataset.status ? dataset.status : 'Åpen']}
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
                    {Status.map((option, key) => (
                      <MenuItem key={key} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    id="outlined-select-delegert"
                    select
                    value={[dataset.delegated != null ? dataset.delegated._id : 0]}
                    label="Deleger til"
                    name="delegert"
                    onChange={(e) => upDateDelegated(dataset._id, e.target.value)}
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
                    {users.map((option, index) => (
                      <MenuItem key={index} value={option._id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {errors.delegated ? (
                    <Box className={classes.BoxErrorField} fontFamily="Monospace" color="error.main" p={1} m={1}>
                      {errors.delegated} ⚠️
                    </Box>
                  ) : (
                    ''
                  )}
                  <Snackbar
                    open={openStatusSnackbar}
                    autohideduration={3000}
                    onClose={handleStatusUpdateClose}
                    anchorOrigin={{
                      vertical: verticalStatusUpdate,
                      horizontal: horizontalStatusUpdate,
                    }}
                  >
                    <Alert severity="success" variant="standard" onClose={handleStatusUpdateClose}>
                      <AlertTitle>Suksess</AlertTitle>
                      Status ble endret!
                    </Alert>
                  </Snackbar>
                </FormControl>
                {errors.status ? (
                  <Box className={classes.BoxErrorField} fontFamily="Monospace" color="error.main" p={1} m={1}>
                    {errors.status} ⚠️
                  </Box>
                ) : (
                  ''
                )}
              </ListItem>
              <ListItem>
                <ListItemText
                  disableTypography
                  className={classes.dateText}
                  primary={
                    <Typography type="body2" style={{ color: '#000' }}>
                      Opprettet <AccessTimeIcon style={{ fontSize: '18', verticalAlign: 'text-top' }} />
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
                      Oppdatert <UpdateIcon style={{ fontSize: '18', verticalAlign: 'text-top' }} />
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
                      Prosjekt <UpdateIcon style={{ fontSize: '18', verticalAlign: 'text-top' }} />
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
    </div>
  )
}
