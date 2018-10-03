const path = require('path');
const express = require('express');
const cors = require('cors')
// sequelize
const Sequelize = require('sequelize');
const dbUrl = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : "postgres://admin:admin@localhost/dcoin";
const sequelizeSettings = {
    dialect: 'postgres',
    protocol: 'postgres',
    storage: "./session.postgres",
    pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
},
    operatorsAliases: false
}
if(process.env.NODE_ENV === 'production'){
    sequelizeSettings.dialectOptions = {
    ssl: true
}
}
const db = new Sequelize(dbUrl, sequelizeSettings);
// parsers
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// express-validator
const { buildCheckFunction, validationResult } = require('express-validator/check');
const checkBody = buildCheckFunction(['body']);
// express-session & passport
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bcrypt = require('bcrypt-nodejs');
const UserModel = require('./models').UserModel;
const TransactionModel = require('./models').TransactionModel;
const user = UserModel(db, Sequelize);
const transaction = TransactionModel(db, Sequelize);

module.exports = function(app){
    app.use(cors({credentials: true, origin: true}));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieParser('1123ddsgfdrtrthsds'));
    const store = new SequelizeStore({
    db,
    checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
    expiration: 864000000, // 10 Days in miliseconds
    });
    app.set('trust proxy', 1);
    app.use(session({
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
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    //app.use(flash());
    // app.use(function(req,res,next){
    // //console.log('IS AUTHENTICATED - ', req.isAuthenticated());
    // res.locals.isAuthenticated = req.isAuthenticated();
    // next();
    // });
    passport.use(new LocalStrategy({
    usernameField:'email', passwordField:'password'
    },
    function(email, password, done) {
    user.find({
        where : {
            email
        },
        attributes:['id','email', 'password']
    })
    .then((user, error)=>{
        console.log('FOUND USER!', user, password);
    if(user){
        bcrypt.compare(password, user.dataValues.password, function(err, isMatch){
    if(err){console.log(err);}
    if(isMatch){
        return done(null, user, {message : 'Match'});
    } else {
        return done(null, false, {message : 'Password did not match'});
    }
    });
    }else{
        return done(error, null);
    }
    })
    .error(function(error){
        console.log('ERROR - ',error);
        return done(error, null);
    });
    }
    ));
    // REGISTER NEW ACCOUNT
    app.post('/register', [
        checkBody('email', 'The email you entered is invalid, please try again.').isEmail(),
        checkBody('email', 'Email address must be between 4-100 characters long, please try again.').isLength({ min: 4, max: 100 }),
        checkBody('password', 'Password must be between 8-100 characters long.').isLength({ min: 8, max: 100 }),
        //checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
        checkBody('passwordConfirm', 'Password must be between 8-100 characters long.').isLength({ min: 8, max: 100 }),
        checkBody('passwordConfirm', 'Passwords do not match, please try again.').custom((value, { req }) => value === req.body.password),
        ], function(req, res){
        const errors = validationResult(req);
        console.log('ERRORS!!', errors.array());
        if(!errors.isEmpty()){
        res.json({ requestType : 'POST', success : false, error : errors.array() });
        return;
        }
        user.create({
            email : req.body.email,
            password : req.body.password,
            publicEthKey : req.body.publicEthKey,
        })
        .then((user)=>{console.log('u2', user);
        req.login(user.id, function(err){
        if(err){
        res.json({ requestType : 'POST', success : false, error : err });
        }
        res.json({ requestType : 'POST', success : true, user });
        });
        })
        .catch((err) =>{console.log('CAUGHT ERR', err);
        res.json({ requestType : 'POST', success : false, error : err });
        });
    });
    // LOGIN TO EXISTING ACCOUNT
    app.post('/login', function(req, res, next){
        passport.authenticate('local',function(err, u, info){
        store.get(req.sessionID, (err,sess)=>{
            if(err){
                console.log('Error retrieving session - ', err);
                return res.json({
                error: "Error retrieving session ",
                isAuthenticated : false,
                requestType : 'POST',
                success : false
                });
            }
        })
        if (err) return next(err);
        if (!u.email) {
            console.log('No user found...');
            return res.json({
                error: "No user found...",
                isAuthenticated : false,
                requestType : 'POST',
                success : false
            });
        }
        // Manually establish the session...
        req.login(u.email, function(err) {
            if (err) return next(err);
            user.find({
                where : {
                email : u.email
                },
                attributes:['publicEthKey']
            }).then((user, err) => {
                res.json({
                sessionId : req.sessionID,
                user : user.email,
                publicEthKey : user.dataValues.publicEthKey,
                isAuthenticated : true,
                requestType : 'POST',
                success : true
                });
                next();
            });


        });
        })(req, res, next);
    });
    app.get('/logout', function(req, res){
        //console.log('sessid-1',req.sessionID);
        req.session.destroy(((err)=>{
            if(err){
                console.log('Error destroying session - ', err);
                res.json({error : err, isAuthenticated : true, requestType : 'GET', success : false});
            }
        }));
        req.logout();
        res.json({isAuthenticated : false, requestType : 'GET', success : true});
    });
    /*
    * Check the request if the user is authenticated.
    * Return an error message if not, otherwise keep going :)
    */
    app.use(function(req, res, next){
        console.log('REQUSER -- ', req.user);
        // isAuthenticated is set by `deserializeUser()`
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            //console.log('BEFORE error', req.isAuthenticated());
            res.status(401).send({
            success: false,
            message: 'You are not logged in',
            requestType : 'GET'
            });
        }else{
            next();
        }
    });
    app.get('/logged-in', function(req, res, next){
        console.log('Shouldnt be in here');
        user.find({
        where : {
        email : req.user
        },
        attributes:['publicEthKey']
        })
        .then((user, error)=>{
            res.status(200).send({
            success: true,
            message: `You are logged in as ${req.user}`,
            publicEthKey: user.dataValues.publicEthKey,
            requestType : 'GET'
            });
            next();
        });
    });
        app.get('/account-details', function(req, res, next){
            user.find({
            where : {
            email : req.user
            },
            attributes:['publicEthKey', 'username', 'createdAt', 'email']
            })
            .then((user, error)=>{
                res.status(200).send({
                    success: true,
                    message: `You are logged in as ${req.user}`,
                    publicEthKey: user.dataValues.publicEthKey,
                    email: user.dataValues.email,
                    createdAt: user.dataValues.createdAt,
                    requestType : 'GET'
                });
                next();
                });
            });

        // POST - RETRIEVE SENT TRANSACTIONS
        app.post('/retrieve-sent-hashes', function(req, res, next){
            console.log('LOOK', req.body.address);
            transaction.findAll({
            where : {
                sender : req.body.address.toLowerCase()
            },
            attributes:['transactionHash', 'createdAt']
            })
            .then((transactions, error)=>{
                const transArray = transactions.map((t)=>{
                    return {hash: t.transactionHash, timestamp: t.createdAt};
                });
                res.status(200).send(transArray);
                next();
            });
        });

        // POST - RETRIEVE RECEIVED TRANSACTIONS
        app.post('/retrieve-received-hashes', function(req, res, next){
            transaction.findAll({
            where : {
                receiver : req.body.address.toLowerCase()
            },
            attributes:['transactionHash', 'createdAt']
            })
            .then((transactions, error)=>{
                const transArray = transactions.map((t)=>{
                    return {hash: t.transactionHash, timestamp: t.createdAt};
                });
                res.status(200).send(transArray);
                next();
            });
        });

        // POST - SAVE NEW TRANSACTION TO DB
        app.post('/save-new-hash', function(req, res, next){
            transaction.create({
                sender : req.body.from,
                receiver : req.body.to,
                transactionHash : req.body.hash
            })
            .then((data) =>{
                console.log(data);
                res.status(200).send(data);
                next();
            })
        });



    };




    passport.serializeUser(function(userId, done) {
        done(null, userId);
    });
    passport.deserializeUser(function(userId, done) {
    done(null, userId);
});
