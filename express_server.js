const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  aJ48lW: {
    userId: 'aJ48lW',
    email: 'test@test.com',
    password: 'qwerty'
  }
};


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

/*Return an object of objects which contain the id provided */
let urlsForUser = (id, objOfObj) => {
  let result = {};
  for (let o in objOfObj) {
    if (objOfObj[o].userID === id) {
      result[o] = objOfObj[o];
    }
  }
  return result;
};

//Methods handling

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (req.cookies && Object.keys(req.cookies).length) {
    const templateVars = {
      urls: urlsForUser(req.cookies.user_id, urlDatabase),
      user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("You must be registered or logged in to see the content of this page").end();
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
  };
  if (req.cookies && Object.keys(req.cookies).length) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("../login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies.user_id) {
    const templateVars = {
      user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
      shortURL: req.params.shortURL,
      longURL : urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  } else if (urlDatabase[req.params.shortURL].userID !== req.cookies.user_id && req.cookies.user_id) {
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
  let idShortULR = generateRandomString();
  urlDatabase[idShortULR] = {
    longURL : req.body.longURL,
    userID : req.cookies.user_id
  };
  const templateVars = {
    user: users[req.cookies.user_id] ? users[req.cookies.user_id] : null,
    shortURL: idShortULR,
    longURL : req.body.longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
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