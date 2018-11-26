// initalize sequelize with session store
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./db').db;

const store = new SequelizeStore({
  db,
  checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
  expiration: 864000000, // 10 Days in miliseconds
});

const sessionStore = session({
  key: process.env.NODE_ENV === 'production' ? '__cfduid' : 'sid',
  secret: '1123ddsgfdrtrthsds',
  resave: false,
  saveUninitialized: false,
  proxy : true, // add this when behind a reverse proxy, if you need secure cookies
  cookie: {
  secure: process.env.NODE_ENV === 'production' ? true : false, // Secure is Recommeneded, However it requires an HTTPS enabled website (SSL Certificate)
  maxAge: 864000000, // 10 Days in miliseconds
  httpOnly: false
},
  store
});

module.exports = { store, sessionStore };