//require express, express router and bcrypt as shown in lecture code
const data = require("../data");
const userData = data.users;
const express = require("express");
const router = express.Router();
// const helpers = require("../helpers");

router.route("/").get(async (req, res) => {
  //code here for GET
});

router
  .route("/login")
  .get(async (req, res) => {
    //code here for GET
  })
  .post(async (req, res) => {
    //code here for POST
  });

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
  })
  .post(async (req, res) => {
    //code here for POST
  });

router.route("/profile").get(async (req, res) => {
  //code here for GET
});

router
  .route("/reserve")
  .get(async (req, res) => {
    //code here for GET
  })
  .post(async (req, res) => {
    //code here for POST
  });

module.exports = router;
