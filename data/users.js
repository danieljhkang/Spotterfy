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

  let newUser = {
    cwid: cwid,
    firstName: firstName.toLowerCase().trim(),
    lastName: lastName.toLowerCase().trim(),
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

const createReservation = async (userEmail, date, startTime, endTime, location, workouts) => {
    // Validate the input parameters
    if (date === undefined) throw "Must provide date for reservation";
    if (startTime === undefined) throw "Must provide start time for reservation";
    if (endTime === undefined) throw "Must provide end time for reservatin";
    if (location === undefined) throw "Must provide location for reservation";
    if (workouts === undefined) throw "Must provide an option for workouts"
    if (!Array.isArray(workouts)) workouts = [workouts]
    helpers.validReservation(date, startTime, endTime);
    let startTimeMilitary = helpers.convertTimeToMilitary(startTime);
    let endTimeMilitary = helpers.convertTimeToMilitary(endTime);
    // If a reservation in the same time frame already exists, it is invalid
    const usersCollection = await users();
    const userReservations = await usersCollection.findOne(
        {email: userEmail},
        {projection: {_id: 0, upcomingReservations: 1}}
    );
    let startSplit = startTimeMilitary.split(":").map((elem) => parseInt(elem));
    let endSplit = endTimeMilitary.split(':').map((elem) => parseInt(elem));
    let totalReservationMinutes = ((endSplit[0]-startSplit[0]) * 60) + (endSplit[1]-startSplit[1])
    let findMatchingReservation = userReservations.upcomingReservations.find((reservation) => {
        // If the new reservation times INTERSECT with any existing reservation times
        if (date === reservation.date) {
            if (startTimeMilitary >= reservation.startTime && startTimeMilitary <= reservation.endTime) return true;
            if (endTimeMilitary >= reservation.startTime && endTimeMilitary <= reservation.endTime) return true;
            if (startTimeMilitary < reservation.startTime && endTimeMilitary > reservation.endTime) return true;
            startSplit = reservation.startTime.split(":").map((elem) => parseInt(elem));
            endSplit = reservation.endTime.split(':').map((elem) => parseInt(elem));
            totalReservationMinutes += ((endSplit[0]-startSplit[0]) * 60) + (endSplit[1]-startSplit[1])
            if (totalReservationMinutes > 120) throw "You can only reserve a maxmium of two hours a day";
        }
        return false;
    });
    if (findMatchingReservation) throw "Already have reservation with these times";
    // Create and insert a new reservation
    const reservationId = new ObjectId();
    let newReservation = {
        _id: reservationId,
        date: date,
        startTime: startTimeMilitary,
        endTime: endTimeMilitary,
        workouts: workouts
    }
    const updatedInfo = await usersCollection.updateOne(
        {email: userEmail},
        {$push: {upcomingReservations: newReservation}}
    );
    if (updatedInfo.modifiedCount === 0) return { createdReservation: false }
    else return { createdReservation: true }
}

/* Changes the visibility of a user and RETURNS THE UPDATED VISIBILITY */
const switchVisibility = async (email) => {
  helpers.validEmail(email);
  const userCollection = await users();
  let found = await userCollection.findOne({email: email});
  if(!found)
    throw "A user with this email doesn't exist"

  const updatedInfo = await userCollection.updateOne(
    {email: email},
    {$set: {visible: !found.visible}}
  );

  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update visibility successfully';
  }

  //Returns updated user visibility
  return !found.visible;
}

/* Returns array of all visible user objects to display on homepage, each object in the array is parsed to include only first/last names and upcomingReservations */
const getVisibleUsers = async () =>{
  const userCollection = await users();
  const visibleList = await userCollection.find({visible: true}).project({firstName: 1, lastName: 1, upcomingReservations: 1, _id: 0}).toArray();
  if (!visibleList) 
    throw 'Could not get all visible users';

  return visibleList;
}

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

const getVisibility = async (email) => {
  helpers.validEmail(email);
  let user = await getUserByEmail(email);
  return user.visible;
}

const getHotspot = async (location) => {

  const hotspotsCollection = await hotspots();
}

module.exports = {
  createUser,
  createReservation,
  checkUserAuth,
  getFirstName,
  getUserByEmail,
  switchVisibility,
  getVisibleUsers,
  getVisibility,
  getHotspot,
};
