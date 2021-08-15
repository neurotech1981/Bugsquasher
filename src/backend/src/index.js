/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// import dependencies
import userRoutes from "./routes/user";
import authRoutes from "./routes/auth";
import config from "../config/index";
const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
var Data = require("./models/data");
const User = require("./models/user");
const path = require("path");
const logger = require("morgan");
const moment = require("moment");
const multer = require("multer");
var multipart = require("connect-multiparty");
const cookieParser = require("cookie-parser");
const AccessControl = require("accesscontrol");
const rateLimit = require("express-rate-limit");
import jwt from "jsonwebtoken";
const csrf = require("csurf");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

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
    cb(null, file.originalname);
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

const validateInput = require("../../validation/input-validation");

// Use the Data object (data) to find all Data records
Data.find(Data);
// connects our back end code with the database
const URI = config.mongoURI;
try {
  mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
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

module.exports = {
  UserAccount: require("../src/models/user"),
  RefreshToken: require("../src/accounts/refresh-tokens"),
  isValidId,
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// define the Express app
const app = express();
const ProtectedRoutes = express.Router();

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

  if (token === undefined) {
    token = req.body.token;
  }

  console.log(token);
  // decode token
  if (token) {
    // verifies secret and checks if the token is expired
    try {
      jwt.verify(token, app.get("jwtSecret"), (err, decoded) => {
        if (err) {
          return res.json({ message: "invalid token" });
        } else {
          // if everything is good, save to request for use in other routes
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
  console.log("Inside countIssue", req.body);
  await Data.countDocuments({}, function (err, result) {
    if (err) {
      res.send(err);
      next();
    } else {
      res.json(result);
      next();
    }
  });
});

// Find 5 latest issues.
ProtectedRoutes.route("/getLatestCases").get(async function (req, res, next) {
  console.log("Inside getLatestCases");
  await Data.find({})
    .select(["createdAt", "summary", "priority", "severity"])
    .sort({ createdAt: -1 })
    .limit(5)
    .exec(function (err, result) {
      if (err) {
        console.log(err);
        res.send(err);
        next();
      } else {
        res.json(result);
        next();
      }
    });
});

ProtectedRoutes.route("/getTodaysIssues").get(async function (req, res, next) {
  var yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

  await Data.countDocuments(
    { createdAt: { $gte: yesterday } },
    function (err, result) {
      if (err) {
        res.send(err);
        next();
      } else {
        res.json(result);
        next();
      }
    }
  );
});

ProtectedRoutes.route("/countSolvedIssues").get(async function (
  req,
  res,
  next
) {
  await Data.countDocuments({ status: "Løst" }, function (err, result) {
    if (err) {
      res.send(err);
      next();
    } else {
      res.json(result);
      next();
    }
  });
});

ProtectedRoutes.route("/thisWeekIssuesCount").get(async function (
  req,
  res,
  next
) {
  console.log("Inside thisWeekIssuesCount");

  // Work out days for start of tomorrow and one week before
  const oneDay = 1000 * 60 * 60 * 24,
    oneWeek = oneDay * 7;

  let d = Date.now();
  let lastDay = d - (d % oneDay) + oneDay;
  let firstDay = lastDay - oneWeek;

  var start = moment().startOf("week").format(); // set to 12:00 am today
  var end = moment().endOf("week").format(); // set to 23:59 pm today

  await Data.aggregate(
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
  next
) {
  console.log("Inside thisYearIssuesCount");

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

  //var start = moment().subtract(12, 'months').format();
  //var end = moment().format();
  var start = moment().startOf("year").format(); // set to 12:00 am today
  var end = moment().endOf("year").format(); // set to 23:59 pm today
  console.log(end + " : " + start);
  //let end = "2021-07-06T23:59:59"
  //let start = "2019-04-07T00:00:00"

  await Data.aggregate(
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
  next
) {
  console.log("Inside weekday issue count");
  // Work out days for start of tomorrow and one week before
  const oneDay = 1000 * 60 * 60 * 24,
    oneWeek = oneDay * 7;

  let d = Date.now();
  let lastDay = d - (d % oneDay) + oneDay;
  let firstDay = lastDay - oneWeek;

  const FIRST_DAY = 1;
  const LAST_DAY = 8;
  const daysArray = ["Man", "Tirs", "Ons", "Tors", "Fre", "Lør", "Søn"];

  //var start = moment().subtract(12, 'months').format();
  //var end = moment().format();
  var start = moment().startOf("isoweek").format(); // set to 12:00 am today
  var end = moment().endOf("isoweek").format(); // set to 23:59 pm today
  console.log(end + " : " + start);
  //let end = "2021-07-06T23:59:59"
  //let start = "2019-04-07T00:00:00"

  await Data.aggregate(
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
          _id: { year_day: { $substrCP: ["$createdAt", 0, 24] } },
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
                      9,
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
              { $add: [LAST_DAY, 0] },
            ],
          },
          months2: {
            $range: [
              FIRST_DAY,
              { $add: [{ $toInt: { $substrCP: [end, 5, 2] } }, 0] },
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
                          $arrayElemAt: [daysArray, { $subtract: ["$$m1", 7] }],
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
        console.log("Inside weekday123 issue count error");

        res.send(err.message);
      } else {
        console.log(
          "Inside weekday123 issue count result " + JSON.stringify(result)
        );

        res.json(result);
      }
    }
  );
});

ProtectedRoutes.route("/dailyIssueCount").get(async function (req, res, next) {
  console.log("Inside weekday issue count");
  // Work out days for start of tomorrow and one week before
  const oneDay = 1000 * 60 * 60 * 24,
    oneWeek = oneDay * 7;

  let d = Date.now();
  let lastDay = d - (d % oneDay) + oneDay;
  let firstDay = lastDay - oneWeek;

  const FIRST_DAY = 0;
  const LAST_DAY = 8;
  const daysArray = [
    "00:00",
    "03:00",
    "06:00",
    "09:00",
    "12:00",
    "15:00",
    "18:00",
    "21:00",
    "23:59",
  ];

  //var start = moment().subtract(12, 'months').format();
  //var end = moment().format();
  var start = moment().startOf("day").format(); // set to 12:00 am today
  var end = moment().endOf("day").format(); // set to 23:59 pm today
  console.log(end + " : " + start);
  //let end = "2021-07-06T23:59:59"
  //let start = "2019-04-07T00:00:00"

  await Data.aggregate(
    [
      {
        $match: {
          updatedAt: {
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
                  daysArray,
                  {
                    $subtract: [
                      { $toInt: { $substrCP: ["$_id.year_day", 11, 2] } },
                      25,
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
              { $add: [LAST_DAY, 1] },
            ],
          },
          months2: {
            $range: [
              FIRST_DAY,
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
                          $arrayElemAt: [daysArray, { $subtract: ["$$m1", 4] }],
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
                          $arrayElemAt: [daysArray, { $subtract: ["$$m2", 4] }],
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
        console.log("Inside weekday issue count error");
        res.send(err.message);
      } else {
        console.log("Inside weekday issue count result");
        console.log(result);
        res.json(result);
      }
    }
  );
});

ProtectedRoutes.route("/countOpenIssues").get(async function (req, res, next) {
  await Data.countDocuments({ status: "Åpen" }, function (err, result) {
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
  await Data.find((err, data) => {
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
  console.log("BODY REQ ISSUE UPDATE: ", req.params);
  await Data.findByIdAndUpdate(
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
  next();
});

ProtectedRoutes.post("/upDateIssue/:id", async function (req, res, next) {
  console.log("Inside Update Issue", req.body);
  const { dataset } = req.body;
  await Data.findByIdAndUpdate(
    { _id: req.params.id },
    dataset,
    function (err, data) {
      if (err) return next(err);
      return res.json({
        success: true,
        data: data,
      });
    }
  );
  next();
});

ProtectedRoutes.route("/getDataByID/:id").get(async function (req, res, next) {
  console.log("Inside getDataByID: ", req.params.id);
  await Data.findById(req.params.id, function (err, post) {
    if (err) return res.json(err);
    return res.json({
      success: true,
      data: post,
    });
  });
  next();
});

// this is our old update method
// this method overwrites existing data in our database
ProtectedRoutes.route("/edituser/:id").post(async function (req, res, next) {
  console.log("Inside Edit User", req);
  const { id } = req.params;
  const { role, update } = req.body.data;
  const permission = ac.can(role).readAny("editusers");
  if (permission.granted) {
    User.findByIdAndUpdate(
      { _id: { $eq: id } },
      req.body.data.update,
      (err) => {
        if (err || !update) return res.status(400).json(err);
        // filter data by permission attributes and send.
        res.json(permission.filter(update));
      }
    );
  } else {
    // resource is forbidden for this user/role
    res.status(403).end();
  }
});

ProtectedRoutes.route("/removeUser/:id").post(async function (req, res) {
  const { id } = req.params;
  console.log("Inside removeUser ", id);
  User.findByIdAndRemove({ _id: { $eq: id } }, (err) => {
    if (err) return res.send(err);
    return res.json({
      success: true,
    });
  });
});

// this is our delete method
// this method removes existing data in our database
ProtectedRoutes.get("/deleteIssueByID/:id", async function (req, res, next) {
  const { id } = req.params;
  console.log("In delete function>>>>>>> ", id);
  Data.findByIdAndDelete(id, (err) => {
    if (err) return res.send(err);
    return res.json({
      success: true,
    });
  });
});

// this is our create method
// this method adds new data in our database
ProtectedRoutes.post("/putData", async function (req, res) {
  const { errors, isValid } = validateInput(req.body.data);
  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  const data = new Data();
  //data.id = req.body.id;
  data.name = req.body.data.name;
  data.delegated = req.body.data.delegated;
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
  data.additional_info = req.body.data.additional_info;
  data.userid = req.body.data.userid;
  data.imageName = req.body.data.imageName;

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
  next();
});

// api routes
app.use("/accounts", require("./accounts/account.controller"));

// append /api for our http requests
app.use("/api", ProtectedRoutes);

// start the server
app.listen(API_PORT, () => {
  console.log(`LISTENING ON PORT ${API_PORT}`);
});