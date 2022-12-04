const mongoCollections = require("./../config/mongoCollections");
const helpers = require("./../helpers");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");
const connection = require("../config/mongoConnection");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

//creates a user and adds it to the mongo database
const createUser = async (username, password) => {
  // input checking for username and password
  const validUser = await helpers.checkUserInfo(username, password);

  // check if username already exists (username should be case-insensitive)
  const userCollection = await users();
  username = username.toLowerCase();
  let found = await userCollection.findOne({ username: username });
  if (found) throw "This username has already been taken";

  // hash password using bcrypt
  const hash = await bcrypt.hash(password, saltRounds);

  let newUser = { username: username, password: hash };

  const insertUser = await userCollection.insertOne(newUser);
  if (!insertUser.acknowledged || !insertUser.insertedId) {
    throw "Could not create user";
  }

  return { insertedUser: true };
};

//checks to see if the user is currently authenticated
const checkUserAuth = async (username, password) => {
  // validate inputs
  const validUser = await helpers.checkUserInfo(username, password);

  // find user
  const userCollection = await users();
  username = username.toLowerCase();
  let exist = await userCollection.findOne({ username: username });
  if (!exist) throw "Either the username or password is invalid";

  // authenticate user
  let compare = false;

  try {
    compare = await bcrypt.compare(password, exist.password);
  } catch (e) {
    // no op
  }

  if (!compare) throw "Either the username or password is invalid";

  return { authenticatedUser: true };
};

module.exports = {
  createUser,
  checkUserAuth,
};
