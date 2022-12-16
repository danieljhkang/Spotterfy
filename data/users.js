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
  helpers.validString(firstName, "first name");
  helpers.validString(lastName, "last name");
  helpers.validEmail(email);
  helpers.validCWID(cwid);
  helpers.validPW(password);

  // check if user already exists
  const userCollection = await users();
  let found = await userCollection.findOne({ cwid: cwid });
  if (found) throw "A user with this cwid already exists";

  let eFound = await userCollection.findOne({ email: email });
  if (eFound) throw "A user with this email already exists";

  // hash password using bcrypt
  const hash = await bcrypt.hash(password, saltRounds);

  firstName = firstName.toLowerCase();
  lastName = lastName.toLowerCase();
  let capitalizedFirst =
    firstName.charAt(0).toUpperCase() + firstName.substring(1);
  let capitalizedLast =
    lastName.charAt(0).toUpperCase() + lastName.substring(1);

  let newUser = {
    cwid: cwid,
    firstName: capitalizedFirst,
    lastName: capitalizedLast,
    email: email.toLowerCase().trim(),
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
  return { insertedUser: true }; //dev
};

const createReservation = async (
  userEmail,
  fullDate,
  startTime,
  endTime,
  location,
  workouts
) => {
  [fullDate, startTime, endTime, location, workouts] = helpers.validReservation(
    fullDate,
    startTime,
    endTime,
    location,
    workouts
  );

  // If a reservation in the same time frame already exists, it is invalid
  const usersCollection = await users();
  const userReservations = await usersCollection.findOne(
    { email: userEmail },
    { projection: { _id: 0, upcomingReservations: 1 } }
  );
  let startDate = new Date(`${fullDate.replace(/-/g, "/")} ${startTime}`);
  let endDate = new Date(`${fullDate.replace(/-/g, "/")} ${endTime}`);
  let totalReservationTime = endDate - startDate;
  const twoHoursInMilliseconds = 7200000;
  let findMatchingReservation = userReservations.upcomingReservations.find(
    (reservation) => {
      // If the new reservation times INTERSECT with any existing reservation times
      if (fullDate === reservation.date) {
        let existingStart = new Date(
          `${reservation.date.replace(/-/g, "/")} ${reservation.startTime}`
        );
        let existingEnd = new Date(
          `${reservation.date.replace(/-/g, "/")} ${reservation.endTime}`
        );
        totalReservationTime += endDate - startDate;
        if (existingStart <= startDate && startDate < existingEnd) return true;
        if (existingStart < endDate && endDate <= existingEnd) return true;
      }
      return false;
    }
  );

  if (findMatchingReservation)
    throw "Already have reservation with these times";

  if (totalReservationTime > twoHoursInMilliseconds)
    throw "Can only reserve a maximum of two hours a day";

  // Create and insert a new reservation
  const reservationId = new ObjectId();
  let newReservation = {
    _id: reservationId,
    date: fullDate,
    startTime: startTime,
    endTime: endTime,
    location: location,
    workouts: workouts,
    checked: false,
  };

  const updatedInfo = await usersCollection.updateOne(
    { email: userEmail },
    { $push: { upcomingReservations: newReservation } }
  );

  updateHotspots(fullDate, location, startTime, endTime);
  updateCurrentRegistered(fullDate, location, startTime, endTime);

  if (updatedInfo.modifiedCount === 0) return { createdReservation: false };
  else return { createdReservation: true };
};

/* Changes the visibility of a user and RETURNS THE UPDATED VISIBILITY */
const switchVisibility = async (email) => {
  helpers.validEmail(email);
  const userCollection = await users();
  let found = await userCollection.findOne({ email: email });
  if (!found) throw "A user with this email doesn't exist";

  const updatedInfo = await userCollection.updateOne(
    { email: email },
    { $set: { visible: !found.visible } }
  );

  if (updatedInfo.modifiedCount === 0) {
    throw "could not update visibility successfully";
  }

  //Returns updated user visibility
  return !found.visible;
};

