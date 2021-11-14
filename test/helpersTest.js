const { assert } = require('chai');
const { getUserByEmail } = require('../helperFunctions');

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
    assert.equal(user.id , expectedUserID);
  });

  it('should return undefined if passed an email that cannot be found in the user database', function() {
    const user = getUserByEmail("user@bitcoin.ca", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);

  });

});


