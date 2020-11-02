const express = require("express");
const Location = require("../model/location.js");

var Validator = require("jsonschema").Validator;
var v = new Validator();
const locationSchema = require("../schemas/locationSchema.js");

let idCount = 1;
const locations = [];

prepareDatabase(locations);

const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  res.send(locations);
});

router.get("/:locationId([0-9]+)", (req, res) => {
  const paramId = Number(req.params.locationId);

  const l = locations.find((location) => location.id === paramId);

  if (l === undefined) {
    res.status(404).send("Can't find a location with the given id.");
  }

  res.status(200).send(locations.find((location) => location.id === paramId));
});

router.post("/", (req, res) => {
  const values = req.body;
  const l = new Location(idCount++, values.latitude, values.longitude);

  const result = v.validate(l, locationSchema);

  if (result.valid) {
    locations.push(l);
    res.status(201).send(l);
  } else {
    idCount--;

    const messages = result.errors.map((error) => {
      const p = error.property.substring(9);
      const message = error.message;
      return `${p} ${message}`;
    });

    res.status(400).send(res.statusCode + ": " + messages);
  }
});

router.delete("/:locationId([0-9]+)", (req, res) => {
  const paramId = Number(req.params.locationId);

  const l = locations.find((location) => location.id === paramId);
  console.log(l);

  if (l === undefined) {
    res.status(404).send("Can't find a location with the given id.");
  }

  const index = locations.indexOf(l);

  if (index === -1) {
    res.status(404).send("Can't find a location with the given id.");
  }

  res.status(204).send(locations.splice(index, 1));
});

function prepareDatabase(array) {
  for (let i = 1; i <= 5; i++) {
    const l = new Location(idCount++, i * 10, i * 10);

    const result = v.validate(l, locationSchema);

    if (result.valid) {
      array.push(l);
    }
  }

  console.log(array);
}

module.exports = router;
