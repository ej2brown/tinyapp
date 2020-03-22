const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { emailLookupUser, urlsForUsers, generateRandomString, shortURLFinder } = require('../functions');

router.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

/////////////// DATABASES ////////////////////////////
const urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  },
  "user2RandomID": {
    "vHdhJq": "http://www.example.com",
    "4CzNn7": "http://www.youtube.com"
  },
  "user3RandomID": {
    "vHdhJq": "http://www.example.com",
    "4CzNn7": "http://www.youtube.com"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "u3@u.com",
    hashedPassword: bcrypt.hashSync("u3", 10)
  }
};
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

////////////////// GET REQUESTS /////////////////////////

//homepage 
router.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

//if user is logged in: renders index url page showing a list of users short URLS matching long URL
router.get("/urls", (req, res) => {
  console.log(req.session.user_id)
  const userId = req.session.user_id;
  if (req.session.user_id) {
    let templateVars = {
      urls: urlDatabase[req.session.user_id],
      user: req.session.user_id,
      email: users[userId].email
    };
    res.render("urls_index", templateVars);
  }
  res.render("error", { error: "not logged in - please login or register" });
});

//if user is logged in: a form which contains a text input field for a long URL
router.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", { email: users[req.session.user_id].email, user: users[req.session.user_id] });
  }
});

//if user is logged in and owns the URL for the given ID:
router.get("/urls/:shortURL", (req, res) => {
  let userId = req.session.user_id;
  let shortURL = req.params.shortURL;
  //if user is not logged in
  if (!userId) {
    res.render("error", { error: "not logged in - please login or register" });
  }
// if user is logged in, see if url matches that user
  if (userId) {
    let templateVars = {
      user: userId,
      shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      email: users[userId].email
    }
    //if a URL for the given ID does not exist:
    if (!shortURLFinder(shortURL, urlDatabase)) {
      res.render("error", { templateVars, error: "The URL entered does not exist" });
    }
    //if user is logged it but does not own the URL with the given ID:
    if (shortURLFinder(shortURL, urlDatabase) !== userId) {
      res.render("error", { templateVars, error: "The URL entered belongs to another user -please enter an URL that belongs to your account" });
    }
    //if user is logged in and owns the URL for the given ID:
    res.render("urls_show", templateVars);
  }
});

//if URL exists, direct to long URL page
router.get("/u/:shortURL", (req, res) => {
  let longURL;
  for (const userIds in urlDatabase) {
    for (const shortUrls in urlDatabase[userIds]) {
      if (shortUrls === req.params.shortURL) {
        longURL = urlDatabase[userIds][shortUrls];
      }
    }
  }
  if (longURL) {
    res.redirect(longURL);
  }
  if (!longURL) {
    res.render("error", { user: req.session.user_id, error: "URL does not exist" });
  }
});

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

////////////////// POST REQUESTS ///////////////////////
//generates a short URL, saves it, and associates it with the user
router.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.render("error", { error: "not logged in - please login or register" });
  }
  const userId = req.session.user_id;
  const id = generateRandomString();
  users[userId] = id;
  console.log(users)
  res.redirect(`/urls/${id}`);
})

router.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  //if user is not logged in
  if (!userId) {
    res.render("error", { user: userId, error: "not logged in - please login or register" });
  }
  //if a URL for the given ID does not exist:
  if (!shortURLFinder(shortURL, urlDatabase)) {
    res.render("error", { user: userId, error: "The URL entered does not exist" });
  }
  //if user is logged it but does not own the URL with the given ID:
  if (shortURLFinder(shortURL, urlDatabase) !== userId) {
    res.render("error", { user: userId, error: "The URL entered belongs to another user -please enter an URL that belongs to your account" });
  }

  urlDatabase.userId.shortURL = req.body.longURL;
  res.redirect("/urls");
});

router.post("/urls/:userId/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  if (urlDatabase[userId][shortURL] && urlDatabase.userId === userId) {
    delete urlDatabase[userId][shortURL];
    res.redirect("/urls");
  } else {
    res.send("failed");
  }
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/////////////// LOGIN / REGISTRATION PAGE ///////////////////////
router.get("/login", (req, res) => {
  res.render("login", { user: req.session.user_id });
});

router.get("/register", (req, res) => {
  res.render("register", { user: users[req.session.user_id] });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = emailLookupUser(email, users);
  console.log('user logged in', req.body);
  if (!userId || !bcrypt.compareSync(password, users[userId].hashedPassword)) {
    res.status(403).send("Login Error: incorrect username and/or password!");
  } else {
    console.log('password is correct:');
    req.session.user_id = userId; //set use_id vHdhJqon session
    res.redirect("/urls");
  }
});

//add a new user to the user database
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !hashedPassword) {
    res.status(400).send("Error occured while filing out the form");
  } else if (emailLookupUser(email)) {
    res.status(400).send("Email already exists!");
  }
  const userId = generateRandomString();
  users[userId] = { userId, email, hashedPassword };
  req.session.user_id = users[userId]; //set use_id on session
  res.redirect("/urls");
});

router.post("/logout", function (req, res) {
  req.session = null;
  res.redirect("/urls");
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

module.exports = router;
