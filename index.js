// NODE
const path = require('path');
require('dotenv').load();
// LIBRARIES
const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// COMMON
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');
const sessionStore = require('./store').sessionStore;



  // http server
app.listen( process.env.PORT || 3001, function () {
    console.log(
      'ENV',
      process.env.NODE_ENV,
      process.env.INSTANCE_CONNECTION_NAME,
      process.env.SQL_DATABASE,
      process.env.SQL_USER,
      process.env.SQL_PASSWORD
    );
    console.log('Listening on port ' + (process.env.PORT || 3001));
    // Middleware
    app.use(cors({credentials: true, origin: true}));
    //app.use(cors({credentials: true, origin: 'https://beta-dot-dcoin-web-app.appspot.com'}));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieParser('1123ddsgfdrtrthsds'));
    app.set('trust proxy', 1);
    app.use(sessionStore);
    app.use(passport.initialize());
    app.use(passport.session());
    // app.use(function(req, res, next) {
    //   res.header("Access-Control-Allow-Origin", "*");
    //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //   next();
    // });
    require('./auth.js')(passport, LocalStrategy);
    
    // HTTP Routes
    app.use('/transactions', transactionRoutes);
    app.use('/users', userRoutes);
});


