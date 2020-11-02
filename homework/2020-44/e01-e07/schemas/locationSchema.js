const idSchema = require("./idSchema.js");

const locationSchema = {
  type: "object",
  properties: {
    id: idSchema,
    latitude: { type: "number", minimum: -90, maximum: 90 },
    longitude: { type: "number", minimum: -180, maximum: 180 },
  },
  required: ["id", "latitude", "longitude"],
};

module.exports = locationSchema;
