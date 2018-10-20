const bcrypt = require('bcrypt-nodejs');
const User = require('./db').User;

const auth = function(passport, LocalStrategy){
  passport.use(new LocalStrategy({
    usernameField:'email', passwordField:'password'
    },
    function(email, password, done) {
        console.log('email', email, 'password', password);
      User.find({
          where : {
              email
          },
          attributes:['id','email', 'password']
      })
      .then((user, error)=>{
        console.log('FOUND USER!', user);
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

  // Gets information from the user object and serilizes it in a session
  // Happends when a user logs in
  passport.serializeUser(function(userId, done) {
    console.log('SERIALIZE USER');
    // userId in this case is the user email
    // accessible in routes by req.session.passport.userId
    done(null, userId);
  });
    
  // Turns the serilized user object back into a JS user object for use in the rest of the code
  // Happends any time a user visists a page that makes a call to the backend
  passport.deserializeUser(function(userId, done) {
    console.log('DESERIALIZE USER ');
    done(null, userId);
  });

};

module.exports = auth;
