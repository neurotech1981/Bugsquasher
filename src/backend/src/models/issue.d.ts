import { Document } from 'mongoose'

export interface IIssue extends Document {
    name: string
    delegated: string
    reporter: string
    description: string
    category: string
    environment: string
    step_reproduce: string
    summary: string
    browser: string
    visual: string
    reproduce: string
    severity: string
    priority: string
    userid: string
    project: string
    status?: string
    imageName?: Array<{ path: string }>
    createdAt: Date
    updatedAt: Date
}

declare const Issue: import('mongoose').Model<IIssue>
export default Issue