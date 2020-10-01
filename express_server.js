const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
const {generateRandomString, getUserByEmail, urlsForUser, getUserId, checkItsHisContent, getObj, getShortURL} = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

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
** Launch server
*/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


/*
** GET Methods handling
*/


app.get("/", (req, res) => {
  let user_id = getUserId(req);

  if (user_id) {
    res.redirect("urls");
  } else {
    res.redirect("/login");
  }
});


app.get("/urls", (req, res) => {
  let user_id = getUserId(req);

  if (user_id) {
    const templateVars = {
      urls: urlsForUser(user_id, urlDatabase),
      user: users[user_id],
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("You must be registered or logged in to see the content of this page\n").end();
  }
});


app.get("/urls/new", (req, res) => {
  let user_id = getUserId(req);

  if (user_id) {
    const templateVars = {
      user: users[user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("../login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  
  let objShortURL = getObj(req, urlDatabase);
  
  if (!objShortURL) {
    res.send("Invalid short URL").end();
  } else {
    let user_id = getUserId(req);
    let isHisContent = checkItsHisContent(req, urlDatabase);
    let shortURL = getShortURL(req);

    if (isHisContent) {
      const templateVars = {
        user: users[user_id],
        shortURL: shortURL,
        longURL : objShortURL.longURL
      };
      res.render("urls_show", templateVars);
    } else if (!isHisContent && user_id) {
      res.send("This is not one of your short URLs\n").end();
    } else {
      res.send("You must be registered or logged in to see the content of this page\n").end();
    }
  }
});


app.get("/u/:shortURL", (req, res) => {
  let objShortURL = getObj(req, urlDatabase);
  const longURL = objShortURL.longURL;
  res.redirect(longURL);
});


app.get("/register", (req, res) => {
  let user_id = getUserId(req);
  if (user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[user_id] ? users[user_id] : null,
    };
    res.render("register", templateVars);
  }
});


app.get("/login", (req, res) => {
  let user_id = getUserId(req);
  if (user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[user_id] ? users[user_id] : null,
    };
    res.render("login", templateVars);
  }
});



/*
** POST Methods handling
*/


app.post("/urls", (req, res) => {
  let user_id = getUserId(req);
  if (user_id) {
    let idShortULR = generateRandomString();
    urlDatabase[idShortULR] = {
      longURL : req.body.longURL,
      userID : user_id
    };
    res.redirect(`/urls/${idShortULR}`);
  } else {
    res.send("You must be registered or logged in to modify the content of this page\n").end();
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let user_id = getUserId(req);
  let isHisContent = checkItsHisContent(req, urlDatabase);

  if (isHisContent) {
    let shortURL = getShortURL(req);
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else if (!isHisContent && user_id) {
    res.send("This is not one of your short URLs\n").end();
  } else {
    res.send("You must be registered or logged in to modify the content of this page\n").end();
  }
});


app.post("/urls/:shortURL/", (req, res) => {
  let user_id = getUserId(req);
  let isHisContent = checkItsHisContent(req, urlDatabase);

  if (isHisContent) {
    let objShortURL = getObj(req, urlDatabase);
    objShortURL.longURL = req.body.longURL;
    res.redirect("/urls");
  } else if (!isHisContent && user_id) {
    res.send("This is not one of your short URLs").end();
  } else {
    res.send("You must be registered or logged in to modify the content of this page\n").end();
  }
});


app.post("/register", (req, res) => {
  let {email, password} = req.body;
  let registeredUser = getUserByEmail(email, users);
  
  if (!email || !password) {
    res.status(404).send("Invalid email or password\n");
  } else if (registeredUser) {
    res.status(404).send("Email already taken\n");
  } else {
    
    let userId = generateRandomString();
    let hashedPassword = bcrypt.hashSync(password, 10);
    users[userId] = {
      userId,
      email,
      password: hashedPassword
    };
    req.session.user_id = userId;
    res.redirect("urls");
  }
});


app.post("/login", (req, res) => {
  let {email, password} = req.body;
  let registeredUser = getUserByEmail(email, users);
  
  if (registeredUser) {
    let passwordIsCorrect = bcrypt.compareSync(password, registeredUser.password);
    
    if (passwordIsCorrect) {
      req.session.user_id = registeredUser.userId;
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid email or password\n");
    }
  } else {
    res.status(403).send("Invalid email or password\n");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});