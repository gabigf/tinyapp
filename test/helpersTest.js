const { assert } = require('chai');

const { checkForUserByEmail } = require('../helpers.js');

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

describe('checkForUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkForUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

	it('should return undefined if there is a non-existent email', () => {
		const user = checkForUserByEmail('peach@email.com', testUsers);
		assert.isUndefined(user);
	});
});