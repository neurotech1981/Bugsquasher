import { Request, Response } from 'express'
import mongoose from 'mongoose'
import Team from '../models/Team.js'
import User from '../models/User.js'

// Interface for authenticated request
interface AuthRequest extends Request {
    user?: {
        userId: string
        role?: string
        iat: number
        exp: number
    }
}

// Create a new team
export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, members = [] } = req.body
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        if (!name || name.trim().length === 0) {
            res.status(400).json({ error: 'Team name is required' })
            return
        }

        // Check if team name already exists
        const existingTeam = await Team.findOne({ name: name.trim() })
        if (existingTeam) {
            res.status(409).json({ error: 'Team name already exists' })
            return
        }

        // Prepare team members array
        const teamMembers = []

        // Add creator as team lead
        teamMembers.push({
            user: new mongoose.Types.ObjectId(userId),
            isLead: true,
            joinedAt: new Date()
        })

        // Add other members if provided
        if (members && members.length > 0) {
            for (const member of members) {
                // Validate user exists
                const user = await User.findById(member.userId)
                if (!user) {
                    res.status(400).json({ error: `User with ID ${member.userId} not found` })
                    return
                }

                // Don't add creator twice
                if (member.userId !== userId) {
                    teamMembers.push({
                        user: new mongoose.Types.ObjectId(member.userId),
                        isLead: member.isLead || false,
                        joinedAt: new Date()
                    })
                }
            }
        }

        const team = new Team({
            name: name.trim(),
            description: description?.trim(),
            members: teamMembers,
            createdBy: new mongoose.Types.ObjectId(userId)
        })

        await team.save()

        // Populate the team with user details
        await team.populate('members.user', 'name email profileImage')
        await team.populate('createdBy', 'name email')

        res.status(201).json({
            success: true,
            team,
            message: 'Team created successfully'
        })
    } catch (error) {
        console.error('Error creating team:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// Get all teams for a user
export const getUserTeams = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        const teams = await Team.find({
            'members.user': new mongoose.Types.ObjectId(userId)
        })
        .populate('members.user', 'name email profileImage')
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })

        res.json({
            success: true,
            teams,
            totalCount: teams.length
        })
    } catch (error) {
        console.error('Error fetching user teams:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// Get all teams (for project assignment)
export const getAllTeams = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        const teams = await Team.find({})
        .populate('members.user', 'name email profileImage')
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })

        res.json({
            success: true,
            data: teams,
            teams: teams, // Keep both for compatibility
            totalCount: teams.length
        })
    } catch (error) {
        console.error('Error fetching all teams:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// Get team by ID
export const getTeamById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { teamId } = req.params
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            res.status(400).json({ error: 'Invalid team ID' })
            return
        }

        const team = await Team.findById(teamId)
            .populate('members.user', 'name email profileImage role')
            .populate('createdBy', 'name email')
            .populate('projects', 'title description')

        if (!team) {
            res.status(404).json({ error: 'Team not found' })
            return
        }

        // Check if user is a member of the team
        if (!team.isMember(new mongoose.Types.ObjectId(userId))) {
            res.status(403).json({ error: 'Access denied. You are not a member of this team.' })
            return
        }

        res.json({
            success: true,
            team
        })
    } catch (error) {
        console.error('Error fetching team:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// Update team details
export const updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { teamId } = req.params
        const { name, description, members } = req.body
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            res.status(400).json({ error: 'Invalid team ID' })
            return
        }

        const team = await Team.findById(teamId)
        if (!team) {
            res.status(404).json({ error: 'Team not found' })
            return
        }

        // Check if user is team lead or creator
        const userObjectId = new mongoose.Types.ObjectId(userId)
        if (!team.isTeamLead(userObjectId) && team.createdBy.toString() !== userId) {
            res.status(403).json({ error: 'Access denied. Only team leads can update team details.' })
            return
        }

        // Check if new name conflicts with existing teams
        if (name && name.trim() !== team.name) {
            const existingTeam = await Team.findOne({
                name: name.trim(),
                _id: { $ne: teamId }
            })
            if (existingTeam) {
                res.status(409).json({ error: 'Team name already exists' })
                return
            }
        }

        // Update team details
        if (name) team.name = name.trim()
        if (description !== undefined) team.description = description?.trim()

        // Update members if provided
        if (members && Array.isArray(members)) {
            // Validate all user IDs exist
            for (const member of members) {
                if (!mongoose.Types.ObjectId.isValid(member.userId)) {
                    res.status(400).json({ error: `Invalid user ID: ${member.userId}` })
                    return
                }

                const user = await User.findById(member.userId)
                if (!user) {
                    res.status(404).json({ error: `User not found: ${member.userId}` })
                    return
                }
            }

            // Ensure team creator is always included and is a lead
            const creatorId = team.createdBy.toString()
            let creatorIncluded = false

            // Build new members array
            const newMembers = members.map(member => {
                const memberId = member.userId.toString()

                // If this is the creator, ensure they're a lead
                if (memberId === creatorId) {
                    creatorIncluded = true
                    return {
                        user: new mongoose.Types.ObjectId(member.userId),
                        isLead: true, // Creator must always be a lead
                        joinedAt: team.members.find((m: any) => m.user.toString() === memberId)?.joinedAt || new Date()
                    }
                }

                return {
                    user: new mongoose.Types.ObjectId(member.userId),
                    isLead: member.isLead || false,
                    joinedAt: team.members.find((m: any) => m.user.toString() === memberId)?.joinedAt || new Date()
                }
            })

            // If creator wasn't included, add them as a lead
            if (!creatorIncluded) {
                newMembers.push({
                    user: new mongoose.Types.ObjectId(creatorId),
                    isLead: true,
                    joinedAt: team.members.find((m: any) => m.user.toString() === creatorId)?.joinedAt || new Date()
                })
            }

            team.members = newMembers
        }

        await team.save()

        // Populate the updated team
        await team.populate('members.user', 'name email profileImage')
        await team.populate('createdBy', 'name email')

        res.json({
            success: true,
            team,
            message: 'Team updated successfully'
        })
    } catch (error) {
        console.error('Error updating team:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// Add member to team
export const addTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { teamId } = req.params
        const { userId: newMemberId, isLead = false } = req.body
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(newMemberId)) {
            res.status(400).json({ error: 'Invalid team or user ID' })
            return
        }

        const team = await Team.findById(teamId)
        if (!team) {
            res.status(404).json({ error: 'Team not found' })
            return
        }

        // Check if current user is team lead or creator
        const userObjectId = new mongoose.Types.ObjectId(userId)
        if (!team.isTeamLead(userObjectId) && team.createdBy.toString() !== userId) {
            res.status(403).json({ error: 'Access denied. Only team leads can add members.' })
            return
        }

        // Check if new user exists
        const newUser = await User.findById(newMemberId)
        if (!newUser) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        // Add member to team
        await team.addMember(new mongoose.Types.ObjectId(newMemberId), isLead)

        // Populate the updated team
        await team.populate('members.user', 'name email profileImage')

        res.json({
            success: true,
            team,
            message: 'Member added successfully'
        })
    } catch (error) {
        console.error('Error adding team member:', error)
        if (error instanceof Error && error.message.includes('already a member')) {
            res.status(409).json({ error: error.message })
        } else {
            res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }
}

