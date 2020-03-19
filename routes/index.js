const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

///////////////DATABASE////////////////////////////

const urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  },
  "user2RandomID": {
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
  }
};
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


//routes HTTP GET requests --> homepage
router.get("/", (req, res) => {
  res.redirect("/urls");
});

//to see a JSON string representing the entire urlDatabase object
router.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//shows purpose of ejs files
router.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

///////////////////URL_INDEX/////////////////////////
router.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  // if (!userId) {
  //   return res.redirect("/login");
  // }
  let templateVars = {
    urls: urlDatabase[userId],
    user: userId,
    email: users[userId].email
  };
  res.render("urls_index", templateVars);
});

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


///////////////URL_NEW//////////////////////////////
router.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", { user: users[(req.cookies["user_id"])] });
  }
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


///////////////////////NEW URL///////////////////////
router.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.cookies["user_id"]]["shortURL"],
    user: users[userId],
    email: users[userId].email
  };
  res.render("urls_show", templateVars);
});

router.post("/urls/new", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL].longURL = LongURL;
  res.redirect("/urls");
});

router.get("/u/:shortURL", (req, res) => {
  let longURL;
  for (userIds in urlDatabase) {
    for (shortUrls in urlDatabase[userIds]) {
      if (shortUrls === req.params.shortURL) {
        longURL = urlDatabase[userIds][shortUrls];
      }
    }
    if (longURL) {
      res.redirect(longURL);
    }
    if (!longURL) {
      response.status(400).send("This short URL does not exist");
    }
  }
});

router.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.cookies["user_id"];
  res.redirect(`/urls/${shortURL}`);
})


router.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});


router.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies["user_id"];
  if (urlDatabase[userId][shortURL] && urlDatabase.userId === userId) {
    delete urlDatabase[userId][shortURL];
    res.redirect("/urls");
  } else {
    res.send("failed");
  }
});


// router.post("/urls", (req, res) => {
//   let longURL = req.body; 
//   let shortURL = generateRandomString();
//   urlDatabase[shortURL] = longURL;
//   res.send("Ok");
// });

function generateRandomString() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  const stringLength = 6;
  let randomString = '';
  for (let i = 0; i < stringLength; i++) {
    let rnum = Math.floor(Math.random() * chars.length);
    randomString += chars.substring(rnum, rnum + 1);
  }
  return randomString;
};

///////////////LOGIN PAGE////////////////////////////////
router.get("/login", (req, res) => {
  res.render("login", { user: req.cookies["user_id"] });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = emailLookup(email);
  console.log('user logged in', req.body);
  if (!userId || !bcrypt.compareSync(password, hashedPassword)) {
    res.status(403).send("Login Error: incorrect username and/or password!");
  } else {
    console.log('password is correct:');
    res.cookie("user_id", email);
    res.redirect("/urls");
  }
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


router.post("/logout", function (req, res) {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

///////////////REGISTRATION PAGE///////////////////////////////
router.get("/register", (req, res) => {
  res.render("register", { user: req.cookies["user_id"] });
});

//add a new user object to the global users object
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !hashedPassword) {
    res.status(400).send("Error occured while filing out the form");
  } else if (emailLookup(email)) {
    res.status(400).send("Email already exists!");
  }
  const id = generateRandomString();
  users[id] = { id, email, hashedPassword };
  res.cookie("user_id", id);
  res.redirect("/urls");
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const emailLookup = (email) => {
  for (key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return false;
};

const urlsForUsers = (id) => {
  const userId = id
  const url = {};
  for (key in urlDatabase) {
    if (urlDatabase[key] === userId) {
      for (key in urlDatabase[userId]) {
        url[key] = urlDatabase[userId][key];
      }
    }
    return url;
  }
}

module.exports = router;
