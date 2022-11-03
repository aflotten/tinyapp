//check if user email is already in user database
const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};


//generate 6 random character sequence for short url & cookieID
function createRandomString(desiredLength) {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < desiredLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result;
};

module.exports = { getUserByEmail, createRandomString };