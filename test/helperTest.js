const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helperFunctions.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('Should return null when given a non-existent email', function() {
    const user = getUserByEmail("bad@email.com", testUsers);
    const expectedOutput = null;
    assert.strictEqual(user, expectedOutput);
  });
});

