// dependencies
const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const PORT = 8080;

// middle ware
const morgan = require("morgan");
app.use(morgan('dev'));
app.use(express.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// template engine 
app.set("view engine", "ejs");


// users object w. hashed pw
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// const urlDatabase = {};
// const users = {};

// url database v2
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

// longURL = urlDatabase[shortURL].longURL;
// helper f(x)'s

// check if user exists in database
const findUserInDatabase = (email, database) => {
  for (const user in database) { 
    // user = key
    if (database[user].email === email) {
      // if users[key].email === email 
      return database[user];
  }
}
  return null;
  // undefined can be natural - null is deliberate
};


// generates string of 6 random characters - used to create unique userID
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

// const users = {
  // "userRandomID": {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: bcrypt.hashSync("purple-monkey-dinosaur", 10)

  // const urlDatabase = {
  //   b6UTxQ: {
  //       longURL: "https://www.tsn.ca",
  //       userID: "aJ48lW"

const urlsForSpecificUser = (id) => {
  // initialize empty object
  let userURLS = {};
  // iterate over urlDatabase keys (shortURL)
  for (const shortURL in urlDatabase) {
    // if userid in urlDatabase matches the users id 
    // then the given shortURL belongs to that user
    if (urlDatabase[shortURL].userID === id) {
      userURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  // return new obj containing all shortURLs for specific user
  return userURLS;
}


// users[userID] = {id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur"}
// users[usersID].email = user@example.com

// DATABASE OBJECT
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

app.get("/", (req, res) => {
  res.send("Hello!");
});

// set up server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// route (GET) to join database
app.get("/urls.json", (req, res) => {
  res.json(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// urls_index (GET) - shows all long & short urls w. option to edit or delete 
app.get("/urls", (req, res) => {
  // template vars = object that gets passed to ejs for rendering
  const userID = req.cookies['user_id'];
  const userurl = urlsForSpecificUser(userID);
  let templateVars = { urls: userurl, user: users[userID] };
  res.render("urls_index", templateVars);
})


// urls_new (GET) - create new url
app.get("/urls/new", (req, res) => {
// if cookie for user_id exists --> render urls_new template
  if (req.cookies['user_id']) {
    let templateVars = { user: users[req.cookies['user_id']] }
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
  const userID = req.cookies['user_id'];
  const usersurls = urlsForSpecificUser(userID);
  let templateVars = { urls: usersurls, user: users[userID], shortURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});


// /urls (POST) - handles form submission 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
 // redirect client to new page - page link = randomly generated string
  res.redirect(`/urls/${shortURL}`);
});


// /u/:shortURL (GET) - redirects to long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(`http:${longURL}`);
  } else {
    res.status(404).send('<h1>404 Not Found</h1><h4>The shortURL you have entered does not exist</h4>')
  }
  // longURL = value belonging to the short URL key in URL database
  // add http to prevent infinite loop error / relative path error
});


// (POST) - route to delete a resource
app.post("/urls/:shortURL/delete", (req, res) => {
  // use js delete operator to remove property from an object
  delete urlDatabase[req.params.shortURL];

  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  // redirects to home page (/urls) once resource is removed
  res.redirect('/urls');

});


// (POST) - route to update a resource
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }

  res.redirect(`/urls/${shortURL}`);
});


// login route 
// check if user can be found in userdatabase
// if user found in user database => login 
// set up cookies 
// set up encrypted cookies - cookies sessions 


// urls_login (GET) 
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']]};
  res.render("urls_login", templateVars);
});


// /login (POST) - authenticates user and logs them in 
app.post('/login', (req, res) => {
  const user = findUserInDatabase(req.body.email, users);
  // if user exists
  if (user) { 
    if (req.body.password === user.password) {
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
 let templateVars = { user: users[req.cookies['user_id']] }
 // tempVars - object passsed into ejs for render
  res.render('urls_register', templateVars);
});


// /register (POST) - handles user registration 
app.post('/register', (req, res) => {
  // if email and pass word return truthy & are not found in existing db --> add new user to db
 if (req.body.email && req.body.password) {
  // if email and password are truthy - are not empty strings
   if (!findUserInDatabase(req.body.email, users)) {
      // if email doesnt already exist
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
        // new userid = random #, email comes from registration form, pw comes from registration form
      }
      res.cookie('user_id', userID);
      res.redirect('/urls');
      // if email already exists --> send err code (already registered)
   } else {
      res.status(403).send('<h1>400 Bad Request:<br></h1> This email is already in use. Please try another email.')
      // if email exists 
      // use header tags to add emphasis
   }
 } else {
    res.status(403).send('<h1>400 Bad Request:<br></h1>You need both an email and a password to register.')
     // if user didnt enter email or pw (email or pw are empty)
 }
});


// logout button not appearing
// registration showing errors only - even if register with unique credentials --> error









