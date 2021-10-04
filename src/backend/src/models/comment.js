// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Populate = require('../util/autopopulate');
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
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
)

// Always populate the author field
CommentsSchema
  .pre('findOne', Populate('author'))
  .pre('find', Populate('author'))
  .pre('findOne', Populate('comments'))
  .pre('find', Populate('comments'));

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model('Comment', CommentsSchema)
