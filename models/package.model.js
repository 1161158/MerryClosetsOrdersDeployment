const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Size = require('./size.model');
const uniqueValidator = require('mongoose-unique-validator');

let PackageSchema = Schema(
    {
        tag: { type: String, required: true, unique: true, index: true},
        sizeRef: { type: String, required: true},
    }
);

PackageSchema.plugin(uniqueValidator);
module.exports = PackageSchema;
