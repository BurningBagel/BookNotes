import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { searchType } from "./public/enums/searchType.enum.js";
import { testMode } from "./public/enums/testMode.enum.js";
import nodeNotifier from "node-notifier";

const TESTFLAG = process.argv[process.argv.length-1];

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const db = new pg.Client({
//     user: 'postgres',
//     password: '12345',
//     database: "booknotes",
//     host: "localhost",
//     port: 5432,
//   });
//   db.connect();

app.get("/", async (req, res) => {
  // const books = await db.query("SELECT * FROM books;");
    if(TESTFLAG == testMode.TEST){
        console.log("TEST MODE ENABLED")
    }
    else{
        console.log("TEST MODE NOT ENABLED")
    }
  res.render("index.ejs");
});

app.post("/search", async (req, res) => {
  var searchResults;

  //TEST MODE
  if (TESTFLAG == testMode.TEST) {
    searchResults = [
      {
        name: "Rand Al'Thor",
      },
    ];
    currentSearchResults = searchResults.slice();
    currentSearchType = searchType.ENTITY;
  }

  //MAIN MODE
  else{
    //searchResults = db.query()...TODO

    currentSearchType = req.type;
  }
    //based on number of returned results, we either error back to main page, go straight to inspect, or show the disambiguation page

    //no results
  if(searchResults.length == 0){
    nodeNotifier.notify({
      title:"Error",
      message:"No matches found. Please try again."
    })
    res.render("index.ejs");
  }
  //1 result
  else if(searchResults.length == 1){
    
    switch (currentSearchType) {
      case searchType.ENTITY:
        res.render("inspect/inspectEntity.ejs",{entity:searchResults[0]})
        break;
      case searchType.EVENT:
        res.render("inspect/inspectEvent.ejs",{event:searchResults[0]})
        break;
      case searchType.LOCATION:
        res.render("inspect/inspectLocation.ejs",{location:searchResults[0]})
        break;
    
      default:
        console.log(`AN ERROR HAS OCCURRED! UNKNOWN SEARCH TYPE ${currentSearchType}`)
        res.render("index.ejs")
        return;
    }
    
  }

  //multiple results
  else{
    res.render("searchResults.ejs", {
      results: searchResults
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
    
  }
  else{
    //result = db.query()
    //wait, if I have all the results, I dont need to query again
  }

  res.render("inspect.ejs", { entity: result });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
