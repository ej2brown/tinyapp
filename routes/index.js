const express = require("express");
const router = express.Router();

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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
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
  if (!userId) {
    return res.redirect("/login");
  }
  console.log(userId);
  console.log(users);
  console.log('user found');
  console.log(users[userId]);
  console.log(users[userId].email);
  let templateVars = { urls: urlDatabase[userId], 
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
  let templateVars = { shortURL: req.params.shortURL, 
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
  const { longURL } = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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
})


router.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.cookies["user"];
  if (urlDatabase[shortURL] && urlDatabase[shortURL].user === user) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("failed");
  }
})

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
}

///////////////LOGIN PAGE////////////////////////////////
router.get("/login", (req, res) => {
  res.render("login", { user: req.cookies["user_id"] });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = emailLookup(email);
  console.log('email exists:', email);
  console.log('user exists:', userId);
  if (!userId || users[userId].password !== password) {
    res.status(403).send("Login Error: incorrect username and/or password!");
  }
    console.log('password is correct:', password);
    res.cookie("user_id", email);
    res.redirect("/urls");
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


router.post("/logout", function (req, res) {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

///////////////REGISTRATION PAGE///////////////////////////////
router.get("/register", (req, res) => {
  res.render("register", { user: req.cookies["user_id"] });
})

//add a new user object to the global users object
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Error occured while filing out the form");
  } else if (emailLookup(email)) {
    res.status(400).send("Email already exists!");
  }
  const id = generateRandomString();
  console.log(id)
  users[id] = { id, email, password };
  console.log(users[id])
  console.log(users)
  res.cookie("user_id", id);
  res.redirect("/urls");
})
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const emailLookup = (email) => {
  for (key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return false;
}

module.exports = router;
