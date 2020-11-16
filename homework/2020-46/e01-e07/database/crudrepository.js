const pool = require("./config.js");
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
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }

        connection.release();
        resolve(connection);
      });
    }),

  close: () =>
    new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }

        connection.release();
        resolve(connection);
      });
    }),

  findById: (id) =>
    new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          const idValidation = validator.validate(id, idSchema);

          const isIdValid = idValidation.valid;

          if (isIdValid) {
            const sql = `SELECT * FROM ${table} WHERE id = ?`;
            connection.query(sql, [id], (err, result, _fields) => {
              if (err) {
                reject(err);
              }

              connection.release();
              const location = JSON.parse(JSON.stringify(result));
              resolve(location);
            });
          } else {
            reject(new Error("Id value is not valid [value > 0]."));
          }
        }
      });
    }),

  findAll: (obj) =>
    new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          let sql;

          if (Object.keys(obj).length > 0) {
            const keys = Object.keys(obj);

            const keysAreCorrect = validateKeys(keys);

            if (!keysAreCorrect) {
              reject(new Error("Request included invalid keys."));
            }

            const where = createWhereClause(keys);
            const order = createOrderClause(keys);
            sql = createSqlQuery(where, order);
          } else {
            sql = `SELECT * FROM ${table};`;
          }

          connection.query(sql, (err, result, _fields) => {
            if (err) {
              reject(err);
            } else {
              const locations = JSON.parse(JSON.stringify(result));
              console.log(locations);
              resolve(locations);
              connection.release();
            }
          });
        }
      });
    }),

  deleteById: (id) =>
    new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          const idValidation = validator.validate(id, idSchema);

          const isIdValid = idValidation.valid;

          if (isIdValid) {
            const sql = `DELETE FROM ${table} WHERE id = ?`;
            connection.query(sql, [id], (err, result, _fields) => {
              if (err) {
                reject(err);
              }

              resolve(result);
              connection.release();
            });
          } else {
            reject(new Error("Id value is not valid [value > 0]."));
          }
        }
      });
    }),

  deleteAll: () => {
    new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          const sql = `DELETE FROM ${table}`;
          connection.query(sql, (err, result, _fields) => {
            if (err) {
              reject(err);
            }

            resolve(result);
            connection.release();
          });
        }
      });
    });
  },

  save: (location) =>
    new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          const l = location;

          const latitude = l.toJSON().latitude;
          const longitude = l.toJSON().longitude;

          const latitudeValidation = validator.validate(
            latitude,
            latitudeSchema
          );
          const longitudeValidation = validator.validate(
            longitude,
            longitudeSchema
          );

          const isLatitudeValid = latitudeValidation.valid;
          const isLongitudeValid = longitudeValidation.valid;

          if (isLatitudeValid && isLongitudeValid) {
            const sql = `INSERT INTO ${table} (${lat}, ${lon}) VALUES (?, ?)`;
            connection.query(
              sql,
              [latitude, longitude],
              (err, result, _fields) => {
                if (err) {
                  reject(err);
                }

                resolve(result);
                connection.release();
              }
            );
          } else {
            if (!isLatitudeValid) {
              reject(new Error("Latitude value is not valid [-90 → 90]."));
            }

            if (!isLongitudeValid) {
              reject(new Error("Longitude value is not valid [-180 → 180]."));
            }
          }
        }
      });
    }),
};

function validateKeys(keys) {
  const keyIsCorrect = (key) =>
    key === "lat>" ||
    key === "lat<" ||
    key === "lon>" ||
    key === "lon<" ||
    key === "sort";

  return keys.every(keyIsCorrect);
}

function createWhereClause(keys) {
  let where = " WHERE ";

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (key === "sort") {
      continue;
    }

    if (i === keys.length - 1) {
      where += key + "=" + obj[key];
      break;
    }

    where += key + "=" + obj[key] + " AND ";
  }

  where = where.replace(/lat/g, "latitude");
  where = where.replace(/lon/g, "longitude");

  if (keys.length === 1 && keys.includes("sort")) {
    where = "";
  }

  return where;
}

function createOrderClause(keys) {
  let order = " ORDER BY ";

  const fsorts = obj.sort.split(" ").join("+");
  const sorts = fsorts.split(",");

  for (const sort of sorts) {
    if (order !== " ORDER BY ") {
      order = order + ",";
    }

    switch (sort) {
      case "+lat":
        order = order + "latitude ASC";
        break;
      case "-lat":
        order = order + "latitude DESC";
        break;
      case "+lon":
        order = order + "longitude ASC";
        break;
      case "-lon":
        order = order + "longitude DESC";
        break;
    }
  }

  if (order === " ORDER BY") {
    order = "";
  }

  if (order.substring(order.length - 1, order.length) === ",") {
    order = order.slice(0, -1);
  }

  return order;
}

function createSqlQuery(where, order) {
  const sql =
    `SELECT * FROM ${table}` +
    connection.escape(where) +
    connection.escape(order);
  sql = sql.replace(/['"]+/g, "");

  return sql;
}

module.exports = connectionFunctions;
