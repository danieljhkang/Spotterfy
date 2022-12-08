const mongoCollections = require("./config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId, Db } = require("mongodb");
const { dbConnection } = require("./config/mongoConnection");

/* CHECK USER INFO */
// check username
let validUsername = (username) => {
  // username must be supplied
  if (!username) throw "Please provide a username";
  // username should be a valid string (no empty spaces, no spaces in username and only alphanumeric characters)
  if (typeof username !== "string" || username.trim().length === 0)
    throw "Username must be a non-empty string";
  username = username.trim().toLowerCase();
  if (username.length < 4 || !/^[A-Za-z0-9]*$/.test(username))
    throw "Username must be alphanumeric and at least 4 characters";
};

// check email
let validEmail = async (email) => {
  // email must be supplied
  if (!email) throw "Please provide email";
  // email should be a valid string (no empty spaces, no spaces in email and only alphanumeric characters besides "@" and ".")
  if (typeof email !== "string" || email.trim().length === 0)
    throw "Email must be a non-empty string";
  email = email.trim().toLowerCase();
  // split email at "@" to check for username and stevens email
  const splitEmail = email.split("@");
  if (splitEmail.length !== 2) throw "Please provide a valid Stevens email";
  const username = splitEmail[0];
  const stevensEmail = splitEmail[1];
  try {
    const validUN = checkUserInfo(username);
  } catch (e) {
    throw "Please provide a valid Stevens email";
  }
  if (stevensEmail !== "stevens.edu")
    throw "Please provide a valid Stevens email";
};

// check password
let validPW = (password) => {
  // password must be supplied
  if (!password) throw "Please provide a password";
  // password must be a valid string (no empty spaces, no spaces but can be any other character including special characters) and at least 6 characters long
  if (
    typeof password !== "string" ||
    password.trim().length === 0 ||
    /[ ]/.test(password)
  )
    throw "Password must be a non-empty string with no spaces";
  password = password.trim();
  if (password.length < 6) throw "Password must be at least 6 characters long";
  if (!/[A-Z]/.test(password))
    throw "Password must have at least one uppercase letter";
  if (!/[a-z]/.test(password))
    throw "Password must have at least one lowercase letter";
  if (!/[0-9]/.test(password)) throw "Password must have at least one number";
  if (!/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password))
    throw "Password must have at least one special character";
};

// check cwid
const validCWID = async (cwid) => {
  // cwid must be supplied
  if (!cwid) throw "Please provide CWID";
  // cwid should be a valid string (no empty spaces, no spaces in cwid, and only numbers) and only 8 characters long
  if (
    typeof cwid !== "string" ||
    cwid.trim().length !== 8 ||
    !/^[0-9]*$/.test(cwid.trim())
  )
    throw "CWID must be 8 digits.";
};

/* Input checking */
// check valid string
let validString = (str) => {
  // string must be supplied
  if (!str) throw "Please provide a string";
  // string should be a valid string (no empty spaces, no spaces in username and only alphanumeric characters)
  if (typeof str !== "string" || str.trim().length === 0)
    throw "String must be a non-empty string";
  str = str.trim().toLowerCase();
  if (!/^[a-z]*$/.test(str)) throw "String must be only letters";
};

module.exports = {
  validUsername,
  validEmail,
  validPW,
  validCWID,
  validString,
};
