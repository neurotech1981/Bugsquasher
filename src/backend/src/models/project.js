import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Todo', 'In progress', 'Done'],
        required: true,
    },
    // Primary team assignments
    assignedTeams: [{
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true
        },
        role: {
            type: String,
            enum: ['Primary', 'Support', 'Consulting'],
            default: 'Primary'
        },
        assignedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Individual user assignments (for users not in assigned teams)
    teamMembers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['Manager', 'Developer', 'Tester', 'Designer', 'Consultant'],
                default: 'Developer'
            },
            permissions: {
                type: String,
                enum: ['Admin', 'Write', 'Read'],
                default: 'Write'
            },
            assignedAt: {
                type: Date,
                default: Date.now
            }
        },
    ],
    // Project manager (can be from team or individual)
    projectManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Additional project metadata
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    tags: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function(doc, ret) {
            if (ret._id) {
                ret.id = ret._id
                delete ret._id
            }
            return ret
        }
    }
})

// Virtual to get all project members (from teams + individual assignments)
projectSchema.virtual('allMembers').get(function() {
    const teamMembers = this.assignedTeams?.flatMap(assignment =>
        assignment.team?.members?.map(member => ({
            ...member,
            source: 'team',
            teamName: assignment.team.name,
            teamRole: assignment.role
        })) || []
    ) || []

    const individualMembers = this.teamMembers?.map(member => ({
        ...member,
        source: 'individual'
    })) || []

    return [...teamMembers, ...individualMembers]
})

// Method to check if user has access to project
projectSchema.methods.hasUserAccess = function(userId) {
    // Check if user is project manager
    if (this.projectManager && this.projectManager.toString() === userId.toString()) {
        return { hasAccess: true, role: 'Manager', permissions: 'Admin', source: 'manager' }
    }

    // Check individual assignments
    const individualAssignment = this.teamMembers?.find(member =>
        member.user.toString() === userId.toString()
    )
    if (individualAssignment) {
        return {
            hasAccess: true,
            role: individualAssignment.role,
            permissions: individualAssignment.permissions,
            source: 'individual'
        }
    }

    // Check team assignments
    for (const teamAssignment of this.assignedTeams || []) {
        if (teamAssignment.team?.members) {
            const teamMember = teamAssignment.team.members.find(member =>
                member.user.toString() === userId.toString()
            )
            if (teamMember) {
                return {
                    hasAccess: true,
                    role: teamMember.isLead ? 'Team Lead' : 'Team Member',
                    permissions: teamMember.isLead ? 'Write' : 'Write',
                    source: 'team',
                    teamName: teamAssignment.team.name
                }
            }
        }
    }

    return { hasAccess: false }
}

// Method to add team to project
projectSchema.methods.assignTeam = function(teamId, role = 'Primary') {
    const existingAssignment = this.assignedTeams?.find(assignment =>
        assignment.team.toString() === teamId.toString()
    )

    if (existingAssignment) {
        throw new Error('Team is already assigned to this project')
    }

    this.assignedTeams.push({
        team: teamId,
        role,
        assignedAt: new Date()
    })

    return this.save()
}

// Method to remove team from project
projectSchema.methods.removeTeam = function(teamId) {
    this.assignedTeams = this.assignedTeams?.filter(assignment =>
        assignment.team.toString() !== teamId.toString()
    ) || []

    return this.save()
}

// Method to add individual user
projectSchema.methods.addUser = function(userId, role = 'Developer', permissions = 'Write') {
    const existingUser = this.teamMembers?.find(member =>
        member.user.toString() === userId.toString()
    )

    if (existingUser) {
        throw new Error('User is already assigned to this project')
    }

    this.teamMembers.push({
        user: userId,
        role,
        permissions,
        assignedAt: new Date()
    })

    return this.save()
}

// Method to remove individual user
projectSchema.methods.removeUser = function(userId) {
    this.teamMembers = this.teamMembers?.filter(member =>
        member.user.toString() !== userId.toString()
    ) || []

    return this.save()
}

// Index for faster queries
projectSchema.index({ name: 1 })
projectSchema.index({ status: 1 })
projectSchema.index({ 'assignedTeams.team': 1 })
projectSchema.index({ 'teamMembers.user': 1 })
projectSchema.index({ projectManager: 1 })

const Project = mongoose.model('Project', projectSchema)

export default Project
