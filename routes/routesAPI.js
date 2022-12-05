//require express, express router and bcrypt as shown in lecture code
const data = require("../data");
const userData = data.users;
const express = require("express");
const router = express.Router();
const helpers = require("../helpers");

router.route("/").get(async (req, res) => {
  //code here for GET
  res.render("login", {
    title: "Spotter-fy",
  });
});

router
  .route("/login")
  .get(async (req, res) => {
    //code here for GET
    res.render("login", {
      title: "Spotter-fy",
    });
  })
  .post(async (req, res) => {
    //code here for POST
  });

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    res.render("register", {
      title: "Spotter-fy",
    });
  })
  /* Post route to verify user register data and submit post request to add to database */
  .post(async (req, res) => {
    let cwid = req.body.cwidInput
    let firstName = req.body.firstNameInput;
    let lastName = req.body.lastNameInput;
    let email = req.body.emailInput;
    let year = req.body.classInput;
    let password = req.body.passwordInput; 

    try{
      helpers.checkUserInfo(firstName);
      helpers.checkUserInfo(lastName);
      helpers.validCWID(cwid);
      helpers.validEmail(email);
      helpers.validPW(password);

    const createdUser = await userData.createUser(firstName, lastName, email, cwid, year, password);

    if(typeof createdUser === "undefined")
      return res.status(500).json({error: "Internal Server Error"});
    else
      res.redirect('/login')

    }catch(e){
      return res.status(400).json({error: e});
    }
  });

router.route("/profile").get(async (req, res) => {
  //code here for GET
  res.render("profile", {
    title: "Spotter-fy",
  });
});

router
  .route("/reserve")
  .get(async (req, res) => {
    //code here for GET
    res.render("reserve", {
      title: "Spotter-fy",
    });
  })
  .post(async (req, res) => {
    //code here for POST
  });

module.exports = router;
