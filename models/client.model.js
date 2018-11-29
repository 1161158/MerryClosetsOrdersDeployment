const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Object = Schema.Types.Object;

const ClientSchema = Schema(
    {
        clientRef: {type: String, index: true},
        name: {type: String, required: true},
        nif: {type: String, length: 9, required: true},
    });

module.exports = mongoose.model('Client', ClientSchema);
