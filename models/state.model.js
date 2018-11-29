const mongoose = require('mongoose');

let StateSchema = mongoose.Schema(
    {
        state: {type: String, require: true},
        date: {type: String, require: true},
    }
);
module.exports = StateSchema;
