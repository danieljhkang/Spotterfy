const mongoCollections = require("./config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId, Db } = require("mongodb");

/* CHECK USER INFO */
// check username
let validUsername = (username) => {
  // username must be supplied
  if (!username) throw "Please provide a username";
  // username should be a valid string (no empty spaces, no spaces in username and only alphanumeric characters)
  if (typeof username !== "string" || username.trim().length === 0)
    throw "Username must be a non-empty string";
  username = username.trim().toLowerCase();
  if (username.length < 4 || !/^[A-Za-z0-9]*$/.test(username))
    throw "Username must be alphanumeric and at least 4 characters";
};

// check email
let validEmail = (email) => {
  email = validString(email).toLowerCase();
  // email must be supplied
  if (!email) throw "Please provide email";
  // email should be a valid string (no empty spaces, no spaces in email and only alphanumeric characters besides "@" and ".")
  if (typeof email !== "string" || email.trim().length === 0)
    throw "Email must be a non-empty string";
  // split email at "@" to check for username and stevens email
  const splitEmail = email.split("@");
  if (splitEmail.length !== 2) throw "Please provide a valid Stevens email";
  const username = splitEmail[0];
  const stevensEmail = splitEmail[1];
  try {
    const validUN = validUsername(username);
  } catch (e) {
    throw "Please provide a valid Stevens email";
  }
  if (stevensEmail !== "stevens.edu")
    throw "Please provide a valid Stevens email";
  return email;
};

// check password
let validPW = (password) => {
  // password must be supplied
  if (!password) throw "Please provide a password";
  // password must be a valid string (no empty spaces, no spaces but can be any other character including special characters) and at least 6 characters long
  if (
    typeof password !== "string" ||
    password.trim().length === 0 ||
    /[ ]/.test(password)
  )
    throw "Password must be a non-empty string with no spaces";
  password = password.trim();
  if (password.length < 6) throw "Password must be at least 6 characters long";
  if (!/[A-Z]/.test(password))
    throw "Password must have at least one uppercase letter";
  if (!/[a-z]/.test(password))
    throw "Password must have at least one lowercase letter";
  if (!/[0-9]/.test(password)) throw "Password must have at least one number";
  if (!/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password))
    throw "Password must have at least one special character";
};

// check cwid
let validCWID = (cwid) => {
  // cwid must be supplied
  if (!cwid) throw "Please provide CWID";
  // cwid should be a valid string (no empty spaces, no spaces in cwid, and only numbers) and only 8 characters long
  if (
    typeof cwid !== "string" ||
    cwid.trim().length !== 8 ||
    !/^[0-9]*$/.test(cwid.trim())
  )
    throw "CWID must be 8 digits.";
};

/* Input checking */
// check valid string
let validString = (str, varName) => {
  // string must be supplied
  if (str === undefined) throw `Please provide a ${varName.toLowerCase()}`;
  // string should be a valid string (no empty spaces, no spaces in username and only alphanumeric characters)
  if (typeof str !== "string" || str.trim().length === 0)
    throw `${varName} must be a non-empty string`;
  return str.trim();
};

/* Takes a time in miiltary format and converts it to cilivian format "hh:mm [AM/PM]" */
let convertTimeToCivilian = (time) => {
  time = time.toLowerCase().split(":");
  let meridiem = "AM";
  let hours = parseInt(time[0]);
  let minutes = parseInt(time[1]);
  if (hours >= 12) {
    meridiem = "PM";
    if (hours > 12) hours -= 12;
  }
  if (hours === 0) hours = 12;
  if (minutes === 0) return `${hours}:${minutes}0 ${meridiem}`;
  else return `${hours}:${minutes} ${meridiem}`;
};

/* Takes a time in civilian format "hh:mm [AM/PM]" and returns it in military format */
let convertTimeToMilitary = (time) => {
  time = time.toLowerCase().split(" ");
  let timeValue = time[0].split(":");
  let hours = parseInt(timeValue[0]);
  hours += time[1] === "pm" && hours < 12 ? 12 : 0;
  let minutes = parseInt(timeValue[1]);
  if (hours === 12 && time[1] === "am") hours = 0;
  return `${hours < 10 ? "0" : ""}${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes}`;
};

let validTime = (time, type) => {
  time = validString(time);
  if (!/^\d{1,2}:\d{2} (AM|PM)$/.test(time))
    throw `${type} must be in the format hh:mm (AM|PM)`;
  splitTime = time.split(" ");
  let [hours, minutes] = splitTime[0].split(":").map((elem) => parseInt(elem));
  if (hours < 1 || hours > 12 || minutes < 0 || minutes >= 60)
    throw "Reservation time is invalid";
  return time;
}