/* Returns array of all visible user objects with workouts for today
and parses the objects to only return firstName, lastName, and upcoming Reservations*/
const getVisibleUsers = async () => {
  const userCollection = await users();
  const visibleList = await userCollection
    .find({ visible: true })
    .project({ firstName: 1, lastName: 1, upcomingReservations: 1, _id: 0 })
    .toArray();
  if (!visibleList) throw "Could not get all visible users";

  let usersWithWorkoutsToday = [];
  let todaysWorkouts = [];
  let d = new Date();
  let year = d.getFullYear();
  let fullDate = (d.getDate() < 10 ? "0" : "") + d.getDate();
  let month = d.getMonth();
  let currentDate = `${year}/${month + 1}/${fullDate}`;

  for (let i = 0; i < visibleList.length; i++) {
    for (let j = 0; j < visibleList[i].upcomingReservations.length; j++) {
      if (visibleList[i].upcomingReservations[j].date === currentDate)
        todaysWorkouts.push(visibleList[i].upcomingReservations[j]);
    }
    visibleList[i].upcomingReservations = todaysWorkouts;
    todaysWorkouts = [];
  }

  for (user of visibleList) {
    if (user.upcomingReservations.length !== 0)
      usersWithWorkoutsToday.push(user);
  }

  return usersWithWorkoutsToday;
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
  if (!exist) throw "The user doesn't exist";

  // authenticate user
  let compare = false;
  compare = await bcrypt.compare(password, exist.hashPassword);
  if (!compare) throw "The password is incorrect";

  return { authenticatedUser: true };
};

//returns the string first name of the user
const getFirstName = async (email) => {
  helpers.validEmail(email);
  const userCollection = await users();
  email = email.trim().toLowerCase();
  let exist = await userCollection.findOne({ email: email });
  return exist.firstName;
};

// get user by email
const getUserByEmail = async (email) => {
  helpers.validEmail(email);
  const userCollection = await users();
  email = email.trim().toLowerCase();
  let user = await userCollection.findOne({ email: email });
  return user;
};

// get upcoming reservations of user
const getUpcoming = async (email) => {
  helpers.validEmail(email);
  let user = await getUserByEmail(email);
  let upcoming = user.upcomingReservations;

  // sort by time
  const sort = upcoming.sort(function (a, b) {
    // sort by date
    return b.startTime.localeCompare(a.startTime);
  });

  // sort by date
  const sorted = sort.sort(function (a, b) {
    // sort by date
    return a.date.localeCompare(b.date);
  });

  return sorted;
};

// update previous reservations by moving past upcoming reservations to previous
const updateReservations = async (email) => {
  // get upcoming reservations
  helpers.validEmail(email);
  let upcoming = await getUpcoming(email);

  // get user
  const user = await getUserByEmail(email);

  // get current date
  let d = new Date();
  let year = d.getFullYear();
  let fullDate = (d.getDate() < 10 ? "0" : "") + d.getDate();
  let month = d.getMonth();
  let currentDate = `${year}-${month + 1}-${fullDate}`;
  const today = new Date(currentDate);

  // initialize upcoming and previous reservations
  const updateUpcoming = user.upcomingReservations;
  const updatePrevious = user.previousReservations;

  upcoming.forEach((res) => {
    let resDate = new Date(res.date);
    // if before current date, remove from upcoming and add previous
    if (resDate < today) {
      updatePrevious.push(res);
      let index = updateUpcoming.indexOf(res);
      updateUpcoming.splice(index, 1);
    }
  });

  // update reservations
  const userCollection = await users();
  let found = await userCollection.findOne({ email: email });
  if (!found) throw "A user with this email doesn't exist";

  const updatedInfo = await userCollection.updateOne(
    { email: email },
    {
      $set: {
        previousReservations: updatePrevious,
        upcomingReservations: updateUpcoming,
      },
    }
  );

  if (updatedInfo.modifiedCount === 0) return { updateReservations: false };
  else return { updateReservations: true };
};

const getVisibility = async (email) => {
  helpers.validEmail(email);
  let user = await getUserByEmail(email);
  return user.visible;
};

