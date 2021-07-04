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
const multer = require("multer");
var multipart = require("connect-multiparty");
const cookieParser = require("cookie-parser");
const AccessControl = require("accesscontrol");
const rateLimit = require("express-rate-limit");
import jwt from 'jsonwebtoken';


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

//set secret
app.set('jwtSecret', config.jwtSecret);
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
app.use(cookieParser());
// enable all CORS requests
app.use(cors());
app.use(express.static(__dirname + '/public/')); //Don't forget me :(

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

ProtectedRoutes.use((req, res, next) =>{
  // check header for the token
  //console.log(req)
  var token = req.headers.authorization;
  if(token === undefined) {
    token = req.body.token;
  }

  // decode token
  if (token) {
    // verifies secret and checks if the token is expired
    jwt.verify(token, app.get('jwtSecret'), (err, decoded) =>{
      if (err) {
        return res.json({ message: 'invalid token' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token

    res.send({
        message: 'No token provided.'
    });

  }
});

ProtectedRoutes
  .route("/uploadimage", multipartMiddleware)
  .post(upload.array("imageData", 12), function (req, res, next) {
    const file = req.files;
    if (!file) {
      const error = new Error("Vennligst velg en fil å laste opp");
      error.httpStatusCode = 400;
      return next(error);
    }
    res.send(file);
  });


// this is our count issues method
// this method count all issues in the data model
ProtectedRoutes.route("/countIssues").get(async function (req, res, next) {
  console.log("Inside countIssue", req.body)
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
  console.log("Inside getLatestCases")
  await Data.find({}).select(["createdAt", "summary", "priority", "severity"]).sort({ createdAt: -1 }).limit(5).exec(
    function (err, result) {
      if (err) {
        console.log(err)
        res.send(err);
        next();
      } else {
        res.json(result);
        next();
      }
    }
  )
});

ProtectedRoutes.route("/getTodaysIssues").get(async function (req, res,next) {
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

ProtectedRoutes.route("/countSolvedIssues").get(async function (req, res, next) {
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
ProtectedRoutes.route("/getData").get(async function (req, res, next)  {
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
ProtectedRoutes.route("/upDateIssueStatus/:id").post(async function (req, res, next) {
  const { update } = req.body;
  console.log(update)
  console.log("BODY REQ ISSUE UPDATE: ", req.params.id);
  await Data.findByIdAndUpdate(
    { _id: req.params.id },
    { status: req.body.status },
    function (err, data) {
      if (err) return next(err);
      return res.json({
        success: true,
        data: update,
      });
    }
  );
  next();
});

ProtectedRoutes.route("/upDateIssue/:id").post(async function (req, res, next) {
  const { dataset } = req.body;
  await Data.findByIdAndUpdate({ _id: req.params.id }, dataset, function (err, data) {
    if (err) return next(err);
    return res.json({
      success: true,
      data: data,
    });
  });
  next();
});

ProtectedRoutes.route("/getDataByID/:id").get(async function (req, res, next) {
  console.log("Inside getDataByID: ", req.params.id)
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
ProtectedRoutes.route("/edituser").post(async function (req, res, next) {
  console.log("Inside Edit User", req)
  const { _id, role, update } = req.body.data;
  const permission = ac.can(role).readAny("editusers");
  if (permission.granted) {
    User.findByIdAndUpdate(_id, req.body.data.update, (err) => {
      if (err || !update) return res.status(400).json(err);
      // filter data by permission attributes and send.
      res.json(permission.filter(update));
    });
  } else {
    // resource is forbidden for this user/role
    res.status(403).end();
  }
});

ProtectedRoutes.route("/removeUser").post(async function(req, res) {
  const { _id } = req.body.data;
  console.log("Inside removeUser ", _id)
  User.findByIdAndRemove(_id, (err) => {
    if (err) return res.send(err);
    return res.json({
      success: true,
    });
  });
});

// this is our delete method
// this method removes existing data in our database
ProtectedRoutes.route("/deleteIssueByID/:id").get(async function (req, res, next) {
  console.log("In delete function", );
  const { id } = req.params;
  Data.findByIdAndDelete({_id: id}, (err) => {
    if (err) return res.send(err);
    return res.json({
      success: true,
    });
  });
});


// this is our create method
// this method adds new data in our database
ProtectedRoutes.post("/putData").get(async function (req, res) {
  const { errors, isValid } = validateInput(req.body);
  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  const data = new Data();
  //data.id = req.body.id;
  data.name = req.body.name;
  data.delegated = req.body.delegated;
  data.description = req.body.description;
  data.category = req.body.category;
  data.environment = req.body.environment;
  data.step_reproduce = req.body.step_reproduce;
  data.summary = req.body.summary;
  data.browser = req.body.browser;
  data.visual = req.body.visual;
  data.reproduce = req.body.reproduce;
  data.severity = req.body.severity;
  data.priority = req.body.priority;
  data.additional_info = req.body.additional_info;
  data.userid = req.body.userid;
  data.imageName = req.body.imageName;

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
app.use("/accounts", ProtectedRoutes, require("./accounts/account.controller"));


// append /api for our http requests
app.use("/api", ProtectedRoutes);

// start the server
app.listen(API_PORT, () => {
  console.log(`LISTENING ON PORT ${API_PORT}`);
});
