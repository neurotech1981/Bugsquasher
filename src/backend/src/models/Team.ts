import mongoose, { Schema, Document } from 'mongoose'

// Team Member interface for the membership relationship
export interface ITeamMember {
    user: mongoose.Types.ObjectId
    isLead: boolean
    joinedAt: Date
}

// Team interface
export interface ITeam extends Document {
    name: string
    description?: string
    members: ITeamMember[]
    createdBy: mongoose.Types.ObjectId
    projects?: mongoose.Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
}

// Team schema
const teamSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [255, 'Team name cannot exceed 255 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isLead: {
            type: Boolean,
            default: false
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }]
}, {
    timestamps: true,
    collection: 'teams',
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function(doc, ret) {
            // Transform the _id to id for consistency
            if (ret._id) {
                ret.id = ret._id
                delete ret._id
            }
            return ret
        }
    }
})

// Index for faster queries
teamSchema.index({ name: 1 })
teamSchema.index({ 'members.user': 1 })
teamSchema.index({ createdBy: 1 })

// Virtual for team lead
teamSchema.virtual('teamLead').get(function() {
    const lead = this.members.find(member => member.isLead)
    return lead ? lead.user : null
})

// Method to add member
teamSchema.methods.addMember = function(userId: mongoose.Types.ObjectId, isLead: boolean = false) {
    // Check if user is already a member
    const existingMember = this.members.find(member =>
        member.user.toString() === userId.toString()
    )

    if (existingMember) {
        throw new Error('User is already a member of this team')
    }

    this.members.push({
        user: userId,
        isLead,
        joinedAt: new Date()
    })

    return this.save()
}

// Method to remove member
teamSchema.methods.removeMember = function(userId: mongoose.Types.ObjectId) {
    this.members = this.members.filter(member =>
        member.user.toString() !== userId.toString()
    )

    return this.save()
}

// Method to update member role
teamSchema.methods.updateMemberRole = function(userId: mongoose.Types.ObjectId, isLead: boolean) {
    const member = this.members.find(member =>
        member.user.toString() === userId.toString()
    )

    if (!member) {
        throw new Error('User is not a member of this team')
    }

    member.isLead = isLead

    return this.save()
}

// Method to check if user is member
teamSchema.methods.isMember = function(userId: mongoose.Types.ObjectId): boolean {
    return this.members.some(member =>
        member.user.toString() === userId.toString()
    )
}

// Method to check if user is team lead
teamSchema.methods.isTeamLead = function(userId: mongoose.Types.ObjectId): boolean {
    return this.members.some(member =>
        member.user.toString() === userId.toString() && member.isLead
    )
}

// Pre-save middleware to ensure at least one team lead if there are members
teamSchema.pre('save', function(next) {
    if (this.members && this.members.length > 0) {
        const hasLead = this.members.some(member => member.isLead)
        if (!hasLead) {
            // Make the first member a team lead if no lead is set
            this.members[0].isLead = true
        }
    }
    next()
})

// Check if model exists before creating
const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema)

export default Team