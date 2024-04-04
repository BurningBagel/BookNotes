import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: 'postgres',
    password: '12345',
    database: "booknotes",
    host: "localhost",
    port: 5432,
  });
  db.connect();

app.get("/", async (req,res) =>{

    const books = await db.query("SELECT * FROM books;");

    res.render("index.ejs",{books:books.rows});
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });