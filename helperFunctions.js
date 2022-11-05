/* returns URLs where userID equals id of logged in user and update code to:
only display urls if the user is logged in and show urls that belong to the user when logged in */

const urlsForUser = (id, database) => {
  let userURLs = {};
  for (const url in database) {
    if (database[url] !== undefined) {
      if (id === database[url].userID) {
        userURLs[url] = database[url];
      }
    }
  }
  return userURLs;
};

//check if user email is already in user database
const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};


//generate 6 random character sequence for short url & cookieID
function createRandomString(desiredLength) {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < desiredLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = { getUserByEmail, createRandomString, urlsForUser };