const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GeoLocation = {
    latitude: {type: Number, unique: false, index: false},
    longitude: {type: Number, unique: false, index: false}
};

module.exports = GeoLocation;