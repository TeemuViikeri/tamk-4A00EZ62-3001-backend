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
  connect: () =>
    new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          reject(err);
        }

        resolve(connection);
      });
    }),

  close: () =>
    new Promise((resolve, reject) => {
      connection.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    }),

  save: (location) =>
    new Promise((resolve, reject) => {
      const latitude = location.latitude;
      const longitude = location.longitude;

      const latitudeValidation = validator.validate(latitude, latitudeSchema);
      const longitudeValidation = validator.validate(
        longitude,
        longitudeSchema
      );

      const isLatitudeValid = latitudeValidation.valid;
      const isLongitudeValid = longitudeValidation.valid;

      if (isLatitudeValid && isLongitudeValid) {
        const sql = `INSERT INTO ${table} (${lat}, ${lon}) VALUES (?, ?)`;
        connection.query(sql, [latitude, longitude], (err, result, _fields) => {
          if (err) {
            reject(err);
          }

          resolve(result);
        });
      } else {
        if (!isLatitudeValid) {
          reject(new Error("Latitude value is not valid [-90 → 90]."));
        }

        if (!isLongitudeValid) {
          reject(new Error("Longitude value is not valid [-180 → 180]."));
        }
      }
    }),

  findAll: () =>
    new Promise((resolve, reject) => {
      const sql = `SELECT * FROM ${table}`;
      connection.query(sql, (err, result, _fields) => {
        if (err) {
          reject(err);
        } else {
          const locations = JSON.parse(JSON.stringify(result));
          resolve(locations);
        }
      });
    }),

  deleteById: (id) =>
    new Promise((resolve, reject) => {
      const idValidation = validator.validate(id, idSchema);

      const isIdValid = idValidation.valid;

      if (isIdValid) {
        const sql = `DELETE FROM ${table} WHERE id = ?`;
        connection.query(sql, [id], (err, result, _fields) => {
          if (err) {
            reject(err);
          }

          resolve(result);
        });
      } else {
        reject(new Error("Id value is not valid [value > 0]."));
      }
    }),

  findById: (id) =>
    new Promise((resolve, reject) => {
      const idValidation = validator.validate(id, idSchema);

      const isIdValid = idValidation.valid;

      if (isIdValid) {
        const sql = `SELECT * FROM ${table} WHERE id = ?`;
        connection.query(sql, [id], (err, result, _fields) => {
          if (err) {
            reject(err);
          }

          const location = JSON.parse(JSON.stringify(result));
          resolve(location);
        });
      } else {
        reject(new Error("Id value is not valid [value > 0]."));
      }
    }),
};

module.exports = connectionFunctions;
