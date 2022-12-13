const mongoCollections = require("./config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId, Db } = require("mongodb");
const { dbConnection } = require("./config/mongoConnection");

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
  // email must be supplied
  if (!email) throw "Please provide email";
  // email should be a valid string (no empty spaces, no spaces in email and only alphanumeric characters besides "@" and ".")
  if (typeof email !== "string" || email.trim().length === 0)
    throw "Email must be a non-empty string";
  email = email.trim().toLowerCase();
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
const validCWID = (cwid) => {
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
  return str.trim().toLowerCase();
};

/* Takes a time in miiltary format and converts it to cilivian format "hh:mm [AM/PM]" */
let convertTimeToCivilian = (time) => {
    time = time.split(':');
    let meridiem = "AM";
    let hours = parseInt(time[0]);
    let minutes = parseInt(time[1]);
    if (hours >= 12) {
        meridiem = "PM";
        if (hours > 12) hours -= 12;
    }
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${meridiem}`
}


/* Takes a time in civilian format "hh:mm [AM/PM]" and returns it in military format */
let convertTimeToMilitary = (time) => {
    time = time.split(" ");
    let timeValue = time[0].split(':');
    let hours = parseInt(timeValue[0]) + (time[1]==='PM' && hours < 12 ? 12 : 0);
    let minutes = parseInt(timeValue[1]);
    if (hours === 12 && time[1] === 'AM') hours = 0;
    return `${hours<10 ? '0' : ''}${hours}:${minutes<10 ? '0' : ''}${minutes}`;
}   


let validReservation = (date, startTime, endTime) => {
    let currDate = new Date();    
    let [year, month, day] = date.split('-');

    // Check if the date is valid
    if (year < currDate.getFullYear()) throw "Date is invalid";
    if (year === currDate.getFullYear() && month < currDate.getMonth()+1) throw "Date is invalid";
    if (month === currDate.getMonth()+1 && day < currDate.getDate()) throw "Date is invalid";
   
    // Split given times into their separate parts (hours, minutes, AM/PM)
    let [ startHours, startMinutes ] = convertTimeToMilitary(startTime).split(':');
    let [ endHours, endMinutes ] = convertTimeToMilitary(endTime).split(':'); 
   
    // Check if the reservation time is in the past (only need to do so if the reservation date
    //   is the current date)
    if (year === currDate.getFullYear() && month === currDate.getMonth()+1 && day === currDate.getDate()) {
        if (startHours < currDate.getHours() || (startHours === currDate.getHours() && startMinutes < currDate.getMinutes()))
            throw "Start time is invalid";
        if (endHours < currDate.getHours() || (endHours === currDate.getHours() && endMinutes < currDate.getMinutes()))
            throw "End time is invalid";
    }
    // Check if end time is before start time
    if (endHours < startHours || (endHours === startHours && endMinutes < startMinutes)) 
        throw "The start time for reservation must come before end time";
    if (startHours === endHours && startMinutes === endMinutes)
        throw "You must reserve a minimum of 20 minutes";
    if (endHours - startHours > 2 || (endHours === startHours && endMinutes < startMinutes))
        throw "Cannot reserve more than two hours at a time";
}

let getTimesLists = () => {
    const minuteIncrement = 20;
    const minutesInDay = 24 * 60;
    let hours = 0;
    let minutes = 0;
    let timesList = [];
    while (timesList.length < Math.trunc(minutesInDay/minuteIncrement)) {
        let time = "";
        time += hours%12===0 ? "12" : hours%12;     // Convert hours from military
        time += ":";
        time += (minutes<10 ? "0" : "") + minutes;  // Add leading 0 to single digit minutes
        time += " " + (hours<12 ? "AM" : "PM");     // If hours < 12, AM; else, PM
        timesList.push(time);
        minutes = (minutes + minuteIncrement) % 60; // Increase minutes by increment
        hours = minutes===0 ? hours+1 : hours;      // If minutes hits 0, signifies hour change
    }
    return timesList;
}

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
