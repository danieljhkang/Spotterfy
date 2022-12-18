//require express, express router and bcrypt as shown in lecture code
const data = require("../data");
const userData = data.users;
const express = require("express");
const router = express.Router();
const helpers = require("../helpers");
const users = require("../data/users");
const xss = require("xss");
const { Long } = require("mongodb");

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

      //Update and display missed reservations and checkin times in the past week
      try {
        let missedReservationFunc = await userData.getNumberofReservationsStatus(email, false);
        let checkInReservationFunc = await userData.getNumberofReservationsStatus(email, true);
      } catch (e) {
        return res.status(400).json({ error: e });
      }

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

    //Update and display missed reservations and checkin times in the past week
    try {
      let missedReservationFunc = await userData.getNumberofReservationsStatus(email, false);
      let checkInReservationFunc = await userData.getNumberofReservationsStatus(email, true);
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
    // let fullDate = xss(req.body.date);
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today = yyyy + '-' + mm + '-' + dd;
    let fullDate = today;
    let startTime = xss(req.body.startTime);
    let endTime = xss(req.body.endTime);
    let location = xss(req.body.location);
    let workouts = xss(req.body.workouts);
    let timesList = helpers.getTimesLists();
    let date = new Date();
    let dateOneYear = new Date(date.toDateString());
    dateOneYear.setFullYear(date.getFullYear() + 1);
    let currentDate = date.toISOString().substring(0, 10);
    let oneYearFromToday = dateOneYear.toISOString().substring(0, 10);
    try {
      if (fullDate === undefined) throw "Must provide date for reservation";
      if (startTime === undefined)
        throw "Must provide start time for reservation";
      if (endTime === undefined) throw "Must provide end time for reservatin";
      if (location === undefined) throw "Must provide location for reservation";
      if (workouts === undefined) throw "Must provide an option for workouts";
      fullDate = fullDate.trim();
      startTime = startTime.trim();
      endTime = endTime.trim();
      location = location.trim();
      helpers.validReservation(
        fullDate,
        startTime,
        endTime,
        location,
        workouts
      );
      var createReservation = await users.createReservation(
        req.session.user.email,
        fullDate,
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

  // update user's reservations
  let update = await userData.updateReservations(email);

  //For displaying the user's visibilty statement on the homepage
  let userVisibility = await userData.getVisibility(email);
  let visibilityView = userVisibility ? "Public" : "Private";

  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let dateFormat = new Date().toLocaleDateString("en-US", options);
  let visibleUsers = await userData.getVisibleUsers();

  // display user's upcoming reservations
  let userReservations = await userData.getUpcoming(email);

  // pull data from mongo for the best and worst times to reserve
  let dateArray = dateFormat.split(",");
  let totalArrayUCC = await userData.getHotspots(dateArray[0], "UCC");
  let totalArraySCH = await userData.getHotspots(dateArray[0], "Schaefer");

  let bestArrayUCC = await userData.getBestArray(totalArrayUCC);
  let worstArrayUCC = await userData.getWorstArray(totalArrayUCC);
  let bestArraySCH = await userData.getBestArray(totalArraySCH);
  let worstArraySCH = await userData.getWorstArray(totalArraySCH);

  //making them into strings so they can be displayed on the html properly
  let bestUCC = bestArrayUCC[0] + " and " + bestArrayUCC[1];
  let worstUCC = worstArrayUCC[0] + " and " + worstArrayUCC[1];
  let bestSCH = bestArraySCH[0] + " and " + bestArraySCH[1];
  let worstSCH = worstArraySCH[0] + " and " + worstArraySCH[1];

  let day = dateFormat.substring(0, dateFormat.indexOf(","));
  let currentRegisteredArrayUCC = await userData.getCurrentRegisteredArray(
    day,
    "UCC"
  );
  let currentRegisteredArraySCH = await userData.getCurrentRegisteredArray(
    day,
    "SCH"
  );

  let timeToCheckIn = await userData.timeToCheckIn(email);

  res.render("homepage", {
    title: "Spotterfy",
    user_name: name,
    date: dateFormat,
    visibleUsers: visibleUsers,
    usersWorkingOut: visibleUsers.length,
    userVisibility: visibilityView,
    userReservations: userReservations,
    bestTimesUCC: bestUCC,
    worstTimesUCC: worstUCC,
    bestTimesSCH: bestSCH,
    worstTimesSCH: worstSCH,
    todaysReservationsArrayUCC: currentRegisteredArrayUCC,
    todaysReservationsArraySCH: currentRegisteredArraySCH,
  });
});

router.route("/homepage").post(async (req, res) => {
  const updatedData = await userData.checkedIn(req.session.user.email);
  //get user first name
  let email = req.session.user.email;
  let name = await userData.getFirstName(email);
  let firstLetter = name.charAt(0).toUpperCase();
  let remainingLetters = name.slice(1);
  name = firstLetter + remainingLetters;

  // update user's reservations
  let updateReservations = await userData.updateReservations(email);

  //For displaying the user's visibilty statement on the homepage
  let userVisibility = await userData.getVisibility(email);
  let visibilityView = userVisibility ? "Public" : "Private";

  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let dateFormat = new Date().toLocaleDateString("en-US", options);
  let visibleUsers = await userData.getVisibleUsers();

  // display user's upcoming reservations
  let userReservations = await userData.getUpcoming(email);

  // pull data from mongo for the best and worst times to reserve
  let dateArray = dateFormat.split(",");
  let totalArrayUCC = await userData.getHotspots(dateArray[0], "UCC");
  let totalArraySCH = await userData.getHotspots(dateArray[0], "Schaefer");

  let bestArrayUCC = await userData.getBestArray(totalArrayUCC);
  let worstArrayUCC = await userData.getWorstArray(totalArrayUCC);
  let bestArraySCH = await userData.getBestArray(totalArraySCH);
  let worstArraySCH = await userData.getWorstArray(totalArraySCH);

  //making them into strings so they can be displayed on the html properly
  let bestUCC = bestArrayUCC[0] + " and " + bestArrayUCC[1];
  let worstUCC = worstArrayUCC[0] + " and " + worstArrayUCC[1];
  let bestSCH = bestArraySCH[0] + " and " + bestArraySCH[1];
  let worstSCH = worstArraySCH[0] + " and " + worstArraySCH[1];

  let day = dateFormat.substring(0, dateFormat.indexOf(","));
  let currentRegisteredArrayUCC = await userData.getCurrentRegisteredArray(
    day,
    "UCC"
  );
  let currentRegisteredArraySCH = await userData.getCurrentRegisteredArray(
    day,
    "SCH"
  );

  let timeToCheckIn = await userData.timeToCheckIn(email);

  res.render("homepage", {
    title: "Spotterfy",
    user_name: name,
    date: dateFormat,
    visibleUsers: visibleUsers,
    usersWorkingOut: visibleUsers.length,
    userVisibility: visibilityView,
    userReservations: userReservations,
    bestTimesUCC: bestUCC,
    worstTimesUCC: worstUCC,
    bestTimesSCH: bestSCH,
    worstTimesSCH: worstSCH,
    todaysReservationsArrayUCC: currentRegisteredArrayUCC,
    todaysReservationsArraySCH: currentRegisteredArraySCH,
  });
});

// unfinished ajax request
// router.route("/homepage/checked/:id").post(async (req, res) => {
//   const updatedData = await userData.checkedIn(
//     req.session.user.email,
//     req.params.id
//   );
//   response.render("partials/upcoming", { layout: null, ...updatedData });
// });

router.route("/logout").get(async (req, res) => {
  //code here for GET
  req.session.destroy();
  res.render("logout", {
    title: "Logged Out",
  });
});

module.exports = router;
