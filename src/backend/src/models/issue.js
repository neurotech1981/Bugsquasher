// /backend/data.js
import mongoose from 'mongoose'
const Schema = mongoose.Schema
import Populate from '../util/autopopulate.js'

// {
//        type: String,
//        trim: true,
//	      required: 'Navn påkrevd'
//      },
// this will be our data base's data structure
const DataSchema = new Schema(
    {
        id: Schema.Types.ObjectId,
        name: String,
        delegated: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            default: 'Åpen',
            required: false,
        },
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        description: { type: String, required: true },
        category: { type: String, required: true },
        environment: String,
        browser: String,
        reproduce: { type: String, required: true },
        severity: { type: String, required: true },
        priority: { type: String, required: true },
        reporter: { type: Schema.Types.ObjectId, ref: 'User' },
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
        step_reproduce: { type: String },
        summary: { type: String, required: true },
        assigned: { type: Schema.Types.ObjectId, ref: 'User' },
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
        userid: Schema.Types.ObjectId,
        imageName: [
            {
                type: Object,
                default: 'none',
                required: false,
            },
        ],
    },
    { timestamps: true }
)

DataSchema.pre('findOne', Populate('author')).pre('find', Populate('author'))

// export the new Schema so we could modify it using Node.js
//module.exports = mongoose.model("Data", DataSchema);
export default mongoose.model('Data', DataSchema)
