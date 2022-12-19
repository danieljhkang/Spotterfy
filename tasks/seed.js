const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;

const collections = require("../config/mongoCollections");
const hotspots = collections.hotspots;

const main = async() => {
    const db = await dbConnection.dbConnection();
    await db.dropDatabase();

    const hotspotsCollection = await hotspots();
    /* Checks if the hotspot collection exists, if not then creates from scratch to not overwrite previous data */
    const hotspotExists = await hotspotsCollection.findOne({ day: "Sunday" });
    if (!hotspotExists) {
        await hotspotsCollection.insertOne({
        day: "Sunday",
        weeksPast: 0,
        registeredAverageUCC: [7,8,10,9,12,15,20,31,19,40,39,20,14,10,11],
        currentRegisteredUCC: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        registeredAverageSCH: [19,17,32,11,13,21,20,19,19,13,12,11,5,3,8],
        currentRegisteredSCH: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        });
        await hotspotsCollection.insertOne({
        day: "Monday",
        weeksPast: 0,
        registeredAverageUCC: [8,3,9,7,20,15,24,30,32,32,19,20,5,10,6],
        currentRegisteredUCC: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        registeredAverageSCH: [11,2,13,32,13,30,27,9,13,14,20,13,12,11,13],
        currentRegisteredSCH: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        });
        await hotspotsCollection.insertOne({
        day: "Tuesday",
        weeksPast: 0,
        registeredAverageUCC: [3,3,10,11,20,19,25,30,32,32,19,10,9,7,8],
        currentRegisteredUCC: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        registeredAverageSCH: [10,4,30,20,19,27,31,19,18,10,24,14,20,10,11],
        currentRegisteredSCH: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        });
        await hotspotsCollection.insertOne({
        day: "Wednesday",
        weeksPast: 0,
        registeredAverageUCC: [11,10,3,21,20,30,13,14,1,10,32,19,10,11,10],
        currentRegisteredUCC: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        registeredAverageSCH: [5,10,19,17,20,22,30,19,32,17,11,15,19,10,3],
        currentRegisteredSCH: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        });
        await hotspotsCollection.insertOne({
        day: "Thursday",
        weeksPast: 0,
        registeredAverageUCC: [4,10,19,13,14,18,30,19,20,25,27,32,10,13,7],
        currentRegisteredUCC: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        registeredAverageSCH: [9,7,4,19,18,20,22,31,32,29,18,12,13,14,14],
        currentRegisteredSCH: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        });
        await hotspotsCollection.insertOne({
        day: "Friday",
        weeksPast: 0,
        registeredAverageUCC: [10,13,5,19,14,20,23,13,24,28,30,32,19,33,14],
        currentRegisteredUCC: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        registeredAverageSCH: [11,11,9,10,13,20,1,10,29,31,20,30,21,18,11],
        currentRegisteredSCH: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        });
        await hotspotsCollection.insertOne({
        day: "Saturday",
        weeksPast: 0,
        registeredAverageUCC: [19,20,21,18,10,13,12,9,7,17,20,21,30,32,12],
        currentRegisteredUCC: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        registeredAverageSCH: [20,18,18,19,12,13,30,21,17,20,31,21,35,10,18],
        currentRegisteredSCH: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        });
    }

    const user1 = await users.createUser("Bob", "Mcbob", "bmcbob@stevens.edu", "10429087", "freshman", "Gucci1!");
    const user2 = await users.createUser("Jim", "Smith", "jsmith@stevens.edu", "10729038", "sophomore", "Gucci1!");
    const user3 = await users.createUser("Tim", "Gucci", "tgucci@stevens.edu", "10229139", "graduate", "Gucci1!"); 
    const user4 = await users.createUser("John", "Kile", "jkile@stevens.edu", "12345626", "graduate", "Gucci1!");
    const user5 = await users.createUser("Patricia", "Mcsauce", "pmcsauce@stevens.edu", "12223139", "senior", "Gucci1!");
    const user6 = await users.createUser("Sean", "Kim", "skim@stevens.edu", "10269169", "junior", "Gucci1!");
    const user7 = await users.createUser("Ryan", "Orellia", "rorellia@stevens.edu", "17227139", "junior", "Gucci1!");
    const user8 = await users.createUser("Tina", "Asdin", "tasdin@stevens.edu", "10220139", "freshman", "Gucci1!");
    const user9 = await users.createUser("Emily", "Hill", "ehill@stevens.edu", "10229133", "senior", "Gucci1!");
    const user10 = await users.createUser("Lisa", "Pearson", "lpearson@stevens.edu", "10249539", "sophomore", "Gucci1!");
    const user11 = await users.createUser("Dan", "Lee", "dlee@stevens.edu", "10279179", "graduate", "Gucci1!");
    const user12 = await users.createUser("Ryanathan", "Jin", "rjin@stevens.edu", "10239439", "sophomore", "Gucci1!");
    const user13 = await users.createUser("Rohit", "Mohit", "rmohit@stevens.edu", "10229636", "freshman", "Gucci1!");
    const user14 = await users.createUser("Ken", "Jiriviyev", "kjiriviyev@stevens.edu", "10224131", "junior", "Gucci1!");
    const user15 = await users.createUser("Jennie", "Kim", "jkim@stevens.edu", "12229132", "junior", "Gucci1!");
    const user16 = await users.createUser("Jamie", "Beraberev", "jberaberev@stevens.edu", "10429159", "senior", "Gucci1!");
    const user17 = await users.createUser("Jhanvi", "Patel", "jpatel@stevens.edu", "10729137", "freshman", "Gucci1!");
    const user18 = await users.createUser("Susan", "Blind", "sblind@stevens.edu", "10279137", "sophomore", "Gucci1!");
    const user19 = await users.createUser("Kyle", "Takahashi", "ktakahashi@stevens.edu", "10219134", "graduate", "Gucci1!");
    const user20 = await users.createUser("Tom", "Aguilar", "taguilar@stevens.edu", "10629136", "junior", "Gucci1!");

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today = yyyy + '/' + mm + '/' + dd;

    const reservation1 = await users.createReservationDemo(
        "bmcbob@stevens.edu",
        today,
        "8:00 AM",
        "10:00 AM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation2 = await users.createReservationDemo(
        "jsmith@stevens.edu",
        today,
        "9:00 AM",
        "10:00 AM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation3 = await users.createReservationDemo(
        "tgucci@stevens.edu",
        today,
        "10:00 AM",
        "11:20 AM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation4 = await users.createReservationDemo(
        "jkile@stevens.edu",
        today,
        "12:00 PM",
        "2:00 PM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation5 = await users.createReservationDemo(
        "pmcsauce@stevens.edu",
        today,
        "12:20 PM",
        "1:20 PM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation6 = await users.createReservationDemo(
        "skim@stevens.edu",
        today,
        "1:00 PM",
        "3:00 PM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation7 = await users.createReservationDemo(
        "rorellia@stevens.edu",
        today,
        "3:00 PM",
        "5:00 PM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation8 = await users.createReservationDemo(
        "tasdin@stevens.edu",
        today,
        "3:20 PM",
        "5:20 PM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation9 = await users.createReservationDemo(
        "ehill@stevens.edu",
        today,
        "6:00 PM",
        "8:00 PM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation10 = await users.createReservationDemo(
        "lpearson@stevens.edu",
        today,
        "8:00 PM",
        "10:00 PM",
        "schaefer",
        ["Chest","Abs"]
    );
    const reservation11 = await users.createReservationDemo(
        "dlee@stevens.edu",
        today,
        "8:00 AM",
        "10:00 AM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation12 = await users.createReservationDemo(
        "rjin@stevens.edu",
        today,
        "9:00 AM",
        "11:00 AM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation13 = await users.createReservationDemo(
        "rmohit@stevens.edu",
        today,
        "10:00 AM",
        "11:00 AM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation14 = await users.createReservationDemo(
        "kjiriviyev@stevens.edu",
        today,
        "10:20 AM",
        "12:20 PM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation15 = await users.createReservationDemo(
        "jkim@stevens.edu",
        today,
        "11:00 AM",
        "1:00 PM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation16 = await users.createReservationDemo(
        "jberaberev@stevens.edu",
        today,
        "1:00 PM",
        "3:00 PM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation17 = await users.createReservationDemo(
        "jpatel@stevens.edu",
        today,
        "2:00 PM",
        "4:00 PM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation18 = await users.createReservationDemo(
        "sblind@stevens.edu",
        today,
        "5:00 PM",
        "7:00 PM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation19 = await users.createReservationDemo(
        "ktakahashi@stevens.edu",
        today,
        "7:00 PM",
        "9:00 PM",
        "ucc",
        ["Chest","Abs"]
    );
    const reservation20 = await users.createReservationDemo(
        "taguilar@stevens.edu",
        today,
        "9:00 PM",
        "10:40 PM",
        "ucc",
        ["Chest","Abs"]
    );

    console.log('Done seeding database');
    await dbConnection.closeConnection();
}

main();