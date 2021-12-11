const express = require('express');
const app = express();
const PORT = 3000;
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { generateRandomString, checkForUserByEmail, urlsForUser } = require('./helpers');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));


/* 
DATA
------------------------------------------- 
*/

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: 'userRandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: 'user2RandomID'
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "mario@email.com", 
    password: bcrypt.hashSync("peach", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("1234", 10)
  }
}

/* 
GET REQUESTS 
------------------------------------------- 
*/

// Home
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Shows the Url database in JSON
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// URLs Index page
app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.render('urls_index', { user });
  }
  const userURLs = urlsForUser(user, urlDatabase);
  const templateVars = { 
    urls: userURLs,
    user
  };
  res.render('urls_index', templateVars);
});

// Create new URL page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

// Page for specific URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return res.status(400).send('Please type a valid url');
  }
  
  if (!req.session.user_id) {
    return res.status(400).send('Please login to view urls');
  }
  
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.session.user_id];
  const userURLs = urlsForUser(user, urlDatabase);

  
  const templateVars = { 
    shortURL,
    longURL,
    user,
    userURLs
    };
  res.render("urls_show", templateVars);
});

// Leads to website stored in LongURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Please go back and ask for a valid URL.')
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  const user_id = req.session.user_id;
  if (user_id) {
    return res.redirect('/urls');
  }
  res.render('user_register', templateVars);
});

// Login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  const user_id = req.session.user_id;
  if (user_id) {
    return res.redirect('/urls');
  }
  res.render('user_login', templateVars);
});


/* 
POST REQUESTS
------------------------------------------- 
*/

// Saves new URL to urlDatabase
app.post("/urls", (req, res) => {
  const longURL = req.body['longURL'];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userId: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

// Deletes a URL from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  if (user.id === urlDatabase[shortURL].userId) {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
  res.status(400).send('You cannot perform this action!');
});

// Edits a URL from urlDatabase
app.post('/urls/:shortURL/edit', (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const newURL = req.body['new-url'];
  if (!user) {
    return res.status(400).send('You must be logged in to make changes');
  }
  if (user.id === urlDatabase[shortURL].userId) {
    if (!newURL) {
      return res.status(400).send('You cannot leave the input blank. Please try again.');
    }
    urlDatabase[shortURL].longURL = newURL;
    return res.redirect(`/urls`);
  }
  res.status(400).send('You cannot perform this action!');
});

// Authenticates an already registered user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = checkForUserByEmail(email, users);
  if (!email || !password) {
    return res.status(400).send('email and password cannot be blank');
  }
  if (!user) {
    return res.status(403).send('No user with that email is registered');
  }
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      return res.status(403).send('Wrong password. Please try again.');
    }
    req.session.user_id = user.id;
    res.redirect('/urls');  
  });
});

// Logs the user out
app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/urls');
});

// Creates a new user and stores them in the users object
app.post('/register', (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  const user = checkForUserByEmail(email, users);
  if (!email || !password) {
   return res.status(400).send('email and password cannot be blank');
  } 
  if (user) {
    return res.status(400).send('This user already exists. Please log in');
  }

  users[user_id] = {
    id : user_id,
    email,
    password: hashedPassword
  }
  req.session.user_id = users[user_id]['id'];
  res.redirect('/urls');
});

/* 
LISTEN TO PORT
------------------------------------------- 
*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
