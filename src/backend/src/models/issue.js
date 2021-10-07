// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Populate = require('../util/autopopulate');

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
    delegated: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      default: "Åpen",
      required: false,
    },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    description: String,
    category: String,
    environment: String,
    browser: String,
    reproduce: String,
    severity: String,
    priority: String,
    reporter: { type: Schema.Types.ObjectId, ref: "User" },
    step_reproduce: String,
    summary: String,
    assigned: { type: Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    additional_info: String,
    userid: Schema.Types.ObjectId,
    imageName: {
      type: String,
      default: "none",
      required: false,
    },
  },
  { timestamps: true }
);

DataSchema
  .pre('findOne', Populate('author'))
  .pre('find', Populate('author'));

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Data", DataSchema);