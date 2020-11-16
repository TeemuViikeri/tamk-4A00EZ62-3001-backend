const express = require("express");
const locations = require("./routes/locations.js");
const database = require("./database/crudrepository");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.static("frontend/build"));
app.use(cors());
app.use("/locations", locations);
app.use(express.static("public"));

const port = 8080;

let server = app.listen(port, async () => {
  try {
    const pool = await database.connect();
    console.log(`Connected to host ${pool.config.host}:${port}.`);
  } catch (error) {
    console.log(
      `There was an error in connecting to the database. ${error}. Closing server...`
    );
    server.close();
  }
});
