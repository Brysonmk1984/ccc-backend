// NODE
const path = require('path');
require('dotenv').load();
// LIBRARIES
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// COMMON
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');
const web3Routes = require('./routes/web3');
const sessionStore = require('./store').sessionStore;



  // http server
app.listen( process.env.PORT || 3001, function () {
    
  console.log('Listening on port ' + (process.env.PORT || 3001));
  // Middleware
  // logger
  app.use(morgan('dev'));
  app.use(cors({credentials: true, origin: process.env.NODE_ENV === 'production' ? 'https://dcoin-web-app.appspot.com' : 'http://localhost:8080'}));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cookieParser('1123ddsgfdrtrthsds'));
  app.set('trust proxy', 1);
  app.use(sessionStore);
  app.use(passport.initialize());
  app.use(passport.session());
  require('./auth.js')(passport, LocalStrategy);
  
  app.options('*', cors())
  // HTTP Routes
  app.use('/transactions', transactionRoutes);
  app.use('/users', userRoutes);
  app.use('/web3', web3Routes);
});


