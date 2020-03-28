//generates a sring for users id 
const generateRandomString = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  const stringLength = 6;
  let randomString = '';
  for (let i = 0; i < stringLength; i++) {
    let rnum = Math.floor(Math.random() * chars.length);
    randomString += chars.substring(rnum, rnum + 1);
  }
  return randomString;
}

//search users list for user is matching the email
const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

//searches url database for urls matching the users id
const urlsForUsers = (userId, urlDatabase) => {
  const url = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key] === userId) {
      for (const key in urlDatabase[userId]) {
        url[key] = urlDatabase[userId][key];
      }
    }
    return url;
  }
}

//searches url database for user id matching the string id
const getUserByShortURL = (shortURL, urlDatabase) => {
  console.log("SHORT", shortURL)
  for (const userId in urlDatabase) {
    for (const dbShortURL in urlDatabase[userId]) {
      console.log("DBSHORT", dbShortURL)
      if (dbShortURL === shortURL) {
        return userId
      }
    }
  }
  return false;
}

//searches users list for matching id
const getUserById = (id, users) => {
  for (const userId in users) {
    if (userId === id) {
      return userId;
    }
  }
  return undefined;
}


module.exports = {
  getUserByEmail,
  urlsForUsers,
  generateRandomString,
  getUserByShortURL,
  getUserById,
};