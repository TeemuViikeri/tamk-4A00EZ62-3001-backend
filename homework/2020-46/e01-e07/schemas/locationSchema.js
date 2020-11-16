const locationSchema = {
  type: "object",
  properties: {
    _latitude: { type: "number", minimum: -90, maximum: 90 },
    _longitude: { type: "number", minimum: -180, maximum: 180 },
  },
  required: ["_latitude", "_longitude"],
};

module.exports = locationSchema;
