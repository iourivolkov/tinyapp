// dependencies
const { getUserByEmail, generateRandomString, urlForUser} = require('./helperFunctions');

const express = require("express");
const app = express();
// used to hash passwords
const bcrypt = require('bcryptjs');
// default port = 8080
const PORT = 8080;

// middle ware
// logs requests b.w client and server
const morgan = require("morgan");
app.use(morgan('dev'));
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}));
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: 'bitcoin is the way'
}))

// sets template engine to ejs
app.set("view engine", "ejs");

// data
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

//url database object v2
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


// route (GET) to join database
app.get("/urls.json", (req, res) => {
  res.send(users);
});

// request in html format 
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// urls_index (GET) - home page - shows all urls 
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const userUrls = urlForUser(userID, urlDatabase);
  // template vars = object that gets passed to ejs for rendering
  const templateVars = { urls: userUrls, user: users[userID]};
  res.render("urls_index", templateVars);
})

// /urls (POST) - creates new URL + adds to db 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    // long url found in the request body
    userID: req.session.userID
    // userid - encrypted cookie created for that session
  };
 // redirect client to new page - page link = randomly generated string
  res.redirect(`/urls/${shortURL}`);
});


// urls_new (GET) - create new url 
// if user not logged in --> redirects to login page 
app.get("/urls/new", (req, res) => {
// check client cookie, if cookie is found on http request - adds session stored into to request object
  if (req.session.userID) {
    // templateVars = variables to populate urls/new template with 
    const templateVars = { user: users[req.session.userID] }
    res.render("urls_new", templateVars);
  } else {
    // otherwise, redirect to login page 
    res.redirect('/login');
  }
});

// urls_show (GET) - shows short & long urls
// ":" indicates shortURL is a route parameter
// shortURL stored in req.params
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const userUrls = urlForUser(userID, urlDatabase);
  const templateVars = { urlDatabase, userUrls, shortURL, user: users[userID] };
  res.render("urls_show", templateVars);
});


// (POST) - route to update/edit a url in the database
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // if session id exists
  if (req.session.userID){
    // if session id matches id in url database
    if (req.session.userID === urlDatabase[shortURL].userID){
      // then update the longURL and redirect to new page
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect(`/urls/${shortURL}`);
    }
  }
});

// (POST) - route to delete a url from the database
// only verified users can delete urls
app.post("/urls/:shortURL/delete", (req, res) => {
  // use js delete operator to remove property from an object
  const shortURL = req.params.shortURL;
  // if sesshion id exists
  if (req.session.userID){
    // if session id matches database user id
    if (req.session.userID === urlDatabase[shortURL].userID) {
      // delete short url and redirect to homepage 
      delete urlDatabase[shortURL];
      res.redirect('/urls');
    }
  }
  // redirects to home page (/urls) once url is removed
});

// /u/:shortURL (GET) - redirects to long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('<h1>404 Not Found</h1>The URL you are looking for does not exist.')
  }
});


// urls_login (GET) 
app.get("/login", (req, res) => {
  // if session id exits = user is logged in --> redirect to main page
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }
  // if user is not logged in - render login page for user
  const templateVars = { user: users[req.session.userID]};
  res.render("urls_login", templateVars);
  res.redirect('/login');
  
});

// login (POST) - authenticates user and logs them in 
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  // if user exists
  if (user) { 
    // check if users's pw is correct using compareSync
    if (req.body.password, user.password) {
      req.session.userID = user.userID;
      // if session user id matches database user id --> log user in and redirect to home page 
      res.redirect('/urls');
    } else {
      // if pw doesnt match --> 403 error -> pw doesn't match
      res.status(403).send('<h1>403 Forbidden:<br></h1>The password you have entered does not match this account. Please try again.');
    }
  } else {
    // if user not found in database
    res.status(403).send('<h1>403 Forbidden:<br></h1>Please check your login information and try again.');
  }
});


// /logout (POST) - logs user out -> redirects to /urls
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  // clears cookies associated w. user_id 
  // redirects user to main page
  res.redirect("/urls");
});


// /register (GET) - registers user 
app.get("/register", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }
 const templateVars = { user: users[req.session.userID] }
 // tempVars - object passsed into ejs for render
  res.render('urls_register', templateVars);
});


// /register (POST) - handles user registration 
app.post('/register', (req, res) => {
  // if email and pass word have been entered in the form
 if (req.body.email && req.body.password) {
  // if user doesn't already exist in the database 
   if (!getUserByEmail(req.body.email, users)) {
       // generate unique user id, hash password and add user to users object 
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
        // new userid = random #, email comes from registration form, pw comes from registration form
      };
      req.session.userID = userID;
      console.log(users[userID]);
      res.redirect('/urls');
      // if email already exists --> send err code (already registered)
   } else {
      res.status(404).send('<h1>400 Bad Request:<br></h1> This email is already in use. Please try another email.')
      // if email exists 
   }
 } else {
    res.status(404).send('<h1>400 Bad Request:<br></h1>You need both an email and a password to register.')
     // if user didnt enter email or pw (email or pw are empty)
 }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});











