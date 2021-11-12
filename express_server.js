const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(morgan('dev'));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const PORT = 8080;

// SETS EJS AS VIEW ENGINE
app.set("view engine", "ejs");


// GENERATES RANDOMIZED 6 CHAR STRING
const generateRandomString = () => {
  let output = ' ';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz0123456789';
  const charLength = characters.length;
  const maxRandomStringLength = 6;

  for(let i = 0; i < maxRandomStringLength; i++) {
    output += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return output;
}

// USERS OBJECT
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


// users[userID] = {id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur"}
// users[usersID].email = user@example.com

// DATABASE OBJECT
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//SERVER SETUP
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// ROUTE TO JOIN URL DATABASE
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// MAKES POST REQUEST READABLE
// converts request body from a Buffer into a readable string
// adds the data to the req object under the key - body
// const bodyParser = require("body-parser");
app.use(express.urlencoded({extended: true}));
// extended - allows us to input objects and arrays + primitives

//ADD ROUTE - HTML settings
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// NEW ROUTE - URLS_INDEX (shows all long and short urls w. option to edit or delete)
app.get("/urls", (req, res) => {
  // template vars = object that gets passed to ejs for rendering
  let templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
})

// GET ROUTE TO SHOW FORM / RENDER URL TEMPLATE  - URLS_NEW (create new url)
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] }
  res.render("urls_new", templateVars);
});

// SECOND ROUTE & EJS TEMPLATE - URLS_SHOW (show short/long urls)
// ":" indicates shortURL is a route parameter
// shortURL stored in req.params
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

// POST ROUTE TO HANDLE FORM SUBMISSION
app.post("/urls", (req, res) => {
  let uniqueShortURL = generateRandomString();
  urlDatabase[uniqueShortURL] = req.body.longURL;
 // redirect client to new page - page link = randomly generated string
  res.redirect(`/urls/${uniqueShortURL}`);
});

// REDIRECT USER TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`http://${longURL}`);
  // longURL = value belonging to the short URL key in URL database
  // add http to prevent infinite loop error / relative path error
});

// POST ROUTE TO DELETE A RESOURCE
app.post("/urls/:shortURL/delete", (req, res) => {
  // use js delete operator to remove property from an object
  delete urlDatabase[req.params.shortURL];
  // redirects to home page (/urls) once resource is removed
  res.redirect('/urls');

});

// POST ROUTE TO UPDATE A RESOURCE
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;

  res.redirect("/urls");
});


// check if given email is already in the usersObj
const findUserInDatabase = (email) => {
  for (const user in users) { 
    // user = key
    if (users[user].email === email) {
    return true;
  }
}
  return false;
};


// LOGIN ROUTE
// check if user can be found in userdatabase
// if user found in user database => login 
// set up cookies 
// set up encrypted cookies - cookies sessions 

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']]};
  res.render("urls_login", templateVars);
});

// app.post("/login", (req, res) => {
//   const user = findUserInDatabase(req.body.email); //users
//   if (user) {
//     // if user exists and password entered matches 
//     if (req.body.password === user.password) {
//       // set user_id cookie 
//       res.cookie('user_id', user.userID);
//       // redirect to /urls
//       res.redirect('/urls');
//     } else {
//       res.status(403).send('<h1>403 Forbidden</h1><h4> The password you have entered is incorrect.</h4>')
//     }
//   } else {
//     res.status(403).send('<h1>403 Forbidden</h1><h4> The email address you have entered is not registered.</h4>')
//   }
// });

app.post("/login", (req, res) => {
  const userID = generateRandomString();
  if (req.body.email && req.body.password) {
    // if email and password fields are filled in
    if (findUserInDatabase(req.body.email)) {
      // if user if found in the database
      res.cookie('user_id', userID);
      // set cookie for user and redirect to /urls page
      res.redirect('/urls');
    } else {
      res.status(403).send('h1>403 Forbidden</h1><h4> The password you have entered is incorrect.</h4>');
  } 
  } else {
    res.status(403).send('<h1>400 Error:</h1> <h4>You need both an email and a password to register.</h4>')
  }
})

  // res only exists inside route authentication
  // res.json() - sends back a json response
  // when we send data as a form - it will be part of the request --> info will be in the body of the request
  // body is an object

// LOGOUT ROUTE
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  // clears cookies associated w. user_id 
  // redirects user to main page
  res.redirect("/urls");
});

// REGISTRATION PAGE - /REGISTER (GET)
app.get("/register", (req, res) => {
 let templateVars = { user: users[req.cookies['user_id']] }
 // tempVars - object passsed into ejs for render
  res.render('urls_register', templateVars);
});


// REGISTRATION HANDLER /REGISTER (POST)
app.post('/register', (req, res) => {
  // if email and pass word return truthy & are not found in existing db --> add new user to db
 if (req.body.email && req.body.password) {
  // if email and password are truthy - are not empty strings
   if (!findUserInDatabase(req.body.email)) {
      // if email doesnt already exist
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
        // new userid = random #, email comes from registration form, pw comes from registration form
      }
      res.cookie('user_id', userID);
      res.redirect('/urls');
      // if email already exists --> send err code (already registered)
   } else {
      res.status(403).send('<h1>400 Error:</h1><h4> This email is already in use. Please try another email.</h4>')
      // if email exists 
      // use header tags to add emphasis
   }
 } else {
    res.status(403).send('<h1>400 Error:</h1> <h4>You need both an email and a password to register.</h4>')
     // if user didnt enter email or pw (email or pw are empty)
 }
});

// logout button not appearing
// registration showing errors only - even if register with unique credentials --> error
// cookies not registering 

// LOGIN FORM (GET) /LOGIN PAGE 
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] }
  res.render('urls_login', templateVars);
});








