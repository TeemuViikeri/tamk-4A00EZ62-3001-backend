const connection = require("./config.js");
const Validator = require("jsonschema").Validator;
const validator = new Validator();

const idSchema = {
  type: "number",
  minimum: 1,
};

const latitudeSchema = {
  type: "number",
  minimum: -90,
  maximum: 90,
};

const longitudeSchema = {
  type: "number",
  minimum: -180,
  maximum: 180,
};

const table = "locations";
const lat = "latitude";
const lon = "longitude";

const connectionFunctions = {
  connect: () => {
    connection.connect();
  },

  close: (callback) => {
    connection.end(callback);
  },

  save: (location, callback) => {
    const latitude = location.latitude;
    const longitude = location.longitude;

    const latitudeValidation = validator.validate(latitude, latitudeSchema);
    const longitudeValidation = validator.validate(longitude, longitudeSchema);

    const isLatitudeValid = latitudeValidation.valid;
    const isLongitudeValid = longitudeValidation.valid;

    if (isLatitudeValid && isLongitudeValid) {
      const sql = `INSERT INTO ${table} (${lat}, ${lon}) VALUES (?, ?)`;
      connection.query(
        sql,
        [latitude, longitude],
        (_error, result, _fields) => {
          callback(result);
        }
      );
    } else {
      if (!isLatitudeValid) {
        latitudeValidation.errors.forEach((error) =>
          console.log(`Error(s) with latitude: ${error.message}`)
        );
      }

      if (!isLongitudeValid) {
        longitudeValidation.errors.forEach((error) =>
          console.log(`Error(s) with longitude: ${error.message}`)
        );
      }
    }
  },

  findAll: (callback) => {
    const sql = `SELECT * FROM ${table}`;
    connection.query(sql, (_error, result, _fields) => {
      const locations = JSON.parse(JSON.stringify(result));
      callback(locations);
    });
  },

  deleteById: (id, callback) => {
    const idValidation = validator.validate(id, idSchema);

    const isIdValid = idValidation.valid;

    if (isIdValid) {
      const sql = `DELETE FROM ${table} WHERE id = ?`;
      connection.query(sql, [id], (_error, result, _fields) => {
        callback(result);
      });
    } else {
      idValidation.errors.forEach((error) =>
        console.log(`Error(s) with id: ${error.message}`)
      );
    }
  },

  findById: (id, callback) => {
    const idValidation = validator.validate(id, idSchema);

    const isIdValid = idValidation.valid;

    if (isIdValid) {
      const sql = `SELECT * FROM ${table} WHERE id = ?`;
      connection.query(sql, [id], (_error, result, _fields) => {
        const location = JSON.parse(JSON.stringify(result));
        callback(location);
      });
    } else {
      idValidation.errors.forEach((error) =>
        console.log(`Error(s) with id: ${error.message}`)
      );
    }
  },
};

module.exports = connectionFunctions;
