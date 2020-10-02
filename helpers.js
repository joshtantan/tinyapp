const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

const idInvalid = (id, database) => {
  if (!id) {
    return true;
  }

  for (const user in database) {
    if (database[user].id == id) {
      return true;
    }
  }

  return false;
};

const emailRegistered = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  }

  return false;
};

const urlsForUser = (userID, database) => {
  const filteredURLDatabase = {};

  for (const url in database) {
    if (database[url].userID == userID) {
      filteredURLDatabase[url] = database[url];
    }
  }

  return filteredURLDatabase;
};

module.exports = {
  getUserByEmail,
  idInvalid,
  emailRegistered,
  urlsForUser
};
