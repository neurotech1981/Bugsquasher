// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// {
//        type: String,
//        trim: true,
//	      required: 'Navn påkrevd'
//      },
// this will be our data base's data structure
const DataSchema = new Schema(
  {
    id: Number,
    name: String,
    delegated: String,
    status: {
      type: String,
      default: "Åpen",
      required: false,
    },
    description: String,
    category: String,
    environment: String,
    browser: String,
    reproduce: String,
    severity: String,
    priority: String,
    reporter: String,
    step_reproduce: String,
    summary: String,
    assigned: String,
    additional_info: String,
    userid: String,
    imageName: {
      type: String,
      default: "none",
      required: false,
    },
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Data", DataSchema);
