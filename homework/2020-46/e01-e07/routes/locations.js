const express = require("express");
var cors = require("cors");
const Location = require("../models/location.js");
const database = require("../database/crudrepository");

var Validator = require("jsonschema").Validator;
var v = new Validator();
const locationSchema = require("../schemas/locationSchema.js");

const router = express.Router();
router.use(express.json());

router.get("/", async (req, res) => {
  let results = await database.findAll(req.query);
  res.send(results);
});

router.get("/:locationId([0-9]+)", async (req, res) => {
  const paramId = Number(req.params.locationId);

  const l = await database.findById(paramId);

  if (l.length === 0) {
    res.status(404).send("Can't find a location with the given id.");
  }

  res.status(200).send(l[0]);
});

router.post("/", async (req, res) => {
  const values = req.body;
  const l = new Location(values.latitude, values.longitude);

  const result = v.validate(l, locationSchema);

  if (result.valid) {
    await database.save(l);
    res.status(201).send(l);
  } else {
    const messages = result.errors.map((error) => {
      const p = error.property.substring(9);
      const message = error.message;
      return `${p} ${message}`;
    });

    res.status(400).send(res.statusCode + ": " + messages);
  }
});

router.delete("/:locationId([0-9]+)", async (req, res) => {
  const paramId = Number(req.params.locationId);

  try {
    const result = await database.deleteById(paramId);
    res.status(204).send(result);
  } catch (error) {
    if (l.affectedRows === 0) {
      res.status(404).send("Can't delete a location with the given id.");
    }
  }
});

module.exports = router;
