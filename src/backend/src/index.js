/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// import dependencies
import jwt from "jsonwebtoken";
import userRoutes from "./routes/user.js";
import authRoutes from "./routes/auth.js";
import validateInput from "../../validation/input-validation.mjs";
import validateCommentInput from "../../validation/comment-validation.js";
import config from "../config/index.js";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import Data from "./models/issue.js";
import User from "./models/user.js";
import Comments from "./models/comment.js";
import path from "path";
import logger from "morgan";
import moment from "moment";
import multer from "multer";
import multipart from "connect-multiparty";
import cookieParser from "cookie-parser";
import AccessControl from "accesscontrol";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import AccountController from "./accounts/account.controller.js";
import OS from 'os';
import fs from 'fs';
import cluster from 'cluster';
import process from 'process';
import crypto from "crypto";

const totalCPUs = OS.cpus().length;
const uniqueID = crypto.randomBytes(16).toString("hex");



process.on('unhandledRejection', (rejectionErr) => {
  // Won't execute
  console.log('unhandledRejection Err::', rejectionErr);
  console.log('unhandledRejection Stack::', JSON.stringify(rejectionErr.stack));
});

process.on('uncaughtException', (uncaughtExc) => {
  console.log('uncaughtException Err::', uncaughtExc);
  console.log('uncaughtException Stack::', JSON.stringify(uncaughtExc.stack));
});

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

process.env.UV_THREADPOOL_SIZE = OS.cpus().length;

console.log("Threadpool size set to: ", OS.cpus().length);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// This is actually how the grants are maintained internally.
const grants = {
  Admin: {
    issues: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
    },
    editusers: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
    },
  },
  Bruker: {
    issues: {
      "create:own": ["*", "!views"],
      "read:own": ["*"],
      "update:own": ["*", "!views"],
      "delete:own": ["*"],
    },
    editusers: {
      "create:own": ["*", "!email", "!rights"],
      "read:own": ["*"],
      "update:own": ["*", "!role", "!email", "!rights"],
      "delete:own": ["*", "!email", "!rights"],
    },
  },
};

const ac = new AccessControl(grants);

var multipartMiddleware = multipart();

// Multer image storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../assets/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, uniqueID + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    // rejects storing a file
    cb(null, false);
  }
};

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // Set max size for upload ; Current is 20 Mb
  },
  fileFilter: fileFilter,
});

// MongoDB database
// const dbRoute =
const API_PORT = 3001;

// Use the Data object (data) to find all Data records
Data.find(Data);
// connects our back end code with the database
const URI = config.mongoURI;
try {
  mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (error) {
  console.log(error);
}

const db = mongoose.connection;

db.once("open", function () {
  console.log("connected to the database");
});

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

mongoose.Promise = global.Promise;

//module.exports = {
//  UserAccount: require("../src/models/user.js"),
//  RefreshToken: require("../src/accounts/refresh-tokens.js"),
//  isValidId,
//};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });

} else {

// define the Express app
const app = express();
console.log(`Worker ${process.pid} started`);
const ProtectedRoutes = express.Router();

app.set('view engine', 'ejs');

app.use(cookieParser());
//app.use(csrf({ cookie: true }));
//set secret
app.set("jwtSecret", config.jwtSecret);
// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
//  apply limiter to all requests
app.use(
  limiter,
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
  })
);
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use("/uploads", express.static("../assets/uploads"));
// Redirect to react build
let __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../build")));
app.get("/", function (req, res, next) {
  res.sendFile(path.resolve("../build/index.html"));
});
// enhance your app security with Helmet
app.use(helmet());
// Middleware
app.use(express.json());
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }));
// enable all CORS requests
app.use(cors());
app.use(express.static(__dirname + "/public/")); //Don't forget me :(

// log HTTP requests
app.use(morgan("combined"));

// ADD routes
app.use("/", userRoutes);
app.use("/", authRoutes);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ":" + err.message });
  }
});

