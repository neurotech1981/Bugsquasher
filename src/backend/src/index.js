//import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
var Data = require("./models/data");
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
const path = require("path");
const logger = require("morgan");
const multer = require("multer");
var multipart = require("connect-multiparty");
const cookieParser = require("cookie-parser");
import config from '../config/index';

var multipartMiddleware = multipart();

// Multer image storage settings
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
//var storage = multer.diskStorage({
//  destination: function(req, file, cb) {
//    cb(null, "./uploads");
//  },
//  filename: function(req, file, cb) {
//    cb(null, Date.now() + "-" + file.originalname);
//  }
//});
const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    // rejects storing a file
    cb(null, false);
  }
}

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20 // Set max size for upload ; Current is 20 Mb
  },
  fileFilter: fileFilter
});

// MongoDB database
const dbRoute = "mongodb://neurotech:946Dypew!@ds127376.mlab.com:27376/bugsquasher";
const API_PORT = 3001;

const validateInput = require("../../validation/input-validation");

// Use the Data object (data) to find all Data records
Data.find(Data);
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);
// connects our back end code with the database
const URI = config.mongoURI;
try {
  mongoose.connect(
    URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  );
} catch (error) {
  console.log(error);
}

let db = mongoose.connection;

db.once("open", function() {
  console.log("connected to the database");
});

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));


// define the Express app
const app = express();
const router = express.Router();
// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
  })
);
app.use(logger("dev"));
app.use(bodyParser.json({ limit: '50mb' }));
app.use("/uploads", express.static('uploads'));
// Redirect to react build
app.use(express.static(path.join(__dirname, "../build")));
app.get("/", function(req, res, next) {
  res.sendFile(path.resolve("../build/index.html"));
});
// enhance your app security with Helmet
app.use(helmet());
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan("combined"));

// ADD routes
app.use('/', userRoutes);
app.use('/', authRoutes);

app.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({ error: err.name + ':' + err.message });
	}
});


router.route("/uploadimage", multipartMiddleware)
  .post(upload.array('imageData', 10), function(req, res, next) {
    const newImage = new Data({
      imageName: req.body.setImageName,
      //imageData: req.body.imageData
    });
    newImage.save()
      .then((result) => {
        console.log(result);
        res.status(200).json({
          success: true,
          document: result
        });
      })
      .catch((err) => next(err));
  });

// this is our get method
// this method fetches all available data in our database
router.get("/getData", (req, res) => {
  Data.find((err, data) => {
    if (err)
      return res.json({
        success: false,
        error: err
      });
    return res.json({
      success: true,
      data: data
    });
  });
});

/*router.post("/updateData", (req, res) => {
  let data = new Data();

  if (!data.req.body && data.req.body !== 0) 
  {
    return res.json({
      success: false,
      error: "INVALID INPUTS"
    });
  }

  data.id = id.req.body;
  data.name = name.req.body;
  data.description = description.req.body;
  data.environment = environment.req.body;
  data.browser = browser.req.body;
  data.visual = visual.req.body;
  data.reproduce = reproduce.req.body;
  data.severity = severity.req.body;
  data.priority = priority.req.body; 
  data.date = date.req.body;
  data.reporter = reporter.req.body;
  data.assigned = assigned.req.body;

  save(err => {
    if (err)
      return res.json({
        success: false,
        error: err
      });
    return res.json({
      success: true
    });
  });
});*/

// this is our old update method
// this method overwrites existing data in our database
router.post("/updateData", (req, res) => {
  const { id, update } = req.body;
  Data.findByIdAndUpdate(id, update, err => {
    if (err)
      return res.json({
        success: false,
        error: err
      });
    return res.json({
      success: true
    });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  Data.findByIdAndRemove(id, err => {
    if (err) return res.send(err);
    return res.json({
      success: true
    });
  });
});

// this is our create method
// this method adds new data in our database
router.post("/putData", (req, res) => {
  
  const { errors, isValid } = validateInput(req.body);

  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }


// if (!req.body.name && req.body.name !== 0) {
//   return res.json({
//     success: false,
//     error: "INVALID INPUTS"
//   });
//  }
    let data = new Data();
    data.id = req.body.id;
    data.name = req.body.name;
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
    data.status = req.body.status;
    //data.attached_photo = req.body.attached_photo;
    data.imageName = req.body.imageName[0];
    //data.imageData = req.body.imageData;
    //data.reporter = req.body.reporter;
    //data.assigned = req.body.assigned;

  data.save(err => {
    if (err)
    return res.status(400).json({
        success: false,
        error: err
      });
    return res.status(200).json({
      success: true,
      document: data
    });
  });
});

// append /api for our http requests
app.use("/api", router);

// start the server
app.listen(API_PORT, () => {
  console.log(`LISTENING ON PORT ${API_PORT}`);
});
