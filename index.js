// NODE
const path = require('path');
require('dotenv').load();
// LIBRARIES
const express = require('express');
const app = express();
const morgan = require('morgan');
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
    // logger
    app.use(morgan('dev'));
    app.use(cors({credentials: true, origin: true}));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieParser('1123ddsgfdrtrthsds'));
    app.set('trust proxy', 1);
    app.use(sessionStore);
    app.use(passport.initialize());
    app.use(passport.session());
    require('./auth.js')(passport, LocalStrategy);
    
    
    // perhaps expose some API metadata at the root
    // app.get('/users', (req, res) => {
    //   res.json({ loggedIn :  });
    // });

    // app.post('/transactions', (req, res) => {
    //   console.log('asd',req.body);
    //   res.json({ address: req.body.address });
    // });


    // HTTP Routes
    app.use('/transactions', transactionRoutes);
    app.use('/users', userRoutes);
});


