const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const GeoLocation = require('./geographicLocation.model');

let ManufactureSchema = Schema({
    factoryRef: {type: String, unique: true, index: true},
    cityName: {type: String, require: true, unique: false},
    name: {type: String, require: true},
    coordinates: {type: GeoLocation, unique: true, index: true},
});

ManufactureSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Manufactory', ManufactureSchema);