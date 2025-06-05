// /backend/data.js
import mongoose from 'mongoose'
const Schema = mongoose.Schema
import Populate from '../util/autopopulate.js'
//const Schema = _Schema;
// {
//        type: String,
//        trim: true,
//	      required: 'Navn påkrevd'
//      },
// this will be our data base's data structure
var CommentsSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        comments: [{ type: Schema.Types.ObjectId, autopopulate: true, ref: 'Comment' }],
        // Voting system
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        votes: [{
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            voteType: { type: String, enum: ['like', 'dislike'] },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true }
)

// Always populate the author field and comment field
CommentsSchema.pre('findOne', Populate('author', ['name', 'email']))
    .pre('find', Populate('author', ['name', 'email']))
    .pre('findOne', Populate('comments', ['content', 'author', 'comments']))
    .pre('find', Populate('comments', ['content', 'author', 'comments']))

// export the new Schema so we could modify it using Node.js
//module.exports = mongoose.model('Comment', CommentsSchema)
export default mongoose.model('Comment', CommentsSchema)