const updateHotspots = async (fullDate, location, startTime, endTime) => {
  let startDate = new Date(`${fullDate} ${startTime}`);
  let endDate = new Date(`${fullDate} ${endTime}`);
  const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    startDate
  );

  // Return the registered average array for the appropriate location
  const hotspotsCollection = await hotspots();
  let hotspotsDay = await hotspotsCollection.findOne({ day: day });
  let registeredAverage =
    location === "UCC"
      ? hotspotsDay.registeredAverageUCC
      : hotspotsDay.registeredAverageSCH;

  //this is to add to the hotspots collection
  let timeDiff = endDate.getHours() - startDate.getHours();
  //[8am, 9am, 10am, 11am, 12pm, 1pm, 2pm, 3pm, 4pm, 5pm, 6pm, 7pm, 8pm, 9pm, 10pm, 11pm]
  //add 1 in the array indexes in which the reservations reside (check the hours in the start time and end time)
  //populate the array with zeros if there arn't any
  if (timeDiff < 1) {
    registeredAverage[startDate.getHours() - 8]++;
  } else if (timeDiff === 2) {
    registeredAverage[startDate.getHours() - 8]++;
    registeredAverage[endDate.getHours() - 9]++;
  } else {
    // I don't think this needs to be here because we either update one hour or two hours, which is the maximum
    registeredAverage[startDate.getHours() - 8]++;
    registeredAverage[endDate.getHours() - 8]++;
  }
  // My suggested correction
  // if (timeDiff < 2) {
  //     registeredAverage[startDate.getHours()-8]++;
  // } else {
  //     registeredAverage[startDate.getHours()-8]++;
  //     registeredAverage[endDate.getHours()-9]++;
  // }
  if (location === "UCC") {
    const updatedAverage = await hotspotsCollection.updateOne(
      { day: day },
      { $set: { registeredAverageUCC: registeredAverage } }
    );
  } else {
    const updatedAverage = await hotspotsCollection.updateOne(
      { day: day },
      { $set: { registeredAverageSCH: registeredAverage } }
    );
  }
};

const updateCurrentRegistered = async (
  fullDate,
  location,
  startTime,
  endTime
) => {
  let d = new Date();
  let year = d.getFullYear();
  let date = (d.getDate() < 10 ? "0" : "") + d.getDate();
  let month = d.getMonth();
  let currentDate = `${year}/${month + 1}/${date}`;

  if (fullDate === currentDate) {
    let startDate = new Date(`${fullDate} ${startTime}`);
    let endDate = new Date(`${fullDate} ${endTime}`);
    const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
      startDate
    );

    // Return the registered average array for the appropriate location
    const hotspotsCollection = await hotspots();
    let hotspotsDay = await hotspotsCollection.findOne({ day: day });
    let registeredAverage =
      location === "UCC"
        ? hotspotsDay.currentRegisteredUCC
        : hotspotsDay.currentRegisteredSCH;

    //this is to add to the hotspots collection
    let timeDiff = endDate.getHours() - startDate.getHours();
    //[8am, 9am, 10am, 11am, 12pm, 1pm, 2pm, 3pm, 4pm, 5pm, 6pm, 7pm, 8pm, 9pm, 10pm, 11pm]
    //add 1 in the array indexes in which the reservations reside (check the hours in the start time and end time)
    //populate the array with zeros if there arn't any
    if (timeDiff < 1) {
      registeredAverage[startDate.getHours() - 8]++;
    } else if (timeDiff === 2) {
      registeredAverage[startDate.getHours() - 8]++;
      registeredAverage[endDate.getHours() - 9]++;
    } else {
      // I don't think this needs to be here because we either update one hour or two hours, which is the maximum
      registeredAverage[startDate.getHours() - 8]++;
      registeredAverage[endDate.getHours() - 8]++;
    }
    // My suggested correction
    // if (timeDiff < 2) {
    //     registeredAverage[startDate.getHours()-8]++;
    // } else {
    //     registeredAverage[startDate.getHours()-8]++;
    //     registeredAverage[endDate.getHours()-9]++;
    // }
    if (location === "UCC") {
      const updatedAverage = await hotspotsCollection.updateOne(
        { day: day },
        { $set: { currentRegisteredUCC: registeredAverage } }
      );
    } else {
      const updatedAverage = await hotspotsCollection.updateOne(
        { day: day },
        { $set: { currentRegisteredSCH: registeredAverage } }
      );
    }
  }
};

module.exports = {
  createUser,
  createReservation,
  checkUserAuth,
  getFirstName,
  getUserByEmail,
  getUpcoming,
  switchVisibility,
  getVisibleUsers,
  getVisibility,
  updateReservations,
};
