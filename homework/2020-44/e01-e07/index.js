const express = require("express");
const locations = require("./routes/locations.js");

const app = express();
app.use(express.json());
const port = 8080;

app.use("/locations", locations);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
