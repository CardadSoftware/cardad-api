var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
var updateMakeModel = require('./tasks/updateMakeModel');
const scheduler = new ToadScheduler();

var indexRouter = require('./routes/index');
// import api router
var apiRouter = require('./routes/api');
// import user router
var userRouter = require('./routes/users');
// require use of passport
const passport = require('passport');
var BearerStrategy = require('passport-http-bearer');
var LocalStrategy = require('passport-local').Strategy;

// schedule task to update make model database
const task = new AsyncTask(
  'Update Make Models', updateMakeModel 
  ,(err) => { console.log(err); }
)

const job = new SimpleIntervalJob({ hours: 2, runImmediately: true }, task)

scheduler.addSimpleIntervalJob(job)

var app = express();
//add passport
app.use(require('express-session')({ secret: 'd5eeefd1-b5a3-412f-a0ff-c1e6996a1c69', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
// add passport bearer for api
passport.use(new BearerStrategy(
  function(token, done) {
    User.findOne({ token: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'read' });
    });
  }
));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter)
app.use('/api/', apiRouter);
app.use('/users/', userRouter );

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

// passport config
var {UserModel} = require('../cardad-db/cardadSchema');
passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

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

module.exports = app;
