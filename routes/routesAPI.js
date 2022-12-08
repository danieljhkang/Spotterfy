//require express, express router and bcrypt as shown in lecture code
const data = require("../data");
const userData = data.users;
const express = require("express");
const router = express.Router();
const helpers = require("../helpers");

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
      helpers.checkUserPassword(password);
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
      return res.status(400).json({ error: e });
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
  res.render("profile", {
    title: "Spotterfy",
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
  res.render("homepage", {
    title: "Spotterfy",
  });
});

module.exports = router;
