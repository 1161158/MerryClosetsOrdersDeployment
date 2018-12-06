const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let SizeSchema = Schema(
    {
        sizeRef: {type: String, required: true, unique: true, index: true},
        height: {type: Number, required: true},
        width: {type: Number, required: true},
        depth: {type: Number, required: true},
        minWeight: {type: Number},
        maxWeight: {type: Number,}
    }
);

SizeSchema.plugin(uniqueValidator);
module.exports = mongoose.model('PackageSize', SizeSchema);
