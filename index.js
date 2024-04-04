import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();

const db = new pg.Client({
    user: 'postgres',
    password: '12345',
    database: "booknotes",
    host: "localhost",
    port: 5432,
  });
  db.connect();



app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));