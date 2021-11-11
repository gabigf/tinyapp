const express = require('express');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');


////// HELPER FUNCTIONS //////

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

////// DATA //////

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "1234"
  }
}

////// GET REQUESTS //////

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
    };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render('user_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render('user_login', templateVars);
});


////// POST REQUESTS //////

app.post("/urls", (req, res) => {
  const longURL = req.body['longURL'];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
	const shortURL = req.params.shortURL;
	urlDatabase[shortURL] = req.body['new-url'];
	res.redirect(`/urls`)
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('email and password cannot be blank');
  }
  
  const user = checkForUserByEmail(email);
  
  
  if (!user) {
    return res.status(403).send('No user with that email is registered');
  }

  if (user.password !== password) {
    return res.status(403).send('Wrong password. Please try again.')
  }
  
  res.cookie('user_id', user['id']);
  
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
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
    password
  }
  res.cookie('user_id', user_id);
  
  res.redirect('/urls');
});

////// LISTEN TO PORT //////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
