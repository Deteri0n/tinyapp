const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};


//Functions

let generateRandomString = () => Math.random().toString(36).substring(2,8);

/*Look in an object if the string is included. Return the user or null.*/
let emailLookUp = (emailString, objOfObj) => {
  for (let o in objOfObj) {
    if (objOfObj[o].email === emailString) {
      return objOfObj[o];
    }
  }
  return null;
};

//Methods handling

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
    shortURL: req.params.shortURL,
    longURL : urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
  };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;

  const templateVars = {
    user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
    shortURL: id,
    longURL : req.body.longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(404).send("Invalid email or password");
  } else if (emailLookUp(req.body.email, users)) {
    res.status(404).send("Email already taken");
  } else {
    let userId = generateRandomString();
    users[userId] = {
      userId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", userId);
    res.redirect("urls");
  }
});

app.post("/login", (req, res) => {
  let {email, password} = req.body;
  let currentUser = emailLookUp(email, users);
  if (currentUser && password === currentUser.password) {
    res.cookie("user_id", currentUser.userId);
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});