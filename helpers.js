const mongoCollections = require("./config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");

let letters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

let upperLetters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

let numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

let special = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

//Checks if user password is existant, contains 6+ chars, and includes at least one special char/num/uppercase
let checkUserPassword = (password) => {
  if (!password) throw "You must supply a password!";

  if (typeof password !== "string") throw "Username must be a string";

  password = password.trim();
  if (password === "") {
    throw "Password is empty spaces";
  }
  if (password.length < 6) {
    throw "Password must be at least 6 characters";
  }
  if (password.includes(" ")) {
    throw "Password can't contain empty spaces";
  }

  let oneUpper = false;
  let oneNum = false;
  let oneSpecial = false;

  for (let i = 0; i < password.length; i++) {
    //check for password conditions
    if (upperLetters.includes(password[i])) {
      oneUpper = true;
    }
    if (numbers.includes(password[i])) {
      oneNum = true;
    }
  }

  oneSpecial = special.test(password);

  if (!oneUpper || !oneNum || !oneSpecial) {
    throw "Password must have one uppercase letter, one number, and one special character";
  }
};

//throws an error if the given input is not valid.
let checkUserInfo = (input) => {
  if (!input) {
    throw "You must supply a valid input!";
  }
  if (typeof input !== "string") {
    throw "input must be a string";
  }

  input = input.trim();
  if (input === "") {
    throw "input can't be empty spaces";
  }
  if (input.includes(" ")) {
    throw "input can't contain empty spaces";
  }

  input = input.toLowerCase();
  for (let i = 0; i < input.length; i++) {
    if (!letters.includes(input[i]) && !numbers.includes(input[i])) {
      throw "input must only contain alphanumeric characters";
    }
  }
};

/* CHECK USER INFO */
// check username
let validUsername = (username) => {
  // username must be supplied
  if (!username) throw "Please provide a username";
  // username should be a valid string (no empty spaces, no spaces in username and only alphanumeric characters)
  if (typeof username !== "string" || username.trim().length === 0)
    throw "Username must be a non-empty string";
  username = username.trim().toLowerCase;
  if (username.length < 4 || !/^[A-Za-z0-9]*$/.test(username))
    throw "Username must be alphanumeric and at least 4 characters";
};

// check email
let validEmail = (email) => {
  // email must be supplied
  if (!email) throw "Please provide email";
  // email should be a valid string (no empty spaces, no spaces in email and only alphanumeric characters besides "@" and ".")
  if (typeof email !== "string" || email.trim().length === 0)
    throw "Email must be a non-empty string";
  email = email.trim().toLowerCase();
  // split email at "@" to check for username and stevens email
  const splitEmail = email.split('@');
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
const validCWID = (cwid) => {
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

module.exports = {
  checkUserPassword,
  checkUserInfo,
  validUsername,
  validEmail,
  validPW,
  validCWID,
};
