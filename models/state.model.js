const mongoose = require('mongoose');
const StateEnum = require('./stateEnum.model');
const DateAndTime = require('date-and-time');

let StateSchema = mongoose.Schema(
    {
        state: {type: String, require: true},
        date: {type: String, require: true},
    }
);

function create_state(newState){
    return new Promise(async function(resolve) {
        if (await StateEnum.validate_state(newState)) {
            let result = {
                state: newState,
                date: DateAndTime.format(new Date(), 'DD/MM/YYYY HH:mm:ss'),
            };
            resolve({
                boolean: true,
                res: result
            })
        }else {
            resolve({
                boolean: false
            })
        }
    })
}

function is_produced(current_state){
    return StateEnum.is_produced(current_state);
}

function is_ready_to_ship(current_state){
    return StateEnum.is_ready_to_ship(current_state);
}

module.exports = StateSchema;
module.exports.is_produced = is_produced;
module.exports.is_ready_to_ship = is_ready_to_ship;
module.exports.create_state = create_state;
