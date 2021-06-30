// /backend/data.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// {
//        type: String,
//        trim: true,
//	      required: 'Navn påkrevd'
//      },
// this will be our data base's data structure
const CommentSchema = new Schema(
  {
    issueID: String,
    creatorID: String,
    name: String,
    email: String,
    body: String,
  },
  { timestamps: true }
)

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model('Comments', CommentSchema)
