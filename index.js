import express from "express";
import bodyParser from "body-parser";

import { searchType } from "./public/enums/searchType.enum.js";
import { testMode } from "./public/enums/testMode.enum.js";
import nodeNotifier from "node-notifier";
import { selectSQL } from "./persistence/db_communication.js";


const TESTFLAG = process.argv[process.argv.length - 1];



/**
 * THE PLAN
 *
 * This is meant to be my registry of characters, events, factions and locales.
 *  Characters should have Name, Place of Origin, "Occupation", Affiliation(Rand Al'Thor, The Two Rivers, The Dragon Reborn, Dragonsworn)
 *  Events should have a Title, Location, Possible date, keys to related characters (Death of Lews Therin, Dragonmount, thousands of years ago, references Rand Al'Thor, Shai'tan, Lews Therin Telamon)
 *  Factions should have a Name, Location, Description, and keys to those inside the faction (Black Tower, Black Tower, Group of saidin users preparing themselves for Tarmon Gaidon as well as avoiding persecution from the Aes Sedai by teaching each other, Rand Al'Thor, the chief guy i forgot his name fuck i need this database)
 *  Locales should have a Name, Location relative to other places, Description, and keys to those related to it (Black Tower, Outskirts of Caemlyn(?), Previously known as The Farm, the Black Tower is in fact an abandoned farm that Rand appropriated as the headquarters for his army of saidin users, Rand Al'Thor, chief guy)
 *
 *
 * MAN THIS PLAN BALLOONED IN FRONT OF MY EYES
 * honestly this is shaping up to be quite something, but its gonna take a while to do. I'm gonna leave this as it is for now and finish it after the course.
 *
 * Main page -> Search Disambiguation(if needed) -> Details -> Search again
 *
 * still need to make inspect pages for different types of objects
 */

const app = express();
const port = 3000;

var currentSearchResults = [];
var currentSearchType;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



app.get("/", async (req, res) => {
  
  if (TESTFLAG == testMode.TEST) {
    console.log("TEST MODE ENABLED");
  }

  res.render("index.ejs");
});

app.post("/search", async (req, res) => {
  var searchResults = [];

  //TEST MODE
  if (TESTFLAG == testMode.TEST) {
    searchResults = [
      {
        name: "Rand Al'Thor",
      },
    ];

    currentSearchType = searchType.ENTITY;
  }

  //MAIN MODE
  else {
    //SO, we need to receive the query results and put the objects into an array for later use. However, since we can
    //have only 1 result, which wont be put into an array automatically, we need to make something that can handle either case
    //and still output an array. For this we use the flat() method on an empty array that just pushed the results of the query
    currentSearchType = req.body.type;
    searchResults = await selectSQL(req.body.searchTerm,currentSearchType);
    
  }

  currentSearchResults = searchResults.slice();
  //based on number of returned results, we either error back to main page, go straight to inspect, or show the disambiguation page

  //no results
  if (searchResults.length == 0) {
    nodeNotifier.notify({
      title: "Error",
      message: "No matches found. Please try again.",
    });
    console.log("No matches found!")
    res.render("index.ejs");
  }
  //1 result
  else if (searchResults.length == 1) {
    switch (currentSearchType) {
      case searchType.ENTITY:
        res.render("inspect/inspectEntity.ejs", { Entity: searchResults[0] });
        break;
      case searchType.EVENT:
        res.render("inspect/inspectEvent.ejs", { Event: searchResults[0] });
        break;
      case searchType.LOCATION:
        res.render("inspect/inspectLocation.ejs", {
          Location: searchResults[0],
        });
        break;

      default:
        console.log(
          `AN ERROR HAS OCCURRED! UNKNOWN SEARCH TYPE ${currentSearchType}`
        );
        res.render("index.ejs");
        return;
    }
  }

  //multiple results
  else {
    // console.log(searchResults);
    res.render("searchResults.ejs", {
      results: searchResults, type: currentSearchType
    });
  }
});

app.post("/inspect", async (req, res) => {
  let result;
  if (TESTFLAG == testMode.TEST) {
    result = {
      name: "Rand Al'Thor",
      description: "Tall, red-hair, grey eyes",
      occupation: "The Dragon Reborn",
      characteristics: "Can channel saidin; Swordmaster",
      species: "Human",
      affiliation: "The Dragon Reborn",
      location: "The Two Rivers",
    };
  } else {
    result = await selectSQL(req.body.search,req.body.type);
    // result = result.rows[0];
    //I need to query on every inspect due to the links mechanic
  }

  res.render(`inspect/inspect${currentSearchType}.ejs`, { Entry: result[0]});
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