ProtectedRoutes.use((req, res, next) => {
  // check header for the token
  //console.log("ProtectedRoutes headers: ", req.headers)
  var token = req.headers.authorization;
  console.log("Checking token...", token);

  if (token === undefined) {
    token = req.body.token;
    console.log("Retrying...Checking token...", token);
  }

  if (token === undefined) {
    token = req.body.headers.Authorization;
    console.log("Retrying...Checking token...", token);
  }

  // decode token
  if (token) {
    // verifies secret and checks if the token is expired
    try {
      jwt.verify(token, app.get("jwtSecret"), (err, decoded) => {
        if (err) {
          console.log("Invalid token")
          return res.json({ message: "invalid token" });
        } else {
          // if everything is good, save to request for use in other routes
          console.log("Token was accepted...");
          req.decoded = decoded;
          next();
        }
      });
    } catch (err) {
      console.log("An error occured: ", err);
    }
  } else {
    // if there is no token
    res.send({
      message: "No token provided.",
    });
  }
});

ProtectedRoutes.route("/uploadimage", multipartMiddleware).post(
  upload.array("imageData", 12),
  function (req, res, next) {
    const file = req.files;
    if (!file) {
      const error = new Error("En feil oppstod");
      error.httpStatusCode = 400;
      return next(error);
    }
    res.send(file);
  }
);

// this is our count issues method
// this method count all issues in the data model
ProtectedRoutes.route("/countIssues").get(async function (req, res, next) {
  Data.countDocuments({}, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

// Find 5 latest issues.
ProtectedRoutes.route("/getLatestCases").get(async function (req, res, next) {
  Data.find({})
    .select(["createdAt", "summary", "priority", "severity"])
    .sort({ createdAt: -1 })
    .limit(5)
    .exec(function (err, result) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.json(result);
      }
    });
});

ProtectedRoutes.route("/getTodaysIssues").get(async function (req, res, next) {
  var yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

  Data.countDocuments(
    { createdAt: { $gte: yesterday } },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    }
  );
});

