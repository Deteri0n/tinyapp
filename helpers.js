let generateRandomString = () => Math.random().toString(36).substring(2,8);

/*Look in an object if the string is included. Return the user or null.*/
let emailLookUp = (emailString, objOfObj) => {
  for (let o in objOfObj) {
    if (objOfObj[o].email === emailString) {
      return objOfObj[o];
    }
  }
  return null;
};

/*Return an object of objects which contain the id provided */
let urlsForUser = (id, objOfObj) => {
  let result = {};
  for (let o in objOfObj) {
    if (objOfObj[o].userID === id) {
      result[o] = objOfObj[o];
    }
  }
  return result;
};

module.exports = {generateRandomString, emailLookUp, urlsForUser};