const express = require('express');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');


const generateRandomString = () => {
  const possibleCharsStr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charArr = possibleCharsStr.split('');
  let randomString = '';
	
  for (let i = 0; i <= 6; i++) {
    randomString += charArr[Math.floor(Math.random() * charArr.length)];
  }
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username']
    };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


////// POST REQUESTS //////

app.post("/urls", (req, res) => {
  const longURL = req.body['longURL'];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = templateVars.longURL;
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
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

////// LISTEN TO PORT //////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
