const express = require("express");
const locations = require("./routes/locations.js");
const database = require("./database/crudrepositoryPromise");

const app = express();
app.use(express.json());
const port = 8080;

app.use("/locations", locations);

let server = app.listen(port, async () => {
  try {
    let connection = await database.connect();
    console.log(`Connected to host ${connection.config.host}.`);
  } catch (error) {
    console.log(
      `There was an error in connecting to the database. ${error}. Closing server...`
    );
    server.close();
  }
});
