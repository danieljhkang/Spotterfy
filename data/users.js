const mongoCollections = require("../config/mongoCollections");
const helpers = require("../helpers");
const users = mongoCollections.users;
const hotspots = mongoCollections.hotspots;
const { ObjectId } = require("mongodb");
const connection = require("../config/mongoConnection");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

//creates a user and adds it to the mongo database, SETS VISIBILITY TO TRUE BY DEFAULT
const createUser = async (firstName, lastName, email, cwid, year, password) => {
  // check user input
  helpers.checkUserInfo(firstName);
  helpers.checkUserInfo(lastName);
  helpers.validCWID(cwid);
  helpers.validEmail(email);
  helpers.validPW(password);

  // check if user already exists
  const userCollection = await users();
  let found = await userCollection.findOne({ cwid: cwid });
  if (found) throw "This user already exists";

  // hash password using bcrypt
  const hash = await bcrypt.hash(password, saltRounds);

  let newUser = {
    cwid: cwid,
    firstName: firstName,
    lastName: lastName,
    email: email,
    hashPassword: hash,
    year: year,
    visible: true,
    previousReservations: [],
    upcomingReservations: [],
    weeklyCheckIns: 0,
    monthlyMissedReservations: 0,
  };

  const insertUser = await userCollection.insertOne(newUser);
  if (!insertUser.acknowledged || !insertUser.insertedId) {
    throw "Could not create user";
  }
  return { insertedUser: true };
};

//checks to see if the user is currently authenticated
const checkUserAuth = async (email, password) => {
  // validate inputs
  helpers.validEmail(email);
  helpers.validPW(password);

  // find user
  const userCollection = await users();
  email = email.trim().toLowerCase();
  let exist = await userCollection.findOne({ email: email });
  if (!exist) throw "The username doesn't exist";

  // authenticate user
  let compare = false;
  compare = await bcrypt.compare(password, exist.hashPassword);
  if (!compare) throw "The password is incorrect";

  return { authenticatedUser: true };
};

module.exports = {
  createUser,
  checkUserAuth,
};
