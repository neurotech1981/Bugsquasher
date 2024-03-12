import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import UploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import Icon from '@mui/material/Icon'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import Snackbar from '@mui/material/Snackbar'
import axios from 'axios'
import auth from '../auth/auth-helper'
import MuiAlert from '@mui/lab/Alert'
import { AlertTitle } from '@mui/lab'
import LinearProgress from '@mui/material/LinearProgress'
import { makeStyles } from '@mui/styles'
import { useDispatch, useSelector } from 'react-redux'
import { addImageAction, deleteImageAction, clearAction, ImgUploadStateAction } from '../../redux/store'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'
import { v4 as uuid } from 'uuid'
import issueService from '../../services/issueService'
import Alert from '@mui/material/Alert'
function LinearProgressWithLabel(props) {
    return (
        <Box display="flex" alignItems="center" style={{ padding: '1em' }}>
            <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box minWidth={25}>
                <Typography variant="body2" color="textSecondary">{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    )
}

LinearProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate and buffer variants.
     * Value between 0 and 100.
     */
    value: PropTypes.number.isRequired,
}

const useStyles = makeStyles(() => ({
    root: {
        border: 0,
        paddingLeft: '20px',
        borderRadius: 3,
        color: 'theme.palette.text.primary',
        padding: '0 0px',
    },
    borderProgress: {
        borderRadius: 5,
        width: '95%',
        margin: '0 auto',
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
        color: 'black',
        backgroundColor: 'transparent',
        //boxShadow: '0 3px 2px 1px rgba(0, 0, 0, .2)',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
            color: 'purple',
            boxShadow: '0 0px 0px 0px rgba(0, 0, 0, .3)',
        },
    },
}))

const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
}

const thumb = {
    display: 'inline-flex',
    position: 'relative',
    borderRadius: 2,
    border: '3px solid #eaeaea',
    marginBottom: 8,
    marginRight: 4,
    width: 150,
    height: 150,
    padding: 4,
    boxSizing: 'border-box',
    margin: '0 auto',
}

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden',
}

const img = {
    display: 'block',
    width: 'auto',
    height: '100%',
}

function Previews(props) {
    const { imageBool, issueID, func_image } = props
    const classes = useStyles()
    const [files, setFiles] = useState([])
    const [open, setOpen] = useState(false)
    const dispatch = useDispatch()
    const addImage = (files) => dispatch(addImageAction(files))
    const deleteImage = (files) => dispatch(deleteImageAction(files))
    const clearStoreImage = (files) => dispatch(clearAction(files))
    const ImgUploadState = (images) => dispatch(ImgUploadStateAction(images))
    const [progress, setProgress] = useState(0)

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setProgress(0)
        setOpen(false)
    }

    const images = useSelector((state) => state)

    const removeImage = (imageIndex) => {
        let array = [...files]
        if (imageIndex !== -1) {
            array = files.filter((_, index) => index !== imageIndex)
            setFiles(
                array.map((file) =>
                    Object.assign(file, {
                        id: uuid(),
                        preview: URL.createObjectURL(file),
                    })
                )
            )
            acceptedFiles.splice(acceptedFiles.indexOf(imageIndex), 1)
            deleteImage({ name: array.map((file) => file) })
        }

        ImgUploadState(false)
    }

    const uploadToServer = async (e) => {
        const jwt = auth.isAuthenticated()
        let token = jwt.token

        e.preventDefault()
        /* eslint-disable no-unused-vars */
        await new Promise((resolve, reject) => {
            const imageFormObj = new FormData()
            for (let x = 0; x < acceptedFiles.length; x++) {
                imageFormObj.append('imageData', images.state.imageupload[1][0].name[x])
            }

            let fileData = {
                path: '',
                id: '',
            }

            let fileArray = []

            let id = issueID

            axios
                .post('/api/uploadImage', imageFormObj, {
                    headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const { loaded, total, lengthComputable } = progressEvent
                        if (lengthComputable && total > 0) {
                            setProgress(Math.round(loaded * 100) / total)
                        }
                    },
                })
                .then((response) => {
                    if (Promise.resolve('Success').then) {
                        setOpen(true)

                        response.data.forEach((element) => {
                            fileData.id = uuid()
                            fileData.path = element.filename
                            fileArray.push(fileData)
                            fileData = {
                                path: '',
                                id: '',
                            }
                        })

                        addImage([
                            {
                                name: fileArray,
                            },
                        ])

                        if (imageBool) {
                            func_image(fileArray)
                            issueService.addImageToIssue(id, { fileArray }, jwt.token).catch((e) => {
                                console.log('Error adding image to issue: ', e)
                            })
                            setTimeout(function () {
                                clearStoreImage(clearAction)
                                setProgress(0)
                                setFiles([])
                                setOpen(false)
                            }, 2000)
                        }
                    }
                    ImgUploadState(true)
                })
            setProgress(0)
        })
    }

    const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
            setFiles([])
            clearStoreImage(clearAction)
            setFiles(
                acceptedFiles.map((file) =>
                    Object.assign(file, {
                        id: uuid(),
                        preview: URL.createObjectURL(file),
                    })
                )
            )
            addImage([
                {
                    name: acceptedFiles.map((file) => file),
                },
            ])
            ImgUploadState(true)
        },
    })

    const thumbs = files.map((file, index) => (
        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <DeleteForeverRoundedIcon onClick={() => removeImage(index)} className={classes.icon} />
                <img alt={file.name} src={file.preview} style={img} />
            </div>
        </div>
    ))

    useEffect(
        () => {
            if (!files) {
                // Make sure to revoke the data uris to avoid memory leaks
                files.forEach((file) => URL.revokeObjectURL(file.preview))
            }
        },
        [files] // files
    )

    const handleChange = async (event) => {
        event.preventDefault()
        setFiles(event.target.value)
    }

    return (
        <React.Fragment>
            <section className={classes.root}>
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input
                        {...getInputProps()}
                        multiple
                        name="imageData"
                        encType="multipart/form-data"
                        onSubmit={handleChange}
                    />
                    <UploadIcon className="iconSmall" />
                    <p>Dra og slipp filer her, eller klikk for å velge fil(er)</p>
                </div>
                <aside style={thumbsContainer}>{thumbs}</aside>
                {progress ? (
                    <LinearProgressWithLabel
                        autohideduration={3000}
                        className={classes.borderProgress}
                        value={progress}
                    />
                ) : null}
                <p>
                    <Button
                        disabled={!files.length > 0}
                        variant="contained"
                        color="secondary"
                        onClick={(e) => uploadToServer(e)}
                        style={{
                            margin: '0 auto',
                            display: 'flex',
                            padding: '1rem',
                            borderRadius: '1em',
                        }}
                    >
                        Last opp bilde(r)
                        <Icon style={{ marginLeft: '15px' }} className={classes.rightIcon}>
                            cloud_upload
                        </Icon>
                    </Button>
                </p>
                <Snackbar
                    open={open}
                    autohideduration={2000}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleClose} severity="success" variant="filled">
                        <AlertTitle>Suksess</AlertTitle>
                        {files.length} {files.length > 0 ? 'bilder' : 'bilde'} ble lastet opp!
                    </Alert>
                </Snackbar>
            </section>
        </React.Fragment>
    )
}

export default Previews
