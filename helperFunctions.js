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
};

const urlDatabase = {

  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"

  }
};


// pass in an email that exists in user database 
// function returns the user object that contains that email 
const getUserByEmail = (email, database) => {
  for (const user in database) { 
    if (database[user].email === email) {
      return database[user];
  }
}
  return undefined;
};

// generates string of 6 random characters - used to create unique userID
const generateRandomString = () => {
  let output = ' ';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz0123456789';
  const charLength = characters.length;
  const maxRandomStringLength = 6;

  for(let i = 0; i < maxRandomStringLength; i++) {
    output += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return output;
}

// returns new object containing all shortURLs for specific user 
const urlForUser = (id, database) => {
  let userUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
}

module.exports = { getUserByEmail, generateRandomString, urlForUser}