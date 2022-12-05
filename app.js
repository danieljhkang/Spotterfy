const express = require("express");
const app = express();
const configRoutes = require("./routes");
const exphbs = require("express-handlebars");
const session = require("express-session");
const public = express.static(__dirname + '/public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', public);

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

const connection = require('./config/mongoConnection');
const collections = require('./config/mongoCollections');
const users = collections.users;
const hotspots = collections.hotspots;
const usersData = require('./data/users')


const main = async () => {
  // const db = await connection.dbConnection();
  // await db.dropDatabase();
  const usersCollection = await users();
  const hotspotsCollection = await hotspots();
  /* Checks if the hotspot collection exists, if not then creates from scratch to not overwrite previous data */
  const hotspotExists = await hotspotsCollection.findOne({day: "Sunday"});
  if(!hotspotExists){
    await hotspotsCollection.insertOne({day: "Sunday", weeksPast: 0, registeredAverage: [], currentRegistered: []});
    await hotspotsCollection.insertOne({day: "Monday", weeksPast: 0, registeredAverage: [], currentRegistered: []});
    await hotspotsCollection.insertOne({day: "Tuesday", weeksPast: 0, registeredAverage: [], currentRegistered: []});
    await hotspotsCollection.insertOne({day: "Wednesday", weeksPast: 0, registeredAverage: [], currentRegistered: []});
    await hotspotsCollection.insertOne({day: "Thursday", weeksPast: 0, registeredAverage: [], currentRegistered: []});
    await hotspotsCollection.insertOne({day: "Friday", weeksPast: 0, registeredAverage: [], currentRegistered: []});
    await hotspotsCollection.insertOne({day: "Saturday", weeksPast: 0, registeredAverage: [], currentRegistered: []});
  }
  // try{
  //   var c = await usersData.createUser("Rohan", "Balani", "rbalani@stevens.edu", 87655321, "junior", "Rohan@1")
  //   console.log(c)
  // }catch(e)
  // {
  //   console.log(e)
  // }
  
  // await connection.closeConnection();
};

main();

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
