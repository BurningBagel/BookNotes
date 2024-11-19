import pg from "pg";
import { searchType } from "../public/enums/searchType.enum.js";

var dbConnected = false;

const db = new pg.Client({
  user: "postgres",
  password: "12345",
  database: "bookNotes",
  host: "localhost",
  port: 5433,
});


export async function selectSQL(searchTerm,searchType){
  var scratch;
  var searchResults = [];

  if (!dbConnected) {
      await db.connect();
      dbConnected = true;
    }

  try {
    scratch = await db.query(prepareSQL(searchTerm,searchType));
    
  } catch (error) {
    console.log(error);
    console.log(prepareSQL(searchTerm,searchType));
  }

  searchResults.push(scratch.rows);
  searchResults = searchResults.flat();

  return searchResults;
}

function prepareSQL(searchTerm,currentSearchType) {
    var sqlToUse = "SELECT * FROM ";
    var cleanedUpTerm;
  
    switch (currentSearchType) {
      case searchType.ENTITY:
        // sqlToUse = ENTITY_QUERY_SQL;
        sqlToUse += "ENTITIES WHERE ";
        break;
      case searchType.EVENT:
        // sqlToUse = EVENT_QUERY_SQL;
        sqlToUse += "EVENTS WHERE ";
        break;
      case searchType.LOCATION:
        // sqlToUse = LOCATION_QUERY_SQL;
        sqlToUse += "LOCATIONS WHERE ";
        break;
      default:
        console.log(
          `ERROR: UNKNOWN REQUEST TYPE IN PREPARESQL: ${currentSearchType}`
        );
        return;
    }
  
    //check nan, and append SQL accordingly
  
    //Replace apostrophes with SQL compatible double apostrophe
    cleanedUpTerm = searchTerm.replace("'", "''");
  
    //This function now handles search for both Name, which will be used in the main page search, and ID, which will be used later on with the disambiguation page, as well as links
    if (isNaN(searchTerm)) {
      sqlToUse += "UPPER(\"Name\") LIKE UPPER('%***%');";
      // sqlToUse = sqlToUse.replace("***","LIKE UPPER('%***%')");
      // sqlToUse = sqlToUse.replace("%%%","Name");
    } else {
      sqlToUse += "\"ID\" = ***;";
      // sqlToUse = sqlToUse.replace("***","= ***");
      // sqlToUse = sqlToUse.replace("%%%","ID");
    }
  
    sqlToUse = sqlToUse.replace("***", cleanedUpTerm);
    return sqlToUse;
  }



