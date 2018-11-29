const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const GeoLocation = require('./geographicLocation.model');

let CitySchema = mongoose.Schema(
    {
		cityName: {type: String, unique: true, index: true},
		cityCoordinates: {type: GeoLocation, unique: true, index: true}
    }
);

CitySchema.plugin(uniqueValidator);
module.exports = mongoose.model('City', CitySchema);