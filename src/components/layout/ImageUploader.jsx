import React, { useEffect, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import {
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Chip,
    Grid,
    LinearProgress,
    Alert,
    Snackbar,
    useTheme,
    alpha,
    Stack,
    Avatar
} from '@mui/material'
import {
    CloudUpload,
    Delete,
    InsertDriveFile,
    Image as ImageIcon,
    CheckCircle,
    ErrorOutline
} from '@mui/icons-material'
import { makeStyles } from '@mui/styles'
import { useDispatch, useSelector } from 'react-redux'
import { addImageAction, deleteImageAction, clearAction, ImgUploadStateAction } from '../../redux/store'
import { v4 as uuid } from 'uuid'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'

const useStyles = makeStyles((theme) => ({
    dropzone: {
        border: `2px dashed ${theme.palette.divider}`,
        borderRadius: 16,
        padding: theme.spacing(4),
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
        },
        '&.dragActive': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            borderStyle: 'solid',
        },
        '&.dragReject': {
            borderColor: theme.palette.error.main,
            backgroundColor: alpha(theme.palette.error.main, 0.05),
        },
    },
    fileCard: {
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
        },
    },
    deleteButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: theme.palette.error.main,
        color: 'white',
        width: 32,
        height: 32,
        boxShadow: theme.shadows[2],
        zIndex: 1,
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
            boxShadow: theme.shadows[4],
        },
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
}))

