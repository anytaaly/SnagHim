var express = require('express');
var router = express.Router();


var expressValidator = require('express-validator'); 
var passport = require('passport'); 

//password hashing (an alternativ to encryption)
var bcrypt = require('bcrypt');
const saltRounds = 10; 


//ROUTES --------------------------------------------------------------------

// GET /home page.
router.get('/', function(req, res) {
  // console.log(req.user); 
  // console.log(req.isAuthenticated());
  res.render('login', { title: 'HOME' });
});


router.get('/landing', function(req, res) {
  res.render('landing', { title: 'HOME' });
});

// GET /home page.
router.get('/home', authenticationMiddleware(), function(req, res) {
  var user = 
    {
      name: "Rhett", 
      image: "https://marriedbiography.com/wp-content/uploads/2017/04/mclaughlin-rhett-image.jpg",
      location: "Dallas, TX"
    } 
  
  res.render('home', { user : user });
  console.log(user.name); 
});

// GET /EVENTS page.
router.get('/events', authenticationMiddleware(), function(req, res) {
  res.render('events', { title: 'CREATE AN EVENT ' });
});


// GET /SNAGADATE page.
router.get('/snagadate', authenticationMiddleware(), function(req, res) {
  res.render('snagadate', { title: 'SNAG A DATE' });
});


// GET /SNAGADATE page.
router.get('/profile', authenticationMiddleware(), function(req, res) {
  res.render('profile', { title: 'SNAG A DATE' });
});

// GET /LOGIN page.
router.get('/login', function(req, res) {
  res.render('login', { title: 'log into your account ' });
});

//POST REQUEST FOR LOGIN:
router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}

)); 

// GET /Logoutpage.
router.get('/logout', function(req, res) {
    req.session.destroy(function(err){
    req.logout(); 
    //ending session
    res.redirect('login');
  }); 
});

// GET /register page.
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Registration' });
});

// GET /* all others
router.get('*', authenticationMiddleware(), function(req, res, next) {
  res.render('login', { title: 'HOME' });
});


// POST request for /register
router.post('/register', function(req, res, next) {

    //Express-Validator to make sure the username field is not empty. 
    req.checkBody('username', 'Username field cannot be empty.').notEmpty();
    req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
    req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
    req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
    req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
    req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);

    const errors = req.validationErrors(); 

    if(errors){
      console.log('errors: ${JSON.stringy(errors)}');
      
      //return the user errors

      res.render('register', {
        title: 'Registration Error',
        errors: errors
      });
    }
    else { 
        //saving the registeration input upon submit button 
      const username = req.body.username; 
      const email = req.body.email;
      const password = req.body.password;
      const rematch = req.body.passwordMatch;


        const db = require ('../db');

        bcrypt.hash(password, saltRounds, function(err, hash) {
          //??? is going to prevent users from sending malicious codes to our database
          // if we directl add values it wouldnt do the HTML escaping. 
          db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], function(error, results, fields){
            if (error) throw error; 
            // console.log(results[1]);
            //   console.log(results[2]);
            db.query('SELECT LAST_INSERT_ID() AS user_id', function(error, results, fields) {
              if (error) throw error; 
              
              const user_id = results[0]; 
              console.log(user_id); 
              
              req.login(user_id, function(err) {
                  res.redirect('/'); 
              }); 
            });
          
          })
        }); //bcrypt hash
      } //else

});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});
      
passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
        
});

function authenticationMiddleware() {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}

module.exports = router;
