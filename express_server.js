const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(morgan('dev'));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const PORT = 8080;

// SETS EJS AS VIEW ENGINE
// -----------------------
app.set("view engine", "ejs");


// GENERATES RANDOMIZED 6 CHAR STRING
// ----------------------------------
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
// ------------
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

// database[userID] = {id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur"}
// database[usersID].email = user@example.com

// DATABSE OBJECT
// --------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//SERVER SETUP
// -----------
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// ROUTE TO JOIN URL DATABASE
// --------------------------
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// MAKES POST REQUEST READABLE
// ---------------------------
// converts request body from a Buffer into a readable string
// adds the data to the req object under the key - body
// const bodyParser = require("body-parser");
app.use(express.urlencoded({extended: true}));
// extended - allows us to input objects and arrays + primitives

//ADD ROUTE - HTML settings
// ------------------------
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// NEW ROUTE - URLS_INDEX (shows all long and short urls w. option to edit or delete)
app.get("/urls", (req, res) => {
  // template vars = object that gets passed to ejs for rendering
  let templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  // res.render (template, object containing vars to pass into template)
  res.render("urls_index", templateVars);
})

// GET ROUTE TO SHOW FORM / RENDER URL TEMPLATE  - URLS_NEW (create new url)
// --------------------------------------------
app.get("/urls/new", (req, res) => {
  let templateVars = {user_id: req.cookies['user_id']}
  res.render("urls_new", templateVars);
});

// SECOND ROUTE & EJS TEMPLATE - URLS_SHOW (show short/long urls)
// ---------------------------
// ":" indicates shortURL is a route parameter
// shortURL stored in req.params
// /urls/:d route
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies['user_id'] };
  res.render("urls_show", templateVars);
});

// POST ROUTE TO HANDLE FORM SUBMISSION
// ------------------------------------
app.post("/urls", (req, res) => {
  let uniqueShortURL = generateRandomString();
  urlDatabase[uniqueShortURL] = req.body.longURL;
 // redirect client to new page - page link = randomly generated string
  res.redirect(`/urls/${uniqueShortURL}`);
});

// REDIRECT USER TO LONG URL
// -------------------------
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`http://${longURL}`);
  // longURL = value belonging to the short URL key in URL database
  // add http to prevent infinite loop error / relative path error
  // redirects to actual link - works
});

// POST ROUTE TO DELETE A RESOURCE
// -------------------------------
app.post("/urls/:shortURL/delete", (req, res) => {
  // use js delete operator to remove property from an object
  delete urlDatabase[req.params.shortURL];
  // redirects to home page (/urls) once resource is removed
  res.redirect('/urls');

});

// POST ROUTE TO UPDATE A RESOURCE
// -------------------------------
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;

  res.redirect("/urls");

});


// LOGIN ROUTE
// -----------
app.post("/login", (req, res) => {
  // what do we want to do with our login route

  // const result = authenticateUser(user, email, password);
  //const username = req.body.username;
  // res.json({username}); // returns username

  res.cookie('user_id', req.body.user_id);
  // redirects to /urls after login
  res.redirect("/urls");


  // res only exists inside route authentication
  // res.json() - sends back a json response
  // when we send data as a form - it will be part of the request --> info will be in the body of the request
  // body is an object

  //res.cookie('username', username)
  if (result.err) {
    console.log(result.err);
    return res.redirect('/');
  }
  return res.json(result.data);
});

// LOGOUT ROUTE
// ------------
app.post("/logout", (req, res) => {

  res.clearCookie('user_id');

  res.redirect("/urls");

});

// REGISTRATION ROUTE - /REGISTER (GET)
// ------------------------------------
app.get("/register", (req, res) => {
 let templateVars = { user_id: req.cookies['user_id'] }

  res.render('urls_register', templateVars);
});
// check if given email is already in the usersObj
const checkEmailInDatabase = (email) => {
  for (const user in users) { if (users[user].email === email) {
    return true;
  }
  }
  return false;
};


// REGISTRATION HANDLER /REGISTER (POST)
// -------------------------------------
// update registration error handling / authentication

app.post('/register', (req, res) => {
  // if email and pass work return truthy & are not found in existing db --> add new user to db
  if (req.body.email && req.body.password) {
    if (!checkEmailInDatabase) {
      const newUser = {
        id: generateRandomString(),
        email: req.body.email,
        password: req.body.password
      }
      res.cookie('user_id', userID);
      res.redirect('/urls');
      // if email already in db --> send err code (already registered)
    } else {
      res.status(400);
      res.send('400 Error - This email already exists.')
    }
  } else {
    res.status(400);
    res.send('400 Error - Please register with an email and password.')
  }

})







