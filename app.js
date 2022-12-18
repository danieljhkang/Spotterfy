const express = require("express");
const app = express();
const configRoutes = require("./routes");
const exphbs = require("express-handlebars");
const session = require("express-session");
const public = express.static(__dirname + "/public");
const Handlebars = require("handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const handlebarsInstance = exphbs.create({
  defaultLayout: "main",
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === "number")
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    },
  },
  partialsDir: ["views/partials/"],
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use("/public", public);

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");
app.use(rewriteUnsupportedBrowserMethods);

app.use(
  session({
    name: "AuthCookie",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/profile", (req, res, next) => {
  if (!req.session.user) {
    res
      .status(403)
      .render("forbidden", { title: "Spotterfy", layout: "nonav" });
    return;
  } else {
    next();
  }
});

app.use("/homepage", (req, res, next) => {
  if (!req.session.user) {
    res
      .status(403)
      .render("forbidden", { title: "Spotterfy", layout: "nonav" });
    return;
  } else {
    next();
  }
});

app.use("/reserve", (req, res, next) => {
  if (!req.session.user) {
    res
      .status(403)
      .render("forbidden", { title: "Spotterfy", layout: "nonav" });
    return;
  } else {
    next();
  }
});

app.use("/login", (req, res, next) => {
  if (req.session.user) {
    // res.status(500).render("homepage", {
    //   title: "Spotterfy",

    // });
    res.status(500).redirect("homepage");
    return;
  } else {
    next();
  }
});

configRoutes(app);

const connection = require("./config/mongoConnection");
const collections = require("./config/mongoCollections");
const users = collections.users;
const hotspots = collections.hotspots;
const usersData = require("./data/users");

const main = async () => {
  // const db = await connection.dbConnection();
  // await db.dropDatabase();
  const usersCollection = await users();
  const hotspotsCollection = await hotspots();
  /* Checks if the hotspot collection exists, if not then creates from scratch to not overwrite previous data */
  const hotspotExists = await hotspotsCollection.findOne({ day: "Sunday" });
  if (!hotspotExists) {
    await hotspotsCollection.insertOne({
      day: "Sunday",
      weeksPast: 0,
      registeredAverageUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      registeredAverageSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
    await hotspotsCollection.insertOne({
      day: "Monday",
      weeksPast: 0,
      registeredAverageUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      registeredAverageSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
    await hotspotsCollection.insertOne({
      day: "Tuesday",
      weeksPast: 0,
      registeredAverageUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      registeredAverageSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
    await hotspotsCollection.insertOne({
      day: "Wednesday",
      weeksPast: 0,
      registeredAverageUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      registeredAverageSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
    await hotspotsCollection.insertOne({
      day: "Thursday",
      weeksPast: 0,
      registeredAverageUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      registeredAverageSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
    await hotspotsCollection.insertOne({
      day: "Friday",
      weeksPast: 0,
      registeredAverageUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      registeredAverageSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
    await hotspotsCollection.insertOne({
      day: "Saturday",
      weeksPast: 0,
      registeredAverageUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredUCC: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      registeredAverageSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentRegisteredSCH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
  }
  // try{
  //   var c = await usersData.getCurrentRegisteredArray("Thursday", "UCC");
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
