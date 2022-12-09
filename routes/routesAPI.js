//require express, express router and bcrypt as shown in lecture code
const data = require("../data");
const userData = data.users;
const express = require("express");
const router = express.Router();
const helpers = require("../helpers");
const users = require("../data/users");

router.route("/").get(async (req, res) => {
  //code here for GET
  res.render("login", {
    title: "Spotterfy",
  });
});

router
  .route("/login")
  .get(async (req, res) => {
    //code here for GET
    res.render("login", {
      title: "Spotterfy",
    });
  })
  .post(async (req, res) => {
    //code here for POST
    let email = req.body.emailInput;
    let password = req.body.passwordInput;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "You must supply both an email and a password" });
    }

    try {
      helpers.validEmail(email);
      helpers.validPW(password);
    } catch (e) {
      return res.status(400).json({ error: e });
    }

    let loginUser;
    try {
      loginUser = await userData.checkUserAuth(email, password);
    } catch (e) {
      return res.status(400).json({ error: e });
    }

    if (loginUser.authenticatedUser) {
      //make a cookie
      req.session.user = { name: "AuthCookie", email: email };
      res.redirect("/homepage");
    } else {
      console.log(loginUser.authenticatedUser);
      return res.status(400).json({ error: "Failed to authenticate user" });
    }
  });

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    res.render("register", {
      title: "Spotterfy",
    });
  })
  /* Post route to verify user register data and submit post request to add to database */
  .post(async (req, res) => {
    let cwid = req.body.cwidInput;
    let firstName = req.body.firstNameInput;
    let lastName = req.body.lastNameInput;
    let email = req.body.emailInput;
    let year = req.body.classInput;
    let password = req.body.passwordInput;

    try {
      helpers.validString(firstName);
      helpers.validString(lastName);
      await helpers.validCWID(cwid);
      await helpers.validEmail(email);
      helpers.validPW(password);

      const createdUser = await userData.createUser(
        firstName,
        lastName,
        email,
        cwid,
        year,
        password
      );

      if (typeof createdUser === "undefined")
        return res.status(500).json({ error: "Internal Server Error" });
      else res.redirect("/login");
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

router.route("/profile").get(async (req, res) => {
  //code here for GET
  // get user info by email
  let email = req.session.user.email;
  let user = await userData.getUserByEmail(email);

  // get full name
  let firstName = user.firstName;
  let firstLetter = firstName.charAt(0).toUpperCase();
  let remainingLetters = firstName.slice(1);
  firstName = firstLetter + remainingLetters;
  let lastName = user.lastName;
  firstLetter = lastName.charAt(0).toUpperCase();
  remainingLetters = lastName.slice(1);
  lastName = firstLetter + remainingLetters;
  fullName = firstName + " " + lastName;

  res.render("profile", {
    title: "Spotterfy",
    fullName: fullName,
    email: email,
    cwid: user.cwid,
    weeklyCheckIns: user.weeklyCheckIns,
    monthlyMissedReservations: user.monthlyMissedReservations,
  });
});

router
  .route("/reserve")
  .get(async (req, res) => {
    //code here for GET
    res.render("reserve", {
      title: "Spotterfy",
    });
  })
  .post(async (req, res) => {
    //code here for POST
  });

router.route("/homepage").get(async (req, res) => {
  //code here for GET
  let email = req.session.user.email;
  let name = await userData.getFirstName(email);
  let firstLetter = name.charAt(0).toUpperCase();
  let remainingLetters = name.slice(1);
  name = firstLetter + remainingLetters;

  let date = new Date().toUTCString().slice(0, 16);
  try {
    res.render("homepage", {
      title: "Spotterfy",
      user_name: name,
      date: date,
    });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

module.exports = router;
