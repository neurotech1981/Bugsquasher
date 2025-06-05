import express, { Request, Response, RequestHandler } from 'express'
import Data from '../models/issue.js'
import {
    getAllIssues,
    getIssueById,
    updateIssue,
    deleteIssue,
    addIssue,
    updateDelegated,
    updateIssueStatus
} from '../controllers/issue.js'
import { getComments, addComment, updateComment, deleteComment, voteComment } from '../controllers/comment.js'
import { addReply, deleteReply } from '../controllers/reply.js'
import { addImage, deleteImage } from '../controllers/image.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

const router = express.Router()

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../assets/uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Function to sanitize Norwegian filenames
const sanitizeFilename = (filename: string): string => {
    // Replace Norwegian characters with safe alternatives
    const norwegianMap: { [key: string]: string } = {
        'å': 'aa',
        'æ': 'ae',
        'ø': 'oe',
        'Å': 'AA',
        'Æ': 'AE',
        'Ø': 'OE'
    }

    // Replace Norwegian characters
    let sanitized = filename
    Object.keys(norwegianMap).forEach(char => {
        sanitized = sanitized.replace(new RegExp(char, 'g'), norwegianMap[char])
    })

    // Remove or replace other problematic characters
    sanitized = sanitized
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars (except . and -) with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single underscore
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores

    return sanitized
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        // Properly decode the filename first
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
        const sanitizedName = sanitizeFilename(originalName)
        const uniqueName = `${uuidv4()}-${sanitizedName}`
        cb(null, uniqueName)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit (matching frontend)
    },
    fileFilter: (req, file, cb) => {
        // Allow images, PDFs, Word documents, and text files
        const allowedMimes = [
            // Images
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            // PDFs
            'application/pdf',
            // Word documents
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            // Text files
            'text/plain',
            'text/markdown',
            'application/octet-stream' // For .md files that might be detected as this
        ]

        if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error(`File type not supported: ${file.mimetype}. Allowed types: images, PDFs, Word documents, and text files.`))
        }
    }
})

// File upload route - must be before parameterized routes
router.post('/uploadImage', upload.array('imageData', 5), (async (req: Request, res: Response) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' })
        }

        const files = req.files as Express.Multer.File[]
        const response = files.map(file => ({
            filename: file.filename,
            path: file.path
        }))

        res.json(response)
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'An error occurred' })
    }
}) as RequestHandler)

// Delete uploaded file route
router.delete('/uploadedFiles/:filename', (async (req: Request, res: Response) => {
    try {
        const { filename } = req.params
        const filePath = path.join(uploadsDir, filename)

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            res.json({ success: true, message: 'File deleted successfully' })
        } else {
            res.status(404).json({ error: 'File not found' })
        }
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete file' })
    }
}) as RequestHandler)

// Issue routes
router.get('/getData', getAllIssues)
router.get('/:id', getIssueById)
router.post('/', addIssue)
router.patch('/:id', updateIssue)
router.delete('/:id', deleteIssue)

// Issue status and delegation
router.patch('/:id/status', updateIssueStatus)
router.patch('/:id/delegated', updateDelegated)

// Comment routes
router.get('/:id/comments', getComments)
router.post('/:id/comments', addComment)
router.patch('/:id/comments/:commentId', updateComment)
router.delete('/:id/comments/:commentId', deleteComment)

// Reply routes
router.post('/:id/comments/:commentId/replies', addReply)
router.delete('/:id/comments/:commentId/replies/:replyId', deleteReply)

// Image routes
router.post('/:id/images', addImage)
router.delete('/:id/images/:imageId', deleteImage)

// Voting routes
router.post('/:id/comments/:commentId/vote', voteComment as any)

export default router