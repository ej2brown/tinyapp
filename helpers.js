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

const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

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

const shortURLFinder = (shortURL, urlDatabase) => {
  for (const userId in urlDatabase) {
    for (const shortString in userId) {
      if (shortString === shortURL) {
        return userId
      }
    }
  }
  return false;
}

    module.exports = {
      getUserByEmail,
      urlsForUsers,
      generateRandomString,
      shortURLFinder
    };