/*Generates a random string of 6 characters*/
const generateRandomString = () => Math.random().toString(36).substring(2,8);

/*Looks in an object if the string is included. Returns the user or undefined*/
const getUserByEmail = (emailString, objOfObj) => {
  for (let o in objOfObj) {
    if (objOfObj[o].email === emailString) {
      return objOfObj[o];
    }
  }
};

/*Returns an object which contains all the objects including the id provided */
const urlsForUser = (id, objOfObj) => {
  let result = {};
  for (let o in objOfObj) {
    if (objOfObj[o].userID === id) {
      result[o] = objOfObj[o];
    }
  }
  return result;
};

/*Returns the user_id of the request if the user is authentified or undefined*/
const getUserId = (req) => req.session.user_id;

/*Returns true or false of the request if the user is authentified or undefined*/
const checkItsHisContent = (req, objOfObj) => objOfObj[req.params.shortURL].userID === getUserId(req);

/*Returns the obj if the shortURL inside objOfObj exists, else returns undefined*/
const getObj = (req, objOfObj) => objOfObj[req.params.shortURL];
const getShortURL = (req) => req.params.shortURL;

module.exports = {generateRandomString, getUserByEmail, urlsForUser, getUserId, checkItsHisContent, getObj, getShortURL};