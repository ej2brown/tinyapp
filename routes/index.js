const express = require("express");
const router = express.Router();

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//routes HTTP GET requests --> homepage
router.get("/", (req, res) => {
  res.redirect("/urls");
});


// router.post("/urls", (req, res) => {
//   let longURL = req.body; 
//   let shortURL = generateRandomString();
//   urlDatabase[shortURL] = longURL;
//   res.send("Ok");
// });

/*routes Gets Requests */
router.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

router.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// router.post("/urls/new", (req, res) => {
//   let longURL = req.body; 
//   let shortURL = generateRandomString(req.params);

// });

router.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  for (let shortURL in urlDatabase) {
    if (shortURL === req.params.shortURL) {
      longUrl = urlDatabase[shortURL];
    }
  }
 res.render("urls_show", templateVars);

});


router.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})


// router.post("/urls/urls_show", (req, res) => {
//   urlDatabase[shortURL] = longURL;  
// })

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


/*practice 

to see a JSON string representing the entire urlDatabase object

router.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

router.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); */

module.exports = router;
