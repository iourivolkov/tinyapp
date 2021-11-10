const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(morgan('dev'));
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
// DATABSE OBJECT
// --------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// TEST GET REQUEST
// ----------------
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
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// extended - allows us to input objects and arrays + primitives

// COOKIE PARSER - MIDDLEWARE - HELPS READ COOKIE VALUES
// -----------------------------------------------------
const cookieParser = require("cookie-parser");


//ADD ROUTE - HTML settings 
// ------------------------
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// add new route handler for /urls and use res.render() to pass URL data to our template
app.get("/urls", (req, res) => {
  // template vars = object that gets passed to ejs for rendering
  const templateVars = { urls: urlDatabase };
  // res.render (template, object containing vars to pass into template)
  res.render("urls_index", templateVars);
})

// GET ROUTE TO SHOW FORM / RENDER URL TEMPLATE 
// --------------------------------------------
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// SECOND ROUTE & EJS TEMPLATE
// ---------------------------
// ":" indicates shortURL is a route parameter
// shortURL stores in req.params 
// /urls/:d route 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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














