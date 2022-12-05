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
  if (!password)
    throw "You must supply a password!";

    if (typeof password !== "string") 
      throw "Username must be a string";

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
const checkUserInfo = async (input) => {
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
  if (input.length < 4) {
    throw "input length must be greater than 4";
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

module.exports = {
  checkUserPassword,
  checkUserInfo,
};
