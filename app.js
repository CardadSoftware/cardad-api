// setup env variables
require('dotenv').config({ path: `./environment/.env.${process.env.NODE_ENV || 'development'}` });

const { connectDB } = require('cardad-db')
// connect to db
connectDB(process.env.MONGO_URI, { user: process.env.DB_USER, authSource: process.env.AUTH_DB, pass: process.env.DB_PASSWORD, dbName: process.env.DB_NAME });

const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const updateMakeModel = require('./tasks/updateMakeModel');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const https = require('https');
const fs = require('fs');

const scheduler = new ToadScheduler();
var apiRouter = require('./routes/api');

// schedule task to update make model database
const task = new AsyncTask(
  'Update Make Models', updateMakeModel 
  ,(err) => { console.log(err); }
)

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/oauth/', oauthRouter)
app.use('/api/', apiRouter);

// bootstrap
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
)
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
)
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const baseFolder =
  process.env.APPDATA !== undefined && process.env.APPDATA !== ''
    ? `${process.env.APPDATA}/cardad/https`
    : `${process.env.HOME}/.cardad/https`;

const certFilePath = path.join(baseFolder, `${process.env.npm_package_name}.pem`);
const keyFilePath = path.join(baseFolder, `${process.env.npm_package_name}.key`);
// Assuming your cert and key files are in the same directory as your Node.js script
const options = {
  key: fs.readFileSync(keyFilePath),
  cert: fs.readFileSync(certFilePath)
};

https.createServer(options,app).listen(5001)

module.exports = app;
