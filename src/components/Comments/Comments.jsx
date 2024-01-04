import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
  Zoom,
  Alert,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import EditIcon from '@mui/icons-material/Edit'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import PersonPinIcon from '@mui/icons-material/PersonPin'
//import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import ReplyIcon from '@mui/icons-material/Reply'
import { AlertTitle } from '@mui/lab'
import { randAvatar } from '@ngneat/falso'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'
import DeleteCommentDialog from '../Dialogs/DeleteComment'
import DeleteCommentReplyDialog from '../Dialogs/DeleteCommentReply'

const formattedDate = (value) => moment(value).format('DD/MM-YYYY HH:mm')

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '1rem',
  },
  commentField: {
    minWidth: '90%',
    backgroundColor: 'white',
  },
  fontName: {
    fontWeight: 'bold',
    color: 'black',
    verticalAlign: 'middle',
  },
  fontEmail: {
    color: 'black',
    fontSize: '0.8em',
    verticalAlign: 'middle',
  },
  commentIndent: {
    marginLeft: 20,
    paddingLeft: '20px',
    //borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.4)}`,
  },
  indent: {
    marginLeft: 20,
    paddingLeft: '12px',
    borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.4)}`,
  },
  inline: {
    display: 'inline',
  },
  fontBody: {
    color: 'black',
    verticalAlign: 'middle',
    overflowWrap: 'break-word',
  },
  iconDate: {
    fontSize: '1.0rem',
    verticalAlign: 'sub',
    fontWeight: 'bold',
    marginRight: '5px',
  },
}))

const Comments = ({ comments, issueID, userID }) => {
  const jwt = auth.isAuthenticated()
  const [hidden, setHidden] = useState({})
  const [hiddenEdit, setHiddenEdit] = useState({})
  const [reply, setReply] = useState('')
  const [comment, setComments] = useState([])
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)
  const [collapseComments, setCollapseComments] = useState(true)
  const [collapseCommentReply, setCollapseCommentReply] = useState('')
  const [hiddenReply, setHiddenReply] = useState({})
  //const [commentUpdate, setCommentUpdate] = useState("");

  const pull_data = (data) => {
    setMessage('Kommentaren din ble slettet')
    setOpen(true)
    setComments(data)
  }

  const pull_data_reply = (data) => {
    setMessage('Svaret ditt ble slettet')
    setOpen(true)
    setComments(data)
  }

  const toggleHide = (index) => {
    setHidden({ ...hidden, [index]: !hidden[index] })
  }

  const toggleHideCommentEdit = (index) => {
    setHiddenEdit({ ...hiddenEdit, [index]: !hiddenEdit[index] })
  }

  const toggleHideReply = (index) => {
    setHiddenReply({ ...hiddenReply, [index]: !hiddenReply[index] })
  }

  const handleChange = (event) => {
    setReply(event.target.value)
  }

  const handleChangeComment = (id, e) => {
    setComments((prevState) => {
      return prevState.map((item) => {
        if (item._id === id) return { ...item, content: e.target.value }
        return item
      })
    })
  }

  const handleChangeCommentReplies = (e, commentChildIndex, commentIndex) => {
    setComments(
      comment.map((x, index) => {
        if (index !== commentIndex) return x
        x.comments = x.comments.map((subItem, subIndex) => {
          if (subIndex !== commentChildIndex) return subItem
          return {
            ...subItem,
            content: e.target.value,
          }
        })

        return x
      })
    )
  }

  const handleClickCommentCollapse = () => {
    setCollapseComments(!collapseComments)
  }

  const handleClickCommentReplyCollapse = (index) => {
    if (collapseCommentReply === index) {
      setCollapseCommentReply('')
    } else {
      setCollapseCommentReply(index)
    }
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const SuccessAlert = () => (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity="success" variant="filled">
        <AlertTitle>Suksess</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  )

  useEffect(() => {
    setComments(comments)
  }, [comments])

  const submitReply = (e, commentID, index, indexInput) => {
    const jwt = auth.isAuthenticated()
    console.log(userID)
    setMessage('Svaret ble lagt til')
    issueService
      .addCommentReply(userID, reply, jwt.token, issueID, commentID, index)
      .then((data) => {
        setComments(data.data.response[0].comments)
        if (data.data.success) {
          console.log(data.data.response[0].comments)
          setOpen(true)
          setReply('')
          toggleHideReply(index - 1)
          toggleHide(indexInput)

          e.preventDefault()
          e.stopPropagation()
        }
      })
      .catch((error) => {
        console.log('Error', error)
      })
  }

  const submitCommentEdit = (e, commentID, newContent, index, reply) => {
    const jwt = auth.isAuthenticated()
    setMessage('Kommentar ble redigert')
    issueService
      .updateComment(newContent, issueID, jwt.token, commentID, index)
      .then((data) => {
        setComments(data.data.response[0].comments)
        if (data.data.success) {
          setOpen(true)
          setReply('')
          if (reply) {
            toggleHideCommentEdit(commentID)
          } else {
            toggleHideCommentEdit(index)
          }
          e.preventDefault()
          e.stopPropagation()
        }
      })
      .catch((error) => {
        console.log('Error', error)
      })
  }

  const classes = useStyles()
  return (
    <>
      <Typography component={'span'} variant={'subtitle1'}>
        Kommentarer ({comment.length})
      </Typography>
      <SuccessAlert />
      <ListItem button onClick={handleClickCommentCollapse} style={{ minWidth: '100vh', marginBottom: '2em' }}>
        {collapseComments ? (
          <>
            <ExpandLess aria-label="Skjul" />
            <Typography>{'Skjul kommentarer'}</Typography>
          </>
        ) : (
          <>
            <ExpandMore aria-label="Vis mer" />
            <Typography>{'Vis kommentarer'}</Typography>
          </>
        )}
      </ListItem>
      <Collapse in={collapseComments} timeout="auto" unmountOnExit>
        {comment.map((result, index) => {
          let parentId = result._id
          let parentIndex = index
          return (
            <React.Fragment key={index}>
              <Grid justifyContent="flex-start" container wrap="nowrap" spacing={1} key={result._id}>
                <Grid item>
                  <Avatar alt="Profil bilde" src={randAvatar()} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  {result.author.name}
                  {result.author._id === jwt.user._id ? (
                    <>
                      <IconButton size="small" aria-label="delete" color="secondary">
                        <DeleteCommentDialog func={pull_data} commentId={result._id} id={issueID} />
                      </IconButton>
                      <IconButton size="small" aria-label="edit" color="primary" style={{ verticalAlign: 'top' }}>
                        <Tooltip title="Rediger">
                          <EditIcon key={index} onClick={() => toggleHideCommentEdit(index)} />
                        </Tooltip>
                      </IconButton>
                    </>
                  ) : (
                    <IconButton size="small" aria-label="reply" color="primary">
                      <ReplyIcon key={index} onClick={() => toggleHide(index)} />
                    </IconButton>
                  )}
                  {!hiddenEdit[index] && (
                    <>
                      <p style={{ textAlign: 'left' }}>{result.content} </p>
                      <p style={{ textAlign: 'left', color: 'gray' }}>postet {formattedDate(result.updatedAt)}</p>
                    </>
                  )}
                  {!!hiddenEdit[index] && (
                    <Zoom in={hiddenEdit[index]}>
                      <div key={index} style={{ textAlign: 'start' }}>
                        <TextField
                          id="content"
                          name="content"
                          key={result._id}
                          label="Rediger"
                          className={classes.commentField}
                          multiline={true}
                          rows={2}
                          onChange={(e) => handleChangeComment(result._id, e)}
                          value={comment.find((i) => i._id === result._id).content}
                          variant="outlined"
                        />
                        <Box mt={1} mb={3}>
                          <Typography component={'p'} variant={'subtitle1'}>
                            <Button
                              style={{ marginRight: '1em' }}
                              variant="contained"
                              color="primary"
                              onClick={(e) => submitCommentEdit(e, result._id, comment[index], index, false)}
                            >
                              Oppdater
                            </Button>
                            <Button
                              key={index}
                              variant="contained"
                              color="secondary"
                              onClick={() => toggleHideCommentEdit(index)}
                            >
                              Avbryt
                            </Button>
                          </Typography>
                        </Box>
                      </div>
                    </Zoom>
                  )}
                  {!!hidden[index] && (
                    <Zoom in={hidden[index]}>
                      <div key={index} style={{ textAlign: 'start' }}>
                        <TextField
                          id="outlined-basic"
                          key={index}
                          label="Svar"
                          className={classes.commentField}
                          multiline={true}
                          rows={2}
                          variant="outlined"
                          onChange={(e) => handleChange(e)}
                        />
                        <Box mt={1} mb={3}>
                          <Typography component={'p'} variant={'subtitle1'}>
                            <Button
                              style={{ marginRight: '1em' }}
                              variant="contained"
                              color="primary"
                              onClick={(e) => submitReply(e, result._id, 0, index)}
                            >
                              Svar
                            </Button>
                            <Button
                              key={index}
                              variant="contained"
                              color="secondary"
                              onClick={() => toggleHide(result._id)}
                            >
                              Avbryt
                            </Button>
                          </Typography>
                        </Box>
                      </div>
                    </Zoom>
                  )}
                </Grid>
              </Grid>
              {!!result.comments.length > 0 && (
                <ListItem
                  button
                  key={index}
                  onClick={() => {
                    handleClickCommentReplyCollapse(index)
                  }}
                  style={{ minWidth: '100vh', marginBottom: '0.5em' }}
                >
                  {index === collapseCommentReply ? (
                    <>
                      <ExpandLess aria-label="Skjul" />
                      <Typography>{'Skjul svar' + ' (' + result.comments.length + ')'}</Typography>
                    </>
                  ) : (
                    <>
                      <ExpandMore aria-label="Vis mer" />
                      <Typography>{'Vis svar' + ' (' + result.comments.length + ')'}</Typography>
                    </>
                  )}
                </ListItem>
              )}
              <Collapse in={index === collapseCommentReply} timeout="auto" unmountOnExit>
                {result.comments?.map((result, index) => {
                  return (
                    <>
                      <Grid className={classes.commentIndent} item xs zeroMinWidth key={result._id}>
                        <Grid key={index} item>
                          <List style={{ textAlign: 'left', color: 'gray' }} className={classes.commentIndent}>
                            <PersonPinIcon className={classes.iconDate} />
                            {result.author.name}
                            {result.author._id === jwt.user._id ? (
                              <>
                                <IconButton size="small" aria-label="delete" color="secondary">
                                  <DeleteCommentReplyDialog
                                    func_reply={pull_data_reply}
                                    parentId={parentId}
                                    childId={result._id}
                                    id={issueID}
                                  />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  aria-label="delete"
                                  color="primary"
                                  style={{ verticalAlign: 'top' }}
                                >
                                  <EditIcon key={result._id} onClick={() => toggleHideCommentEdit(result._id)} />
                                </IconButton>
                              </>
                            ) : (
                              <IconButton size="small" aria-label="delete" color="primary">
                                <ReplyIcon key={result._id} onClick={() => toggleHideReply(result._id)} />
                              </IconButton>
                            )}
                            <ListItemText>
                              {!hiddenEdit[result._id] && (
                                <>
                                  <p
                                    style={{
                                      textAlign: 'left',
                                      color: 'black',
                                    }}
                                  >
                                    {result.content}{' '}
                                  </p>
                                  <p
                                    style={{
                                      textAlign: 'left',
                                      color: 'gray',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    postet {formattedDate(result.updatedAt)}
                                  </p>
                                </>
                              )}

                              {!!hiddenEdit[result._id] && (
                                <Zoom in={hiddenEdit[result._id]}>
                                  <div key={index} style={{ textAlign: 'start' }}>
                                    <TextField
                                      id="content"
                                      name="content"
                                      key={result._id}
                                      label="Rediger"
                                      className={classes.commentField}
                                      multiline={true}
                                      minRows={2}
                                      variant="outlined"
                                      value={
                                        comment.find((i) => {
                                          if (i._id === parentId) {
                                            return i.comments[0]
                                          }
                                        }).comments[index].content
                                      }
                                      onChange={(e) => handleChangeCommentReplies(e, index, parentIndex)}
                                    />
                                    <Box mt={1} mb={3}>
                                      <Typography component={'p'} variant={'subtitle1'}>
                                        <Button
                                          style={{ marginRight: '1em' }}
                                          variant="contained"
                                          color="primary"
                                          onClick={(e) =>
                                            submitCommentEdit(
                                              e,
                                              result._id,
                                              comment[parentIndex].comments[index],
                                              index,
                                              true
                                            )
                                          }
                                        >
                                          Oppdater
                                        </Button>
                                        <Button
                                          key={result._id}
                                          variant="contained"
                                          color="secondary"
                                          onClick={() => toggleHideCommentEdit(result._id)}
                                        >
                                          Avbryt
                                        </Button>
                                      </Typography>
                                    </Box>
                                  </div>
                                </Zoom>
                              )}
                              {!!hiddenReply[result._id] && (
                                <Zoom in={hiddenReply[result._id]}>
                                  <div key={index} style={{ paddingTop: '1em' }}>
                                    <TextField
                                      id="outlined-basic"
                                      key={index}
                                      label="Svar"
                                      className={classes.commentField}
                                      variant="outlined"
                                      multiline={true}
                                      rows={2}
                                      defaultValue={'@' + result.author.name + ' '}
                                      onChange={(e) => handleChange(e)}
                                    />
                                    <Box mt={1}>
                                      <Typography component={'p'} variant={'subtitle'}>
                                        <Button
                                          style={{ marginRight: '1em' }}
                                          variant="contained"
                                          color="primary"
                                          onClick={(e) => submitReply(e, parentId, index + 1)}
                                        >
                                          Svar
                                        </Button>
                                        <Button
                                          key={index}
                                          variant="contained"
                                          color="secondary"
                                          onClick={() => toggleHideReply(result._id)}
                                        >
                                          Avbryt
                                        </Button>
                                      </Typography>
                                    </Box>
                                  </div>
                                </Zoom>
                              )}
                            </ListItemText>
                          </List>
                        </Grid>
                      </Grid>
                    </>
                  )
                })}
              </Collapse>
              <Divider variant="fullWidth" style={{ margin: '10px 0' }} />
            </React.Fragment>
          )
        })}
      </Collapse>
    </>
  )
}

export default Comments
