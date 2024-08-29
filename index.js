import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { searchType } from "./public/enums/searchType.enum.js";
import { testMode } from "./public/enums/testMode.enum.js";

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
 */

const app = express();
const port = 3000;

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
  if (TESTFLAG == testMode.TEST) {
    console.log("hey!")
    searchResults = [
      {
        name: "Rand Al'Thor",
      },
    ];
    // currentSearchType = searchType.ENTITY;
  }

  res.render("searchResults.ejs", {
    results: searchResults,
    type: req.body.type,
  });
});

app.post("/inspect", async (req, res) => {
  if (TESTFLAG == testMode.TEST) {
    result = {
      name: "Rand Al'Thor",
      description: "Tall, red-hair, grey eyes",
      occupation: "The Dragon Reborn",
      characteristics: "Can channel saidin; Swordmaster",
      species: "Human",
      affiliation: "The Dragon Reborn",
      location: null,
    };
    res.render("inspect.ejs", { entity: result });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