let validReservation = (fullDate, startTime, endTime, location, workouts) => {
    // Validate the input parameters
    if (fullDate === undefined) throw "Must provide date for reservation";
    if (startTime === undefined) throw "Must provide start time for reservation";
    if (endTime === undefined) throw "Must provide end time for reservatin";
    if (location === undefined) throw "Must provide location for reservation";
    if (workouts === undefined) throw "Must provide an option for workouts";

    // Check if string inputs are valid strings
    fullDate = validString(fullDate, "Reservation date");
    startTime = validString(startTime, "Start time");
    endTime = validString(endTime, "End time");
    location = validString(location, "Location");
    workouts = Array.isArray(workouts) ? workouts : [workouts];
    let validWorkouts = {
        Arms: "Arms",
        Legs: "Legs",
        Back: "Back",
        Chest: "Chest",
        Shoulders: "Shoulders",
        Abs: "Abs",
        Cardio: "Cardio",
        Calisthenics: "Calisthenics",
        Yoga: "Yoga",
        Other: "Other",
        None: "No workouts listed"
    }
    for (let i = 0; i < workouts.length; i++) {
        workouts[i] = validString(workouts[i], "Workout");
        if (validWorkouts[workouts[i]] === undefined) throw `\"${workouts[i]}\" is not a valid workout`;
        workouts[i] = validWorkouts[workouts[i]];
    }

    // Check if inputs are in the correct format
    // Reservation date
    if (!/^\d{4}-\d{2}-\d{2}/.test(fullDate)) throw "Reservation date must be in the format yyyy-mm-dd";
    // Start time and end time
    validTime(startTime, "Start time");
    validTime(endTime, "End time");
    // Location
    if (location !== "UCC" && location !== "Schaefer") throw `${location} is not a valid location`;

    // Check if date and time is valid
    let currDate = new Date();
    let currDateAtMidnight = new Date(currDate.toDateString());
    // Need to replace hyphens with forward slash cause JS Date object is weird
    fullDate = fullDate.replace(/-/g, "\/");
    let reservationDate = new Date(fullDate);
    
    // Check if the date is valid
    if (reservationDate < currDateAtMidnight) throw "Reservation date is invalid";

    // Split given times into their separate parts (hours, minutes, AM/PM)
    let startDate = new Date(`${fullDate} ${startTime}`);
    let endDate = new Date(`${fullDate} ${endTime}`);

    if (startDate.getHours() < 8) 
        throw "Reservation must start after 8 AM";
    if (endDate.getHours() >= 23 && endDate.getMinutes() > 0) 
        throw "Reservation must end before 11 PM";

    // If reservation date is current date, check if reservation time is in the past
    //    We have to convert to date string because === doesn't work with Date object
    if (+reservationDate === +currDateAtMidnight) {
    // if (currDate.toDateString() === reservationDate.toDateString()) {
        if (startDate < currDate)
            throw "Start time is invalid";
        if (endDate < currDate)
            throw "End time is invalid";
    }
    // Check if end time is before start time
    if (endDate < startDate)
        throw "The start time for reservation must come before end time";
    if (startDate.getTime() === endDate.getTime())
        throw "You must reserve a minimum of 20 minutes";
    const twoHoursInMilliseconds = 7200000;
    if (endDate - startDate > twoHoursInMilliseconds)
        throw "Cannot reserve more than two hours at a time";

    return [fullDate, startTime, endTime, location, workouts];
};

let getTimesLists = () => {
  const minuteIncrement = 20;
  const minutesInDay = 24 * 60;
  let hours = 8;
  let minutes = 0;
  let timesList = [];
  while (hours < 23 || minutes === 0) {
    let time = "";
    time += hours % 12 === 0 ? "12" : hours % 12; // Convert hours from military
    time += ":";
    time += (minutes < 10 ? "0" : "") + minutes; // Add leading 0 to single digit minutes
    time += " " + (hours < 12 ? "AM" : "PM"); // If hours < 12, AM; else, PM
    timesList.push(time);
    minutes = (minutes + minuteIncrement) % 60; // Increase minutes by increment
    hours = minutes === 0 ? hours + 1 : hours; // If minutes hits 0, signifies hour change
  }
  return timesList;
};

module.exports = {
  validUsername,
  validEmail,
  validPW,
  validCWID,
  validString,
  validReservation,
  convertTimeToCivilian,
  convertTimeToMilitary,
  getTimesLists,
};
