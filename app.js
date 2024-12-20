const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const marketRouter = require('./routes/market');


const app = express();

require('dotenv').config();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Passport Config
//passport middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

//favicon
const favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, 'public',  'favicon.png')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet.contentSecurityPolicy(
    {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["*"],
            imgSrc: ["*", "data:"],
            frameSrc: ["*"],
            connectSrc: ["'self'", "https://ep1.adtrafficquality.google"],
            upgradeInsecureRequests: null // Disable HTTP to HTTPS redirection
        }
    })
);
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/auth", authRouter);
app.use('/market', marketRouter);

// 플래시 메시지를 로컬 변수로 설정
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    if(err.status !== 404){
        console.log(err);
    }
    res.status(err.status || 500);
    res.render('error');
});

//mongoose
const db = require("./models");
db.mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("데이터베이스 연결 수립 성공!");
    })
    .catch(err => {
      console.log("데이터베이스 연결 수립 실패!", err);
      process.exit();
  });

module.exports = app;
