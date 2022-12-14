//require express, express router and bcrypt as shown in lecture code
const data = require("../data");
const userData = data.users;
const express = require("express");
const router = express.Router();
const helpers = require("../helpers");
const users = require("../data/users");
const xss = require("xss");

router.route("/").get(async (req, res) => {
  //code here for GET
  res.redirect("login");
});

router
  .route("/login")
  .get(async (req, res) => {
    //code here for GET
    res.render("login", {
      title: "Spotterfy",
      layout: "nonav",
    });
  })
  .post(async (req, res) => {
    //code here for POST
    let email = xss(req.body.emailInput);
    let password = xss(req.body.passwordInput);

    if (!email || !password) {
      res.status(400).render("login", {
        title: "Spotterfy",
        error: "You must supply both an email and a password",
        layout: "nonav",
      });
      return;
    }

    try {
      helpers.validEmail(email);
      helpers.validPW(password);
    } catch (e) {
      res
        .status(400)
        .render("login", { title: "Spotterfy", error: e, layout: "nonav" });
      return;
    }

    let loginUser;
    try {
      loginUser = await userData.checkUserAuth(email, password);
    } catch (e) {
      res
        .status(400)
        .render("login", { title: "Spotterfy", error: e, layout: "nonav" });
      return;
    }

    if (loginUser.authenticatedUser === true) {
      //make a cookie
      req.session.user = { name: "AuthCookie", email: email };
      res.redirect("/homepage");
    } else {
      console.log(loginUser.authenticatedUser);
      res.status(400).render("login", {
        title: "Spotterfy",
        error: "Failed to authenticate user",
        layout: "nonav",
      });
    }
  });

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    res.render("register", {
      title: "Spotterfy",
      layout: "nonav",
    });
  })
  /* Post route to verify user register data and submit post request to add to database */
  .post(async (req, res) => {
    let cwid = xss(req.body.cwidInput);
    let firstName = xss(req.body.firstNameInput);
    let lastName = xss(req.body.lastNameInput);
    let email = xss(req.body.emailInput);
    let year = xss(req.body.classInput);
    let password = xss(req.body.passwordInput);

    try {
      helpers.validString(firstName, "First name");
      helpers.validString(lastName, "Last name");
      helpers.validEmail(email);
      helpers.validCWID(cwid);
      if (year.trim().length === 0) throw "Please provide a class";
      helpers.validPW(password);

      const createdUser = await userData.createUser(
        firstName,
        lastName,
        email,
        cwid,
        year,
        password
      );

      if (typeof createdUser === "undefined") {
        return res.status(500).render("register", {
          title: "Spotterfy",
          error: "Internal Server Error",
          layout: "nonav",
        });
      } else res.redirect("/login");
    } catch (e) {
      return res.status(400).render("register", {
        title: "Spotterfy",
        error: e,
        layout: "nonav",
      });
    }
  });

router
  .route("/profile")
  .get(async (req, res) => {
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
      visible: user.visible,
    });
  })
  .post(async (req, res) => {
    // switch visibility
    let email = req.session.user.email;
    try {
      let visibility = await userData.switchVisibility(email);
    } catch (e) {
      return res.status(400).json({ error: e });
    }

    // get user
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
      visible: user.visible,
    });
  });

router
  .route("/reserve")
  .get(async (req, res) => {
    let timesList = helpers.getTimesLists();
    let d = new Date();
    let year = d.getFullYear();
    let fullDate = (d.getDate() < 10 ? "0" : "") + d.getDate();
    let month = d.getMonth();
    let currentDate = `${year}-${month + 1}-${fullDate}`;
    let oneYearFromToday = `${year + 1}-${month + 1}-${fullDate}`;
    res.render("reserve", {
      title: "Spotterfy",
      currentDate: currentDate,
      oneYearFromToday: oneYearFromToday,
      timesList: timesList,
    });
  })
  .post(async (req, res) => {
    let date = xss(req.body.date);
    let startTime = xss(req.body.startTime);
    let endTime = xss(req.body.endTime);
    let location = xss(req.body.location);
    let workouts = xss(req.body.workouts);
    let timesList = helpers.getTimesLists();
    let d = new Date();
    let year = d.getFullYear();
    let fullDate = (d.getDate() < 10 ? "0" : "") + d.getDate();
    let month = d.getMonth();
    let currentDate = `${year}-${month + 1}-${fullDate}`;
    let oneYearFromToday = `${year + 1}-${month + 1}-${fullDate}`;
    try {
      if (date === undefined) throw "Must provide date for reservation";
      if (startTime === undefined)
        throw "Must provide start time for reservation";
      if (endTime === undefined) throw "Must provide end time for reservatin";
      if (location === undefined) throw "Must provide location for reservation";
      if (workouts === undefined) throw "Must provide an option for workouts";
      date = date.trim();
      startTime = startTime.trim();
      endTime = endTime.trim();
      location = location.trim();
      helpers.validReservation(date, startTime, endTime);
      var createReservation = await users.createReservation(
        req.session.user.email,
        date,
        startTime,
        endTime,
        location,
        workouts
      );
    } catch (e) {
      res.status(400).render("reserve", {
        title: "Spotterfy",
        error: e,
        currentDate: currentDate,
        oneYearFromToday: oneYearFromToday,
        timesList: timesList,
      });
      return;
    }
    try {
      if (createReservation.createdReservation === false)
        throw "Internal server error";
      res.render("confirm", { title: "Spotterfy" });
    } catch (e) {
      res.status(500).render("reserve", {
        title: "Spotterfy",
        error: e,
        currentDate: currentDate,
        oneYearFromToday: oneYearFromToday,
        timesList: timesList,
      });
      return;
    }
  });

router.route("/homepage").get(async (req, res) => {
  //code here for GET
  //get user first name
  let email = req.session.user.email;
  let name = await userData.getFirstName(email);
  let firstLetter = name.charAt(0).toUpperCase();
  let remainingLetters = name.slice(1);
  name = firstLetter + remainingLetters;

  //For displaying the user's visibilty statement on the homepage
  let userVisibility = await userData.getVisibility(email);
  let visibilityView;
  if (userVisibility) {
    visibilityView = "Public";
  } else {
    visibilityView = "Private";
  }

  let date = new Date().toUTCString().slice(0, 16);
  let visibleUsers = await userData.getVisibleUsers();
  try {
    res.render("homepage", {
      title: "Spotterfy",
      user_name: name,
      date: date,
      visibleUsers: visibleUsers,
      userVisibility: visibilityView,
    });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

router.route("/logout").get(async (req, res) => {
  //code here for GET
  req.session.destroy();
  res.render("logout", {
    title: "Logged Out",
  });
});

module.exports = router;