function Previews({ imageBool = false, issueID, func_image }) {
    const classes = useStyles()
    const theme = useTheme()
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState({})
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    // Add ref to track component mounting state
    const isMountedRef = useRef(true)
    const timeoutRefs = useRef([])

    // Set mounted state properly
    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    const dispatch = useDispatch()
    const addImage = (files) => dispatch(addImageAction(files))
    const deleteImage = (files) => dispatch(deleteImageAction(files))
    const clearStoreImage = () => dispatch(clearAction())

    const showNotification = (message, severity = 'success') => {
        if (!isMountedRef.current) return
        setNotification({ open: true, message, severity })
    }

    const uploadFile = async (file) => {
        if (!isMountedRef.current) return

        const jwt = auth.isAuthenticated()
        if (!jwt) {
            showNotification('Please log in to upload files', 'error')
            return
        }

        if (!file || !file.id) {
            return
        }

        const fileId = file.id

        try {
            if (isMountedRef.current) {
                setUploading(prev => ({ ...prev, [fileId]: true }))
            }

            // Small delay to ensure UI shows the uploading state
            await new Promise(resolve => setTimeout(resolve, 100))

            const formData = new FormData()
            // Use original file object for upload if available
            const fileToUpload = file.originalFile || file
            formData.append('imageData', fileToUpload)

            const response = await issueService.uploadImage(formData, jwt.token)

            if (response && response.data && response.data.length > 0) {
                const uploadedFile = {
                    id: fileId,
                    name: file.name,
                    path: response.data[0].filename,
                    size: file.size,
                    type: file.type,
                    preview: file.preview
                }

                // Remove from files array and add to uploadedFiles array
                if (isMountedRef.current) {
                    setFiles(prev => prev.filter(f => f.id !== fileId))
                    setUploadedFiles(prev => {
                        const newUploadedFiles = [...prev, uploadedFile]
                        return newUploadedFiles
                    })
                    addImage([{ name: [uploadedFile] }])

                    // Call the callback function with the new file only
                    if (func_image) {
                        func_image([uploadedFile])
                    }
                }

                // Only add to existing issue if imageBool is true and issueID is provided
                if (imageBool && issueID) {
                    try {
                        await issueService.addImageToIssue(issueID, uploadedFile.path, jwt.token)
                        showNotification('Attachment added to issue!')
                    } catch (e) {
                        console.error('Error adding image to issue:', e)
                        showNotification('Failed to add attachment to issue', 'error')
                    }
                }

                showNotification(`${file.name} uploaded successfully!`)
            } else {
                throw new Error('Invalid response from server')
            }
        } catch (error) {
            console.error('Upload error:', error)
            showNotification(`Failed to upload ${file.name}`, 'error')

            // Remove the file from the list if upload failed
            if (isMountedRef.current) {
                setFiles(prev => prev.filter(f => f.id !== fileId))
            }
        } finally {
            if (isMountedRef.current) {
                setUploading(prev => {
                    const newState = { ...prev }
                    delete newState[fileId]
                    return newState
                })
            }
        }
    }

    const removeFile = async (fileId) => {
        if (!isMountedRef.current) return

        const fileToRemove = [...files, ...uploadedFiles].find(f => f.id === fileId)

        // If file was uploaded to server, delete it from server
        if (fileToRemove && fileToRemove.path) {
            try {
                const jwt = auth.isAuthenticated()
                if (jwt && jwt.token) {
                    await issueService.deleteUploadedFile(fileToRemove.path, jwt.token)
                    showNotification('File removed from server', 'success')
                }
            } catch (error) {
                console.error('Failed to delete file from server:', error)
                showNotification('File removed from form but may remain on server', 'warning')
            }
        }

        // Remove from local state
        if (isMountedRef.current) {
            setFiles(prev => prev.filter(f => f.id !== fileId))
            setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
            setUploading(prev => {
                const newState = { ...prev }
                delete newState[fileId]
                return newState
            })
        }

        showNotification(`File removed from form`, 'info')
    }

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        accept: 'image/*,application/pdf,.doc,.docx,.txt,.md',
        onDrop: (acceptedFiles, rejectedFiles) => {
            if (!isMountedRef.current) return

            if (rejectedFiles && rejectedFiles.length > 0) {
                rejectedFiles.forEach(rejection => {
                    showNotification(`${rejection.file.name}: ${rejection.errors[0].message}`, 'error')
                })
            }

            if (acceptedFiles && acceptedFiles.length > 0) {
                const processedFiles = acceptedFiles.map(file => {
                    const processedFile = {
                        id: uuid(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                        // Keep reference to original File object for upload
                        originalFile: file,
                        // Explicitly set path as undefined for new files
                        path: undefined
                    }
                    return processedFile
                })

                                                if (isMountedRef.current) {
                    setFiles(prev => [...prev, ...processedFiles])

                    // Auto-upload files immediately after adding to state
                    processedFiles.forEach((file, index) => {
                        // Small staggered delay to prevent server overload
                        setTimeout(() => {
                            if (isMountedRef.current) {
                                uploadFile(file)
                            }
                        }, 100 + (index * 200)) // 100ms initial delay, then 200ms between files
                    })
                }
            }
        },
        maxSize: 10 * 1024 * 1024, // 10MB limit
        multiple: true,
        preventDropOnDocument: true
    })

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return <ImageIcon />
        return <InsertDriveFile />
    }

    // Cleanup effect for object URLs and timeouts
    useEffect(() => {
        return () => {
            // Clear all pending timeouts
            timeoutRefs.current.forEach(timeoutId => {
                clearTimeout(timeoutId)
            })
            timeoutRefs.current = []

            // Clean up object URLs
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview)
                }
            })
        }
    }, [files])

    const allFiles = [...files, ...uploadedFiles].reduce((acc, file) => {
        if (!acc.find(f => f.id === file.id)) {
            acc.push(file)
        }
        return acc
    }, [])

    return (
        <Box>
            {/* Dropzone */}
            <Box
                {...getRootProps()}
                className={`${classes.dropzone} ${isDragActive ? 'dragActive' : ''} ${isDragReject ? 'dragReject' : ''}`}
            >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                {isDragActive ? (
                    <Typography variant="h6" color="primary">
                        Slipp filene her...
                    </Typography>
                ) : isDragReject ? (
                    <Typography variant="h6" color="error">
                        Filtypen støttes ikke
                    </Typography>
                ) : (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Dra og slipp filer her, eller klikk for å velge
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Støtter bilder, PDF, Word-dokumenter og tekstfiler (maks 10MB)
                        </Typography>
                    </>
                )}
            </Box>

            {/* File List */}
            {allFiles.length > 0 && (
                <Box mt={3}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InsertDriveFile color="primary" />
                        Vedlagte filer ({allFiles.length})
                    </Typography>

                    <Grid container spacing={2}>
                        {allFiles.map((file) => (
                            <Grid item xs={12} sm={6} md={4} key={file.id}>
                                <Card className={classes.fileCard} elevation={2}>
                                    <CardContent sx={{ p: 2, position: 'relative', overflow: 'visible' }}>
                                        {uploading[file.id] && (
                                            <Box className={classes.uploadingOverlay}>
                                                <Stack alignItems="center" spacing={1}>
                                                    <LinearProgress sx={{ width: '80%' }} />
                                                    <Typography variant="caption">Laster opp...</Typography>
                                                </Stack>
                                            </Box>
                                        )}

                                        <IconButton
                                            className={classes.deleteButton}
                                            size="small"
                                            onClick={() => removeFile(file.id)}
                                            disabled={uploading[file.id]}
                                        >
                                            <Delete sx={{ fontSize: 16 }} />
                                        </IconButton>

                                                                                <Stack spacing={1.5}>
                                            {file.preview ? (
                                                <Box
                                                    component="img"
                                                    src={file.preview}
                                                    alt={file.name}
                                                    sx={{
                                                        width: '100%',
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                    }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        height: 100,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                                        {getFileIcon(file)}
                                                    </Avatar>
                                                </Box>
                                            )}

                                            <Box>
                                                <Typography variant="body2" fontWeight="medium" noWrap title={file.name}>
                                                    {file.name || 'Unknown file'}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {file.size ? formatFileSize(file.size) : 'Unknown size'}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Chip
                                                    size="small"
                                                    icon={file.path ? <CheckCircle /> : uploading[file.id] ? null : <ErrorOutline />}
                                                    label={
                                                        file.path ? 'Uploaded' :
                                                        uploading[file.id] ? 'Uploading...' : 'Ready'
                                                    }
                                                    color={
                                                        file.path ? 'success' :
                                                        uploading[file.id] ? 'primary' : 'default'
                                                    }
                                                    variant={file.path ? 'filled' : 'outlined'}
                                                />

                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                    severity={notification.severity}
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default Previews