ProtectedRoutes.route("/countSolvedIssues").get(async function (
  req,
  res,
  next
) {
  Data.countDocuments({ status: "Løst" }, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

ProtectedRoutes.route("/thisWeekIssuesCount").get(async function (
  req,
  res,
  next
) {

  // Work out days for start of tomorrow and one week before
  const oneDay = 1000 * 60 * 60 * 24,
    oneWeek = oneDay * 7;

  let d = Date.now();
  let lastDay = d - (d % oneDay) + oneDay;
  let firstDay = lastDay - oneWeek;

  var start = moment().startOf("week").format(); // set to 12:00 am today
  var end = moment().endOf("week").format(); // set to 23:59 pm today

  Data.aggregate(
    [
      {
        $match: {
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
        // Your matching logic
      },
      /* Now grouping users based on _id or id parameter for each day
     from the above match results.

     $createdAt can be replaced by date property present in your database.
     */
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ],
    function (err, result) {
      // results in here
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    }
  );
});

ProtectedRoutes.route("/thisYearIssuesCount").get(async function (
  req,
  res,
) {
  // Work out days for start of tomorrow and one week before
  const oneDay = 1000 * 60 * 60 * 24,
    oneWeek = oneDay * 7;

  let d = Date.now();
  let lastDay = d - (d % oneDay) + oneDay;
  let firstDay = lastDay - oneWeek;

  const FIRST_MONTH = 1;
  const LAST_MONTH = 12;
  const monthsArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  var start = moment().startOf("year").format(); // set to 12:00 am today
  var end = moment().endOf("year").format(); // set to 23:59 pm today

  Data.aggregate(
    [
      {
        $match: {
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
        // Your matching logic
      },
      /* Now grouping users based on _id or id parameter for each day
     from the above match results.

     $createdAt can be replaced by date property present in your database.
     */
      {
        $group: {
          /*_id : {
                   month: { $month: "$createdAt" },
                   year: { $year: "$createdAt" } },
                   count : {$sum : 1}
           }*/
          _id: { year_month: { $substrCP: ["$createdAt", 0, 24] } },
        },
      },
      {
        $sort: { "_id.year_month": 1 },
      },
      {
        $project: {
          _id: 0,
          count: { $sum: 1 },
          month_year: {
            $concat: [
              {
                $arrayElemAt: [
                  monthsArray,
                  {
                    $subtract: [
                      { $toInt: { $substrCP: ["$_id.year_month", 5, 2] } },
                      1,
                    ],
                  },
                ],
              },
              "-",
              { $substrCP: ["$_id.year_month", 0, 4] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { k: "$month_year", v: "$count" } },
        },
      },
      {
        $addFields: {
          start_year: { $substrCP: [start, 0, 4] },
          end_year: { $substrCP: [end, 0, 4] },
          months1: {
            $range: [
              { $toInt: { $substrCP: [start, 5, 2] } },
              { $add: [LAST_MONTH, 1] },
            ],
          },
          months2: {
            $range: [
              FIRST_MONTH,
              { $add: [{ $toInt: { $substrCP: [end, 5, 2] } }, 1] },
            ],
          },
        },
      },
      {
        $addFields: {
          template_data: {
            $concatArrays: [
              {
                $map: {
                  input: "$months1",
                  as: "m1",
                  in: {
                    count: 0,
                    month_year: {
                      $concat: [
                        {
                          $arrayElemAt: [
                            monthsArray,
                            { $subtract: ["$$m1", 1] },
                          ],
                        },
                        "-",
                        "$start_year",
                      ],
                    },
                  },
                },
              },
              {
                $map: {
                  input: "$months2",
                  as: "m2",
                  in: {
                    count: 0,
                    month_year: {
                      $concat: [
                        {
                          $arrayElemAt: [
                            monthsArray,
                            { $subtract: ["$$m2", 1] },
                          ],
                        },
                        "-",
                        "$end_year",
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          data: {
            $map: {
              input: "$template_data",
              as: "t",
              in: {
                k: "$$t.month_year",
                v: {
                  $reduce: {
                    input: "$data",
                    initialValue: 0,
                    in: {
                      $cond: [
                        { $eq: ["$$t.month_year", "$$this.k"] },
                        { $add: ["$$this.v", "$$value"] },
                        { $add: [0, "$$value"] },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          data: { $arrayToObject: "$data" },
          _id: 0,
        },
      },
    ],
    function (err, result) {
      // results in here
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    }
  );
});

ProtectedRoutes.route("/weekdayIssueCount").get(async function (
  req,
  res,
) {

  const FIRST_DAY = 1;
  const LAST_DAY = 8;
  const daysArray = ["Man", "Tirs", "Ons", "Tors", "Fre", "Lør", "Søn"];
  //var start = moment().subtract(12, 'months').format();
  //var end = moment().format();
  var start = moment().startOf("isoweek").format(); // set to 12:00 am start of week
  var end = moment().endOf("isoweek").format(); // set to 23:59 pm end of week
  var today = new Date()
  console.log("Weekly count : ", start + "<< >>", end);
  Data.aggregate(
    [
      {
        $match: {
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
        // Your matching logic
      },
      /* Now grouping users based on _id or id parameter for each day
       from the above match results.
       $createdAt can be replaced by date property present in your database.
       */
      {
        $group: {
          _id: { year_day: { $substrCP: ["$createdAt", 0, 24] } },
          count: { $sum: -1 }
        },
      },
      {
        $sort: { "_id.year_day": 1 },
      },
      {
        $project: {
          _id: 0,
          count: { $sum: 1 },
          day_year: {
            $concat: [
              {
                $arrayElemAt: [
                  daysArray,
                  {
                    $subtract: [
                      { $toInt: { $substrCP: ["$_id.year_day", 8, 2] } },
                      11,
                    ],
                  },
                ],
              },
              "-",
              { $substrCP: ["$_id.year_day", 0, 4] },
            ],
          },
        },
      },
      {
        $group: {
          _id: 0,
          data: { $push: { k: "$day_year", v: "$count" } },
        },
      },
      {
        $addFields: {
          start_week: { $substrCP: [start, 0, 4] },
          end_week: { $substrCP: [end, 0, 4] },
          months1: {
            $range: [
              LAST_DAY,
              { $add: [{ $toInt: { $substrCP: [end, 5, 2] } }, 4] },
            ],
          },
          months2: {
            $range: [
              FIRST_DAY,
              { $add: [{ $toInt: { $substrCP: [start, 5, 2] } }, 4] },
            ],
          },
        },
      },
      {
        $addFields: {
          template_data: {
            $concatArrays: [
              {
                $map: {
                  input: "$months1",
                  as: "m1",
                  in: {
                    count: 0,
                    day_year: {
                      $concat: [
                        {
                          $arrayElemAt: [daysArray, { $subtract: ["$$m1", 1] }],
                        },
                        "-",
                        "$start_week",
                      ],
                    },
                  },
                },
              },
              {
                $map: {
                  input: "$months2",
                  as: "m2",
                  in: {
                    count: 0,
                    day_year: {
                      $concat: [
                        {
                          $arrayElemAt: [daysArray, { $subtract: ["$$m2", 1] }],
                        },
                        "-",
                        "$end_week",
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          data: {
            $map: {
              input: "$template_data",
              as: "t",
              in: {
                k: "$$t.day_year",
                v: {
                  $reduce: {
                    input: "$data",
                    initialValue: 0,
                    in: {
                      $cond: [
                        { $eq: ["$$t.day_year", "$$this.k"] },
                        { $add: ["$$this.v", "$$value"] },
                        { $add: [0, "$$value"] },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          data: { $arrayToObject: "$data" },
          _id: 0,
        },
      },
    ],
    function (err, result) {
      // results in here
      if (err) {
        console.log("Weekly issues Error >>>>", err.message);
        res.send(err.message);
      } else {
        console.log("Weekly issues >>>>", result);
        res.json(result);
      }
    }
  );
});

ProtectedRoutes.route("/dailyIssueCount").get(async function (req, res) {
  // Work out days for start of tomorrow and one week before
  const oneDay = 1000 * 60 * 60 * 24,
  oneWeek = oneDay * 7;

  let d = Date.now();
  let lastDay = d - (d % oneDay) + oneDay;
  let firstDay = lastDay - oneWeek;

  const FIRST_HOUR = 0;
  const LAST_HOUR = 24;
  const hoursArray = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:59",
  ];

  var start = moment().startOf("day").format(); // set to  00:00 am today
  var end = moment().endOf("day").format(); // set to 23:59 pm today

  console.log("24 hour solved count: ",start + " <:> " + end)

  Data.aggregate(
    [
      {
        $match: {
          updatedAt: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
          status: { $eq: "Løst" },
        },
        // Your matching logic
      },
      /* Now grouping users based on _id or id parameter for each day
       from the above match results.

       $createdAt can be replaced by date property present in your database.
       */
      {
        $group: {
          _id: { year_day: { $substrCP: ["$updatedAt", 0, 24] } },
        },
      },
      {
        $sort: { "_id.year_day": 1 },
      },
      {
        $project: {
          _id: 0,
          count: { $sum: 1 },
          day_year: {
            $concat: [
              {
                $arrayElemAt: [
                  hoursArray,
                  {
                    $subtract: [
                      { $toInt: { $substrCP: ["$_id.year_day", 11, 2] } },
                      22,
                    ],
                  },
                ],
              },
              "-",
              { $substrCP: ["$_id.year_day", 0, 4] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { k: "$day_year", v: "$count" } },
        },
      },
      {
        $addFields: {
          start_week: { $substrCP: [start, 0, 4] },
          end_week: { $substrCP: [end, 0, 4] },
          months1: {
            $range: [
              { $toInt: { $substrCP: [start, 5, 2] } },
              { $add: [LAST_HOUR, 1] },
            ],
          },
          months2: {
            $range: [
              FIRST_HOUR,
              { $add: [{ $toInt: { $substrCP: [end, 5, 2] } }, 1] },
            ],
          },
        },
      },
      {
        $addFields: {
          template_data: {
            $concatArrays: [
              {
                $map: {
                  input: "$months1",
                  as: "m1",
                  in: {
                    count: 0,
                    day_year: {
                      $concat: [
                        {
                          $arrayElemAt: [hoursArray, { $subtract: ["$$m1", 4] }],
                        },
                        "-",
                        "$start_week",
                      ],
                    },
                  },
                },
              },
              {
                $map: {
                  input: "$months2",
                  as: "m2",
                  in: {
                    count: 0,
                    day_year: {
                      $concat: [
                        {
                          $arrayElemAt: [hoursArray, { $subtract: ["$$m2", 4] }],
                        },
                        "-",
                        "$end_week",
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          data: {
            $map: {
              input: "$template_data",
              as: "t",
              in: {
                k: "$$t.day_year",
                v: {
                  $reduce: {
                    input: "$data",
                    initialValue: 0,
                    in: {
                      $cond: [
                        { $eq: ["$$t.day_year", "$$this.k"] },
                        { $add: ["$$this.v", "$$value"] },
                        { $add: [0, "$$value"] },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          data: { $arrayToObject: "$data" },
          _id: 0,
        },
      },
    ],
    function (err, result) {
      // results in here
      if (err) {
        res.send(err.message);
      } else {
        console.log("24 hour count: " + JSON.stringify(result));
        res.json(result);
      }
    }
  );
});

ProtectedRoutes.route("/countOpenIssues").get(async function (req, res) {
  Data.countDocuments({ status: "Åpen" }, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

// this is our get method
// this method fetches all available data in our database
ProtectedRoutes.route("/getData").get(async function (req, res, next) {
  Data.find((err, data) => {
    if (err) {
      return res.json({
        success: false,
        error: err,
      });
    }
    return res.json({
      success: true,
      data: data,
    });
  });
});

ProtectedRoutes.route("/upDateIssueStatus/:id/:status").get(async function (
  req,
  res,
  next
) {
  const { update } = req.body;
  Data.findByIdAndUpdate(
    { _id: req.params.id },
    { status: req.params.status },
    function (err, data) {
      if (err) return next(err);
      return res.json({
        success: true,
        data: data,
      });
    }
  );
});

ProtectedRoutes.route("/upDateDelegated/:id/:delegated").get(async function (
  req,
  res,
  next
) {
  const { update } = req.body;
  Data.findByIdAndUpdate(
    { _id: req.params.id },
    { delegated: req.params.delegated },
    function (err, data) {
      if (err) return next(err);
      return res.json({
        success: true,
        data: data,
      });
    }
  );
});

ProtectedRoutes.post("/upDateIssue/:id", async function (req, res, next) {
  const { dataset } = req.body;
  Data.findByIdAndUpdate({ _id: req.params.id }, dataset, function (err, data) {
    if (err) return next(err);
    return res.json({
      success: true,
      data: data,
    });
  });
});

ProtectedRoutes.route("/getIssueByID/:id").get(async function (req, res) {
  try {
  await Data.findOne({ _id: req.params.id })
    .populate([
      {
        path: "reporter",
        select:'name',
        model: "User",
      },
      {
        path: "delegated",
        select:'name',
        model: "User",
      },
    ])
    .exec()
    .then(response => {
      res.json({
        success: true,
        data: response,
      });
    })
  } catch(e) {
    // database error
    res.status(500).send("database error");
  }
});

// CREATE REPLY
ProtectedRoutes.route('/issue/:issueId/comments/:commentId/replies').post(async function (
  req,
  res,
  next
) {
  // TURN REPLY INTO A COMMENT OBJECT
  const reply = new Comments(req.body);

  reply.author = req.body.user;
  // LOOKUP THE PARENT POST
  Data.findById(req.params.issueId)
    .then((post) => {
      // FIND THE CHILD COMMENT
      console.log("POST: ", post);

      Promise.all([
        reply.save(),
        Comments.findById(req.params.commentId)
      ])
        .then(([reply, comment]) => {
          // ADD THE REPLY
          console.log("REPLY: ", reply);
          comment.comments.unshift(reply._id);
          return Promise.all([
            comment.save(),
          ]);
        })
        .then(response => res.json({
          success: true,
          data: response,
        }))
        .catch(console.error);
      // SAVE THE CHANGE TO THE PARENT DOCUMENT
      return post.save();
    });
});

// Create new reply to comment
ProtectedRoutes.route("/issue/:issueId/comments/:commentId/replies/new").post(async function (req, res) {
  const reply = new Comments(req);
  let index = req.body.reply.index;
  reply.author = req.body.reply.userID;
  reply.content = req.body.reply.content;

    let comments = [];

    Data.findById(req.params.commentId).lean()
    .then((issue) => {
      // FIND THE CHILD COMMENT
      Promise.all([
        reply.save(),
        Comments.findById(req.params.commentId),
      ])
        .then(([reply, comment]) => {
          // ADD THE REPLY
          comment.comments.splice(index, 0, reply);
          comments = comment;
          return Promise.all([
            comment.save(),
          ]);
        })
        .then((result) => {
          Promise.all([
            Data.findById(req.params.issueId).populate(
              {
                path: "comments",
              }),
          ]).then((result) => {
            return res.json({
              success: true,
              response: result
            });
          })
        })
        .catch(console.error);
    });
});

ProtectedRoutes.route("/get-comments/:id").get(async function (req, res) {
  const currentUser =  req.body.user;
  try {
  await Data.findById(req.params.id).populate(
  {
    path: "comments",
  })
    .lean()
    .then(response => {

      res.json({
        success: true,
        data: { response, currentUser },
      });
    })
  } catch(e) {
    // database error
    res.status(500).send("database error " + e);
  }
});


// this is our old update method
// this method overwrites existing data in our database
ProtectedRoutes.route("/edituser/:id").post(async function (req, res, next) {
  const { id } = req.params;
  const { role, update } = req.body;
  const permission = ac.can(role).readAny("editusers");
  if (permission.granted) {
    User.findByIdAndUpdate({ _id: id }, update, (err) => {
      if (err || !update) return res.status(400).json(err);
      // filter data by permission attributes and send.
      res.json(permission.filter(update));
    });
  } else {
    // resource is forbidden for this user/role
    res.status(403).end();
  }
});

ProtectedRoutes.route("/removeUser/:id").post(async function (req, res) {
  const { id } = req.params;
  User.findByIdAndRemove({ _id: id }, (err) => {
    if (err) return res.status(400).json(err);
    return res.json({
      success: true,
    });
  });
});

// this is our delete method
// this method removes existing data in our database
ProtectedRoutes.get("/deleteIssueByID/:id", async function (req, res, next) {
  const { id } = req.params;
  Data.findByIdAndDelete(id, (err, result) => {
    //delete image(s) when deleting an issue
    result.imageName.forEach((element) => {
        if(element.path) {
          fs.unlinkSync(path.join(__dirname, '..', '/assets/uploads/', element.path));
        }
    });
    if (err) return res.send(err);
    return res.json({
      success: true,
    });
  });
});

// this is our delete method
// this method removes existing data in our database
ProtectedRoutes.route("/delete-image/:id").post(async function (req, res, next) {
  const { image, name } = req.body;
  const { id } = req.params;

  Data.findByIdAndUpdate(
      { _id: id },
      { $pull: { imageName: { id: image} } },
      { new: true },
      (err, result) => {
        try {
          fs.unlinkSync(path.join(__dirname, '..', '/assets/uploads/', name));
        } catch (error) {
          return res.json({
            success: false,
            message: error
          });
        }
    if (err) return res.send(err);
    return res.json({
      success: true,
    });
  });
});

// this is our delete method
// this method removes existing data in our database
ProtectedRoutes.route("/delete-comment/:id").post(async function (req, res) {
  const { id } = req.params;
  const { commentId } = req.body;
  console.log("Delete comment", id, commentId);
  Data.findByIdAndUpdate(
    { _id: id },
    { $pullAll: { comments: [commentId] } },
    { new: true },
    (err, result) => {
      if (err) return res.send(err);
      return res.json({
        success: true,
        response: result,
      });
    }
  ).populate({
    path: "comments",
  });
});

// this is our delete method
// this method removes existing data in our database
ProtectedRoutes.route("/delete-reply/:id").post(async function (
  req,
  res,
) {
  const { id } = req.params;
  const { parentId, childId } = req.body;
  console.log("Delete reply", id, parentId);
  await Comments.findByIdAndUpdate(
    { _id: parentId },
    { $pullAll: { comments: [childId] } },
    { new: true }
  ).clone()
    .then((result) => {
      Promise.all([
        Data.findById(id).populate({
          path: "comments",
        }),
      ]).then((result) => {
        return res.json({
          success: true,
          response: result,
        });
      });
    })
    .catch(console.error);
});

// this is our delete method
// this method removes existing data in our database
ProtectedRoutes.route("/update-comment/:id").post(async function (req, res) {
  const { id } = req.params;
  const { commentId, newContent } = req.body.comment;
  console.log("New content", newContent, commentId, id);
  await Comments.findByIdAndUpdate(
    { _id: commentId }, newContent[0],
  )
    .clone()
    .then((result) => {
      Promise.all([
        Data.findById(id).populate({
          path: "comments",
        }),
      ]).then((result) => {
        return res.json({
          success: true,
          response: result,
        });
      });
    })
    .catch(console.error);
});

// this is our create method
// this method adds new data in our database
ProtectedRoutes.post("/new-issue", async function (req, res, uuid) {
  const { errors, isValid } = validateInput(req.body.data);
  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  let fileData = {
    path: "",
    id: "",
    preview: "",
  };

  let fileArray = [];

  const data = new Data();
  data.name = req.body.data.name;
  data.delegated = req.body.data.delegated;
  data.reporter = req.body.data.reporter_id;
  data.description = req.body.data.description;
  data.category = req.body.data.category;
  data.environment = req.body.data.environment;
  data.step_reproduce = req.body.data.step_reproduce;
  data.summary = req.body.data.summary;
  data.browser = req.body.data.browser;
  data.visual = req.body.data.visual;
  data.reproduce = req.body.data.reproduce;
  data.severity = req.body.data.severity;
  data.priority = req.body.data.priority;
  data.userid = req.body.data.userid;
  //console.log(Object.keys(req.body.data.imageName).length);


 /*if(req.body.data.imageName[1][0].name.length > 1) {
    req.body.data.imageName[1][0].name.forEach((element) => {
        fileData.id = element.id;
        fileData.path = element.path;
        fileData.preview = element.preview;
        fileArray.push(fileData);
        fileData = {
          path: "",
          id: "",
          preview: "",
        };
    });
    console.log(fileArray);
  }*/
  console.log("IMAGE ISSUE", JSON.stringify(req.body.data.imageName));

  if(req.body.data.imageName !== "none") {
    data.imageName = req.body.data.imageName[0].name.length > 1 ? req.body.data.imageName[0].name : "none";
  }
  data.save((err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err,
      });
    }
    return res.status(200).json({
      success: true,
      document: data,
    });
  });
});

// this is our add image to issue method
// this method adds new image(s) to existing issue
ProtectedRoutes.route("/issue/add-image").post(async function (req, res) {
  Data.updateOne({ _id: req.body.issueID }, {$push:{ imageName: req.body.name.fileArray }}, function(
    err,
    result
  ) {
    if (err) {
      res.json({
        success: false,
      });
    } else {
      res.json({
        success: true,
      });
    }
  });
});

// this is our create method
ProtectedRoutes.post("/issue/comments/:id", async function (req, res) {
 /*  const { errors, isValid } = validateCommentInput(req.body);
  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  } */
  const comment = new Comments(req.body);
  console.log("Inside new comment");
  comment
  .save()
  .then(() => Promise.all([
    Data.findById(req.params.id),
  ]))
  .then(([issue]) => {
    issue.comments.unshift(comment);
    return Promise.all([
      issue.save(),
    ]);
  })
  .then(response => {
    res.json({
      success: true,
      data: response,
    });
  })
  .catch((err) => {
    console.log(err);
  });

/*   comment.save((err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err,
      });
    }
    return res.status(200).json({
      success: true,
      document: comment,
    });
  }); */
});

// api routes
app.use("/accounts", AccountController);

// append /api for our http requests
app.use("/api", ProtectedRoutes);

// start the server
app.listen(API_PORT, () => {
  console.log(`Started server on =>`, '\x1b[33m' ,
              `http://localhost:${API_PORT}`,
              '\x1b[0m',
              `for Process ID =>`, '\x1b[44m',`${process.pid}`,'\x1b[0m');
});
}
