// dependencies

const { getUserByEmail, generateRandomString, urlPerUser } = require('./helpers');


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
app.use(express.urlencoded({extended: true}));
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

// age = 24 hours 
  maxAge: 24 * 60 * 60 * 1000 
}))

// sets template engine to ejs
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// users object
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

// url database object v2
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

// practice req. --> disp. "hello"
app.get("/", (req, res) => {
  res.send("Hello!");
});

// route (GET) to join database
app.get("/urls.json", (req, res) => {
  res.json(users);
});

// request in html format 
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// urls_index (GET) - shows all long & short urls w. option to edit or delete 
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlPerUser(userID);
  let templateVars = { urls: userUrls, user: users[userID] };
  // template vars = object that gets passed to ejs for rendering
  res.render("urls_index", templateVars);
})

// /urls (POST) - handles form submission 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
 // redirect client to new page - page link = randomly generated string
  res.redirect(`/urls/${shortURL}`);
});

// urls_new (GET) - create new url
app.get("/urls/new", (req, res) => {
// if cookie for user_id exists --> render urls_new template
  if (req.session.user_id) {
    let templateVars = { user: users[req.session.user_id] }
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
  const userID = req.session.user_id;
  const userUrls = urlPerUser(userID);
  let templateVars = { urls: userUrls, user: users[userID], shortURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});

// (POST) - route to update a resource in database
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }
  res.redirect(`/urls/${shortURL}`);
});

// (POST) - route to delete a resource
app.post("/urls/:shortURL/delete", (req, res) => {
  // use js delete operator to remove property from an object
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  // redirects to home page (/urls) once resource is removed
  res.redirect('/urls');
});

// /u/:shortURL (GET) - redirects to long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(`http:${longURL}`);
    // add http to prevent relative path error
  } else {
    res.status(404).send('<h1>404 Not Found</h1><h4>The shortURL you have entered does not exist</h4>')
  }
  // longURL = value belonging to the short URL key in URL database
});

// login route 
// check if user can be found in userdatabase
// if user found in user database => login 
// set up cookies 
// set up encrypted cookies - cookies sessions 

// urls_login (GET) 
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});

// /login (POST) - authenticates user and logs them in 
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  // if user exists
  if (user) { 
    // check if users's pw is correct using compareSync
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.cookie('user_id', user.userID);
      res.redirect('/urls');
    } else {
      res.status(403).send('<h1>403 Forbidden:<br></h1>Uh oh.. The password you have entered is incorrect.');
    }
  } else {
    res.status(403).send('<h1>403 Forbidden:<br></h1>You need both an email and a password to register.');
  }
});

  // res only exists inside route authentication
  // res.json() - sends back a json response
  // when we send data as a form - it will be part of the request --> info will be in the body of the request
  // body is an object

// /logout (POST) - logs user out -> redirects to /urls
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  // clears cookies associated w. user_id 
  // redirects user to main page
  res.redirect("/urls");
});

// /register (GET) - registers user 
app.get("/register", (req, res) => {
 let templateVars = { user: users[req.session.user_id] }
 // tempVars - object passsed into ejs for render
  res.render('urls_register', templateVars);
});

// /register (POST) - handles user registration 
app.post('/register', (req, res) => {
  // if email and pass word return truthy & are not found in existing db --> add new user to db
 if (req.body.email && req.body.password) {
  // if email and password are truthy - are not empty strings
   if (!getUserByEmail(req.body.email, users)) {
      // if email doesnt already exist
       // generate unique user id, hash password and add user to users object 
      const userID = generateRandomString();
      const hashedpassword = bcrypt.hashSync(req.body.password, 10);
      
      users[userID] = {
        userID,
        email: req.body.email,
        password: hashedpassword
        // new userid = random #, email comes from registration form, pw comes from registration form
      }
      res.cookie('user_id', userID);
      res.redirect('/urls');
      // if email already exists --> send err code (already registered)
   } else {
      res.status(400).send('<h1>400 Bad Request:<br></h1> This email is already in use. Please try another email.')
      // if email exists 
      // use header tags to add emphasis
   }
 } else {
    res.status(400).send('<h1>400 Bad Request:<br></h1>You need both an email and a password to register.')
     // if user didnt enter email or pw (email or pw are empty)
 }
});