// Remove member from team
export const removeTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { teamId, memberId } = req.params
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(memberId)) {
            res.status(400).json({ error: 'Invalid team or user ID' })
            return
        }

        const team = await Team.findById(teamId)
        if (!team) {
            res.status(404).json({ error: 'Team not found' })
            return
        }

        // Check if current user is team lead or creator
        const userObjectId = new mongoose.Types.ObjectId(userId)
        if (!team.isTeamLead(userObjectId) && team.createdBy.toString() !== userId) {
            res.status(403).json({ error: 'Access denied. Only team leads can remove members.' })
            return
        }

        // Don't allow removing the creator
        if (team.createdBy.toString() === memberId) {
            res.status(400).json({ error: 'Cannot remove team creator' })
            return
        }

        // Remove member from team
        await team.removeMember(new mongoose.Types.ObjectId(memberId))

        // Populate the updated team
        await team.populate('members.user', 'name email profileImage')

        res.json({
            success: true,
            team,
            message: 'Member removed successfully'
        })
    } catch (error) {
        console.error('Error removing team member:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// Update member role
export const updateMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { teamId, memberId } = req.params
        const { isLead } = req.body
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(memberId)) {
            res.status(400).json({ error: 'Invalid team or user ID' })
            return
        }

        const team = await Team.findById(teamId)
        if (!team) {
            res.status(404).json({ error: 'Team not found' })
            return
        }

        // Check if current user is team lead or creator
        const userObjectId = new mongoose.Types.ObjectId(userId)
        if (!team.isTeamLead(userObjectId) && team.createdBy.toString() !== userId) {
            res.status(403).json({ error: 'Access denied. Only team leads can update member roles.' })
            return
        }

        // Update member role
        await team.updateMemberRole(new mongoose.Types.ObjectId(memberId), isLead)

        // Populate the updated team
        await team.populate('members.user', 'name email profileImage')

        res.json({
            success: true,
            team,
            message: 'Member role updated successfully'
        })
    } catch (error) {
        console.error('Error updating member role:', error)
        if (error instanceof Error && error.message.includes('not a member')) {
            res.status(404).json({ error: error.message })
        } else {
            res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }
}

// Delete team
export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { teamId } = req.params
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            res.status(400).json({ error: 'Invalid team ID' })
            return
        }

        const team = await Team.findById(teamId)
        if (!team) {
            res.status(404).json({ error: 'Team not found' })
            return
        }

        // Only creator can delete team
        if (team.createdBy.toString() !== userId) {
            res.status(403).json({ error: 'Access denied. Only team creator can delete the team.' })
            return
        }

        await Team.findByIdAndDelete(teamId)

        res.json({
            success: true,
            message: 'Team deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting team:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// Get team statistics
export const getTeamStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' })
            return
        }

        // Get teams where user is a member
        const userTeams = await Team.find({
            'members.user': new mongoose.Types.ObjectId(userId)
        })

        // Get teams where user is a lead
        const leadTeams = await Team.find({
            'members': {
                $elemMatch: {
                    'user': new mongoose.Types.ObjectId(userId),
                    'isLead': true
                }
            }
        })

        // Get total unique members across all user's teams
        const allMemberIds = new Set()
        userTeams.forEach((team: any) => {
            team.members.forEach((member: any) => {
                allMemberIds.add(member.user.toString())
            })
        })

        const stats = {
            totalTeams: userTeams.length,
            teamsAsLead: leadTeams.length,
            totalMembers: allMemberIds.size,
            averageTeamSize: userTeams.length > 0
                ? Math.round(Array.from(allMemberIds).length / userTeams.length)
                : 0
        }

        res.json({
            success: true,
            stats
        })
    } catch (error) {
        console.error('Error fetching team stats:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}