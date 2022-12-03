const mongoCollections = require("./../config/mongoCollections");
const helpers = require("./../helpers");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");
const connection = require("../config/mongoConnection");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

//creates a user and adds it to the mongo database
const createUser = async (username, password) => {};

//checks to see if the user is currently authenticated
const checkUserAuth = async (username, password) => {};

module.exports = {
  createUser,
  checkUserAuth,
};
