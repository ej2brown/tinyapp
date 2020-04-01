const express = require('express');
const router = express.Router();  //allows router to handle all route requests

const bcrypt = require('bcrypt'); //for encrypted cookies and sessions
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

const { getUserByEmail,
  generateRandomString,
  getUserByShortURL,
  getUserById
} = require('../helpers');

router.use(methodOverride('_method'));  //allows us to modify the form method from PUT or DELETE

router.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

/* DATABASES 
    1) list of short and corresponding long URLs for a given user ID
    2) list of user information for a given user ID
*/
const urlDatabase = {
  'userRandomID': {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    '9sm5xK': 'http://www.google.com'
  },
  'user2RandomID': {
    'vHdhJq': 'http://www.example.com',
    '4CzNn7': 'http://www.youtube.com'
  },
  'user3RandomID': {
    'jodhJq': 'http://www.facebook.com',
    'g7zNn7': 'http://www.gmail.com'
  }
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    hashedPassword: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    hashedPassword: bcrypt.hashSync('dishwasher-funk', 10)
  },
  'user3RandomID': {
    id: 'user3RandomID',
    email: 'u3@u.com',
    hashedPassword: bcrypt.hashSync('u3', 10)
  }
};

/* GET REQUESTS 
  note: return placed to prevent "Can't set headers after they are sent" */

//homepage 
router.get('/', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  } else {
    return res.redirect('/urls');
  }
});

//renders index url page showing a list of users short URLS matching long URL
router.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.render('error', { error: 'not logged in - please login or register' });
  }

  //user is logged in:
  if (req.session.user_id) {
    const id = req.session.user_id;
    let templateVars = {
      urls: urlDatabase[id],
      user: users[(req.session.user_id)]
    };
    res.render('urls_index', templateVars); //render urls_index
  }
});

//if user is logged in: a form which contains a text input field for a long URL
router.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  if (req.session.user_id) {
    const id = req.session.user_id;
    let templateVars = {
      urls: urlDatabase[id],
      user: users[(req.session.user_id)]
    };
    res.render('urls_new', templateVars);
  }
});

//if user is logged in and owns the URL for the given ID: shows short URL, long URL and option to change long URL
router.get('/urls/:shortURL', (req, res) => {
  //if user is not logged in
  if (!(req.session.user_id)) {
    res.render('error', { error: 'not logged in - please login or register' });
  }
  const id = req.session.user_id;
  let shortURL = req.params.shortURL;
  // if user is logged in, see if url matches that user
  if (id) {
    //if a URL for the given ID does not exist:
    if (!getUserByShortURL(shortURL, urlDatabase)) {
      res.render('error', { error: 'The URL entered does not exist' });
    }
    //if user is logged it but does not own the URL with the given ID:
    if (getUserByShortURL(shortURL, urlDatabase) !== id) {
      res.render('error', { error: 'The URL entered belongs to another user -please enter an URL that belongs to your account' });
    }

    //if user is logged in and owns the URL for the given ID:
    let templateVars = {
      shortURL,
      longURL: urlDatabase[id][shortURL],
      user: users[(req.session.user_id)]
    }
    res.render('urls_show', templateVars);
  }
});

//if URL exists, direct to long URL page
router.get('/u/:shortURL', (req, res) => {
  let longURL;
  for (const userIds in urlDatabase) {
    for (const shortUrls in urlDatabase[userIds]) {
      if (shortUrls === req.params.shortURL) {
        longURL = urlDatabase[userIds][shortUrls];
      }
    }
  }
  if (longURL) {
    return res.redirect(longURL);
  }
  if (!longURL) {
    res.render('error', { error: 'URL does not exist' });
  }
});


/* POST REQUESTS */

//generates a short URL, saves it, and associates it with the user
router.post('/urls', (req, res) => {

  if (!(req.session.user_id)) {
    res.render('error', { error: 'Not logged in - please login or register' });
  }

  const newShortURL = generateRandomString();
  const id = req.session.user_id;

  // const userId = getUserById(id, users);
  urlDatabase[id] = { [newShortURL]: req.body.longURL };

  return res.redirect(`/urls/${newShortURL}`);
})

router.post('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  const userId = getUserById(id, users);
  const shortURL = req.params.shortURL;
  //if user is not logged in
  if (!userId) {
    res.render('error', { error: 'Not logged in - please login or register' });
  }
  //if a URL for the given ID does not exist:
  if (!getUserByShortURL(shortURL, urlDatabase)) {
    res.render('error', { error: 'The URL entered does not exist' });
  }
  //if user is logged it but does not own the URL with the given ID:
  if (getUserByShortURL(shortURL, urlDatabase) !== userId) {
    res.render('error', { error: 'The URL entered belongs to another user -please enter an URL that belongs to your account' });
  }
  
  urlDatabase[id] = { [shortURL]: req.body.longURL };
  return res.redirect('/urls');
});

//uses method override in <form> to use the delete method
router.delete('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;

  if (!userId) {
    res.render('error', { error: 'Not logged in - please login or register' });
  }
  if (!getUserByShortURL(shortURL, urlDatabase)) {
    res.render('error', { error: 'The URL entered does not exist' });
  }
  if (getUserByShortURL(shortURL, urlDatabase) !== userId) {
    res.render('error', { error: 'The URL entered belongs to another user -please enter an URL that belongs to your account' });
  }
  if (getUserByShortURL(shortURL, urlDatabase) === userId) {
    delete urlDatabase[userId][shortURL];
    return res.redirect('/urls');
  } else {
    res.send('failed');
  }
})


/* LOGIN / REGISTRATION PAGE */
router.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.render('login', { user: users[(req.session.user_id)] }); //render login
});

router.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render('register', { user: users[(req.session.user_id)] }); //render register
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const userId = getUserByEmail(email, users);

  if (!userId || !bcrypt.compareSync(password, users[userId].hashedPassword)) {
    res.status(403).send('Login Error: incorrect username and/or password!');
  } else {
    req.session.user_id = users[userId].id; //set use_id vHdhJqon session
    return res.redirect('/urls');
  }
});

//add a new user to the user database
router.post('/register', (req, res) => {
  //collects information filled out on the registration page
  const { email, password } = req.body;

  //error check
  if (!email || !password) {
    res.status(400).send('Error occured while filing out the form');
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('Email already exists!');
  }

  //create new user
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  users[id] = { id, email, hashedPassword };

  //set user_id on session
  req.session.user_id = id;
  return res.redirect('/urls');
});

//logout user by removing any session cookies
router.post('/logout', function (req, res) {
  req.session = null;
  return res.redirect('/urls');
});


module.exports = router;
