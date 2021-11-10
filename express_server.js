const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
	const possibleCharsStr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const charArr = possibleCharsStr.split('');
	let randomString = '';
	
	for (let i = 0; i <= 6; i++) {
		randomString += charArr[Math.floor(Math.random() * charArr.length)];
	}
	return randomString;
}
app.set('view engine', 'ejs');

const urlDatabase = {
	"b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
	res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
	const templateVars = { urls: urlDatabase };
	res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
	res.render('urls_new')
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
	const longURL = req.body['longURL']
	const shortURL = generateRandomString();
	urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`);
});
