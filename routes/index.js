const express = require("express");
const router = express.Router();

///////////////DATABASE////////////////////////////

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

///////////////URL_INDEX//////////////////////////
router.get("/urls", (req, res) => {
 const user = req.cookies["username"]; 
 console.log(user)
  if (!user) {
    return res.redirect("/login");
  }
  console.log('user found');
  let templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


///////////////URL_NEW//////////////////////////
router.get("/urls/new", (req, res) => {
  if (!req.cookies["username"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", { user: users[(req.cookies["username"])] });
  }
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//NEW AND SHOW

router.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL], user: users[(req.cookies["username"])] };
  for (let shortURL in urlDatabase) {
    if (shortURL === req.params.shortURL) {
      longUrl = urlDatabase[shortURL];
    }
  }
  res.render("urls_show", templateVars);
});


router.post("/urls/new", (req, res) => {
  let longURL = req.body;
  let shortURL = generateRandomString(req.params);
});

router.get("/u/:shortURL", (req, res) => {
  const { longURL } = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//NEW SHORTURL
router.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.cookies["username"];
  res.redirect(`/urls/${shortURL}`);
})


router.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const LongURL = req.body.LongURL;
  urlDatabase[shortURL].longURL = LongURL;
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
  const string_length = 6;
  let randomstring = '';
  for (let i = 0; i < string_length; i++) {
    let rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return urlDatabase.randomstring = '';
}

///////////////LOGIN//////////////////////////
router.get("/login", (req, res) => {
  res.render("login", { user: req.cookies["username"] });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  for (key in users) {
    if (users[key].email === email) {
      console.log('email is correct:', email);
      if (users[key].password === password) {
        console.log('password is correct:', password);
        res.cookie("username", email);
        res.redirect("/urls");
      }
    } else {
      res.send("Incorrect username and/or password!");
    }
  } 
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


router.post("/logout", function (req, res) {
 res.clearCookie('username')
  res.redirect("/urls");
});

///////////////REGISTRATION PAGE//////////////////////////
router.get("/register", (req, res) => {
  res.render("register", { user: req.cookies["username"] });
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
  users[id] = { id, email, password };
  res.cookie("username", id);
  res.redirect("/urls");
})
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const emailLookup = () => {
  for (key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}

module.exports = router;
