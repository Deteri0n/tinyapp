const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");

const {generateRandomString, emailLookUp, urlsForUser} = require('./helpers');


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));



const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};


/*
** GET Methods handling
*/

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (req.session && Object.keys(req.session).length) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: users[req.session.user_id] ? users[req.session.user_id] : null,
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("You must be registered or logged in to see the content of this page").end();
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id] ? users[req.session.user_id] : null,
  };
  if (req.session && Object.keys(req.session).length) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("../login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id] ? users[req.session.user_id] : null,
      shortURL: req.params.shortURL,
      longURL : urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id && req.session.user_id) {
    res.send("This is not one of your short URLs").end();
  } else {
    res.send("You must be registered or logged in to see the content of this page").end();
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id] ? users[req.session.user_id] : null,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id] ? users[req.session.user_id] : null,
  };
  res.render("login", templateVars);
});


/*
** POST Methods handling
*/

app.post("/urls", (req, res) => {
  let idShortULR = generateRandomString();
  urlDatabase[idShortULR] = {
    longURL : req.body.longURL,
    userID : req.session.user_id
  };
  const templateVars = {
    user: users[req.session.user_id] ? users[req.session.user_id] : null,
    shortURL: idShortULR,
    longURL : req.body.longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id && req.session.user_id) {
    res.send("This is not one of your short URLs").end();
  } else {
    res.send("You must be registered or logged in to see the content of this page").end();
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id && req.session.user_id) {
    res.send("This is not one of your short URLs").end();
  } else {
    res.send("You must be registered or logged in to see the content of this page").end();
  }
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(404).send("Invalid email or password");
  } else if (emailLookUp(req.body.email, users)) {
    res.status(404).send("Email already taken");
  } else {
    let userId = generateRandomString();
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userId] = {
      userId,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = userId;
    res.redirect("urls");
  }
});

app.post("/login", (req, res) => {
  let {email, password} = req.body;
  let currentUser = emailLookUp(email, users);
  if (currentUser) {
    let passwordIsCorrect = bcrypt.compareSync(password, currentUser.password);
    if (currentUser && passwordIsCorrect) {
      req.session.user_id = currentUser.userId;
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid email or password");
    }
  } else {
    res.status(403).send("Invalid email or password");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});