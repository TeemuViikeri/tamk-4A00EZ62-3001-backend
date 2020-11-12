class Location {
  constructor(latitude, longitude) {
    this._latitude = latitude;
    this._longitude = longitude;
  }

  set latitude(value) {
    this._latitude = value;
  }

  set longitude(value) {
    this._longitude = value;
  }

  toJSON() {
    return {
      latitude: this._latitude,
      longitude: this._longitude,
    };
  }
}

module.exports = Location;
