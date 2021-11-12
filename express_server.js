const express = require('express');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');


/* 
HELPER FUNCTIONS
------------------------------------------- 
*/

const generateRandomString = () => {
  const possibleCharsStr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charArr = possibleCharsStr.split('');
  let randomString = '';
	
  for (let i = 0; i <= 6; i++) {
    randomString += charArr[Math.floor(Math.random() * charArr.length)];
  }
  return randomString;
};

const checkForUserByEmail = email => {
  for (const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (user, data) => {
  const userURLs = {};
  for (let url in data) {
    if (user.id === data[url].userId) {
      userURLs[url] = data[url];
    }
  }
  return userURLs;
};

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
    password: "peach"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "1234"
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
  const user = users[req.cookies['user_id']];
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
    user: users[req.cookies['user_id']]
  }
  const user_id = req.cookies.user_id;
  if (!user_id) {
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

// Page for specific URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { 
    shortURL,
    longURL,
    user: users[req.cookies['user_id']]
    };
  res.render("urls_show", templateVars);
});

// Leads to website stored in LongURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  res.redirect(longURL);
});

// Registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  const user_id = req.cookies.user_id;
  if (user_id) {
    return res.redirect('/urls');
  }
  res.render('user_register', templateVars);
});

// Login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  const user_id = req.cookies.user_id;
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
    userId: req.cookies.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

// Deletes a URL from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.cookies['user_id']];
  const shortURL = req.params.shortURL;
  if (user.id === urlDatabase[shortURL].userId) {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
  return res.status(400).send('You cannot perform this action!');
});

// Edits a URL from urlDatabase
app.post('/urls/:shortURL/edit', (req, res) => {
  const user = users[req.cookies['user_id']];
  const shortURL = req.params.shortURL;
  if (user.id === urlDatabase[shortURL].userId) {
    urlDatabase[shortURL].longURL = req.body['new-url'];
   return res.redirect(`/urls`);
  }
  res.status(400).send('You cannot perform this action!');
});

// Authenticates an already registered user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('email and password cannot be blank');
  }
  
  const user = checkForUserByEmail(email);
  console.log(user.password);
  if (!user) {
    return res.status(403).send('No user with that email is registered');
  }

  // if (!bcrypt.compareSync(password, user.password)) {
  //   return res.status(403).send('Wrong password. Please try again.')
  // }
  
  res.cookie('user_id', user['id']);
  
  res.redirect('/urls');
});

// Logs the user out
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Creates a new user and stores them in the users object
app.post('/register', (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  if (!email || !password) {
   return res.status(400).send('email and password cannot be blank');
  } 
  const user = checkForUserByEmail(email);

  if (user) {
    return res.status(400).send('This user already exists. Please log in');
  }

  users[user_id] = {
    id : user_id,
    email,
    password: hashedPassword
  }
  res.cookie('user_id', user_id);
  
  res.redirect('/urls');
});

/* 
LISTEN TO PORT
------------------------------------------- 
*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
