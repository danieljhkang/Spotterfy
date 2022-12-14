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
  date,
  startTime,
  endTime,
  location,
  workouts
) => {
  // Validate the input parameters
  if (date === undefined) throw "Must provide date for reservation";
  if (startTime === undefined) throw "Must provide start time for reservation";
  if (endTime === undefined) throw "Must provide end time for reservatin";
  if (location === undefined) throw "Must provide location for reservation";
  if (workouts === undefined) throw "Must provide an option for workouts";
  if (!Array.isArray(workouts)) workouts = [workouts];
  helpers.validReservation(date, startTime, endTime);
  let startTimeMilitary = helpers.convertTimeToMilitary(startTime);
  let endTimeMilitary = helpers.convertTimeToMilitary(endTime);
  // If a reservation in the same time frame already exists, it is invalid
  const usersCollection = await users();
  const userReservations = await usersCollection.findOne(
    { email: userEmail },
    { projection: { _id: 0, upcomingReservations: 1 } }
  );
  let startSplit = startTimeMilitary.split(":").map((elem) => parseInt(elem));
  let endSplit = endTimeMilitary.split(":").map((elem) => parseInt(elem));
  let totalReservationMinutes =
    (endSplit[0] - startSplit[0]) * 60 + (endSplit[1] - startSplit[1]);
  let findMatchingReservation = userReservations.upcomingReservations.find(
    (reservation) => {
      // If the new reservation times INTERSECT with any existing reservation times
      if (date === reservation.date) {
        if (
          startTimeMilitary >= reservation.startTime &&
          startTimeMilitary <= reservation.endTime
        )
          return true;
        if (
          endTimeMilitary >= reservation.startTime &&
          endTimeMilitary <= reservation.endTime
        )
          return true;
        if (
          startTimeMilitary < reservation.startTime &&
          endTimeMilitary > reservation.endTime
        )
          return true;
        startSplit = reservation.startTime
          .split(":")
          .map((elem) => parseInt(elem));
        endSplit = reservation.endTime.split(":").map((elem) => parseInt(elem));
        totalReservationMinutes +=
          (endSplit[0] - startSplit[0]) * 60 + (endSplit[1] - startSplit[1]);
        if (totalReservationMinutes > 120)
          throw "You can only reserve a maxmium of two hours a day";
      }
      return false;
    }
  );
  if (findMatchingReservation)
    throw "Already have reservation with these times";
  // Create and insert a new reservation
  const reservationId = new ObjectId();
  let newReservation = {
    _id: reservationId,
    date: date,
    startTime: startTimeMilitary,
    endTime: endTimeMilitary,
    location: location,
    workouts: workouts,
    checked: false,
  };
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let dateArray = date.split("-");
  //0 -> year
  //1 -> month
  //2 -> day
  let dateFormat =
    months[Number(dateArray[1]) - 1] + " " + dateArray[2] + " " + dateArray[0];
  const d = new Date(dateFormat);
  const day = days[d.getDay()];
  //this is to add to the hotspots collection
  const hotspotsCollection = await hotspots();

  const updatedInfo = await usersCollection.updateOne(
    { email: userEmail },
    { $push: { upcomingReservations: newReservation } }
  );

  let startHour = Number(startTimeMilitary.substring(0, 2));
  let endHour = Number(endTimeMilitary.substring(0, 2));
  let timeDiff = endHour - startHour;
  //[8am, 9am, 10am, 11am, 12pm, 1pm, 2pm, 3pm, 4pm, 5pm, 6pm, 7pm, 8pm, 9pm, 10pm, 11pm]
  //add 1 in the array indexes in which the reservations reside (check the hours in the start time and end time)
  //populate the array with zeros if there arn't any
  if (location === "UCC") {
    //if ucc
    //get ucc average number for that hour
    let avgUCCArray = await getHotspotArray(day, "UCC");
    //add one to the index in which the reservations reside
    if (timeDiff < 1) {
      avgUCCArray[startHour - 8] = avgUCCArray[startHour - 8] + 1;
    } else if (timeDiff === 2) {
      avgUCCArray[startHour - 8] = avgUCCArray[startHour - 8] + 1;
      avgUCCArray[endHour - 9] = avgUCCArray[endHour - 9] + 1;
    } else {
      avgUCCArray[startHour - 8] = avgUCCArray[startHour - 8] + 1;
      avgUCCArray[endHour - 8] = avgUCCArray[endHour - 8] + 1;
    }
    const updatedAverage = await hotspotsCollection.updateOne(
      { day: day },
      { $set: { registeredAverageUCC: avgUCCArray } }
    );
  } else {
    //if schaefer
    //get schaefer average number for that hour
    let avgSCHArray = await getHotspotArray(day, "Schaefer");
    if (timeDiff < 1) {
      avgSCHArray[startHour - 8] = avgSCHArray[startHour - 8] + 1;
    } else if (timeDiff === 2) {
      avgSCHArray[startHour - 8] = avgSCHArray[startHour - 8] + 1;
      avgSCHArray[endHour - 9] = avgSCHArray[endHour - 9] + 1;
    } else {
      avgSCHArray[startHour - 8] = avgSCHArray[startHour - 8] + 1;
      avgSCHArray[endHour - 8] = avgSCHArray[endHour - 8] + 1;
    }
    const updatedAverage = await hotspotsCollection.updateOne(
      { day: day },
      { $set: { registeredAverageSCH: avgSCHArray } }
    );
  }

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

/* Returns array of all visible user objects to display on homepage, each object in the array is parsed to include only first/last names and upcomingReservations */
// const getVisibleUsers = async () =>{
//   const userCollection = await users();
//   const visibleList = await userCollection.find({visible: true}).project({firstName: 1, lastName: 1, upcomingReservations: 1, _id: 0}).toArray();
//   if (!visibleList)
//     throw 'Could not get all visible users';

//   let usersWithWorkoutsToday = [];
//   let todaysWorkouts = []
//   let d = new Date();
//   let year = d.getFullYear();
//   let fullDate = (d.getDate()<10 ? "0" : "") + d.getDate();
//   let month = d.getMonth();
//   let currentDate = `${year}-${month+1}-${fullDate}`

//   for(let i = 0; i < visibleList.length; i++){
//     for(workout of visibleList[i].upcomingReservations)
//       if(workout.date === currentDate){
//         todaysWorkouts.push(workout)
//       }

//     visibleList[i].upcomingReservations = todaysWorkouts;
//     todaysWorkouts = []
//   }

//   for(user of visibleList)
//     if(user.upcomingReservations.length !== 0)
//       usersWithWorkoutsToday.push(user)

//   return usersWithWorkoutsToday;
// }

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
  let currentDate = `${year}-${month + 1}-${fullDate}`;

  for (let i = 0; i < visibleList.length; i++) {
    for (let j = 0; j < visibleList[i].upcomingReservations.length; j++) {
      if (visibleList[i].upcomingReservations[j].date === currentDate) {
        visibleList[i].upcomingReservations[j].startTime =
          helpers.convertTimeToCivilian(
            visibleList[i].upcomingReservations[j].startTime
          );
        visibleList[i].upcomingReservations[j].endTime =
          helpers.convertTimeToCivilian(
            visibleList[i].upcomingReservations[j].endTime
          );
        todaysWorkouts.push(visibleList[i].upcomingReservations[j]);
      }
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
  return user.upcomingReservations;
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

const getHotspotArray = async (day, location) => {
  const hotspotsCollection = await hotspots();
  let dayObject = await hotspotsCollection.findOne({ day: day });
  if (location === "UCC") {
    return dayObject.registeredAverageUCC;
  } else {
    return dayObject.registeredAverageSCH;
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
  getHotspotArray,
  updateReservations,
};
