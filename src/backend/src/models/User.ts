import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
    email: string
    password: string
    name: string
    role: string
    rights?: string
    profileImage?: string
    issues?: mongoose.Types.ObjectId[]
    verificationToken?: string
    verified?: Date
    resetToken?: {
        token: string
        expires: Date
    }
    passwordReset?: Date
    socketId?: string
    hashedPassword?: string
    salt?: string
    comparePassword(candidatePassword: string): Promise<boolean>
    authenticate(candidatePassword: string): boolean
}

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    hashedPassword: {
        type: String,
        select: false
    },
    salt: {
        type: String,
        select: false
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['Bruker', 'Admin'],
        default: 'Bruker'
    },
    rights: {
        type: String,
        enum: ['Les', 'Skriv']
    },
    profileImage: {
        type: String
    },
    issues: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Data'
    }],
    verificationToken: {
        type: String,
        select: false
    },
    verified: Date,
    resetToken: {
        token: String,
        expires: Date
    },
    passwordReset: Date,
    socketId: String
}, {
    timestamps: true,
    collection: 'users',
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function(doc, ret) {
            delete ret.salt
        }
    }
})

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()

    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error as Error)
    }
})

// Compare password method for new bcrypt passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        if (this.password) {
            return await bcrypt.compare(candidatePassword, this.password)
        }
        return false
    } catch (error) {
        throw new Error('Error comparing passwords')
    }
}

// Authenticate method for old hashedPassword + salt system
userSchema.methods.authenticate = function(candidatePassword: string): boolean {
    if (!this.hashedPassword || !this.salt) return false
    return this.hashedPassword === bcrypt.hashSync(candidatePassword, this.salt)
}

// Create indexes with error handling
userSchema.index({ email: 1 }, {
    unique: true,
    background: true,
    sparse: true,
    collation: { locale: 'simple', strength: 2 }
})

// Error handling for duplicate key errors
userSchema.post('save', function(error: any, doc: any, next: any) {
    if (error.code === 11000) {
        next(new Error('Email already exists'))
    } else {
        next(error)
    }
})

// Check if model exists before creating
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User