const generateRandomString = () => {
    const possibleCharsStr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charArr = possibleCharsStr.split('');
    let randomString = '';
      
    for (let i = 0; i <= 6; i++) {
      randomString += charArr[Math.floor(Math.random() * charArr.length)];
    }
    return randomString;
  };
  
  const checkForUserByEmail = (email, database) => {
    for (const userId in database) {
      const user = database[userId];
      if(user.email === email) {
        return user;
      }
    }
    return undefined;
  };
  
  const urlsForUser = (user, database) => {
    const userURLs = {};
    for (let url in database) {
      if (user.id === database[url].userId) {
        userURLs[url] = database[url];
      }
    }
    return userURLs;
  };

  module.exports = { generateRandomString, checkForUserByEmail, urlsForUser };