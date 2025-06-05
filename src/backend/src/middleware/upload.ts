import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { Request } from 'express'

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_PATH || '../assets/uploads')
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = crypto.randomBytes(16).toString('hex')
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`)
    }
})

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']

    if (!allowedTypes.includes(file.mimetype)) {
        cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'))
        return
    }

    // Check file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
    if (file.size > maxSize) {
        cb(new Error(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`))
        return
    }

    cb(null, true)
}

// Create multer upload instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
        files: 5 // Maximum number of files
    }
})

// Error handling middleware for multer
export const handleUploadError = (err: any, req: Request, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: `Maximum file size is ${process.env.MAX_FILE_SIZE / 1024 / 1024}MB`
            })
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files',
                message: 'Maximum 5 files allowed'
            })
        }
    }
    if (err) {
        return res.status(400).json({
            error: 'Upload error',
            message: err.message
        })
    }
    next()
}