const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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
  it('should return the corresponding user id (userRandomID) from the target email ("user@example.com")', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined for an email that is not in the testUsers database', function() {
    const user = getUserByEmail("notauser@notexample.notcom", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
