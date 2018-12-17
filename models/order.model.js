const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./productOrder.model');
const State = require('./state.model');
const Package = require('./package.model');

let AddressSchema = Schema(
    {
        street: {type: String, required: true},
        postal_code: {type: String, required: true},
        city: {type: String, required: true},
        country: {type: String, required: true},
    });

let OrderSchema = Schema(
    {
        orderRef: {type: String, unique: true, index: true},
        total_cost: {type: Number, required: false},
        address: {type: AddressSchema, required: true},
        products: {type: [Product], required: true},
        userRef: {type: String, required: true},
        orderState: {type: [State], required: false},
        manufactureRef: {type: String, required: false},
        packages: {type: [Package]}
    });

function current_state(order){
    return new Promise(async function (resolve) {
        let states = order.orderState;
        let currentState = (states[0]);
        for (let i = 0; i < states.length; i++) {
            if ((states[i].date >= currentState.date)) {
                currentState = states[i];
            }
        }
        resolve (currentState);
    })
}

function has_state(order, newState){
    return new Promise(async function (resolve) {
        for (let i = 0; i < order.orderState.length; i++) {
            if(order.orderState[i].state === newState){
                resolve({boolean: true});
            }
        }
        resolve({boolean: false});
    })
}

function can_add_packages(current_state){
    return new Promise(async function (resolve) {
          if(await State.is_produced(current_state) ||
              await State.is_ready_to_ship(current_state)){
                resolve(true);
          }
          resolve(false);
    })
}

module.exports = mongoose.model('Order', OrderSchema);
module.exports.current_state = current_state;
module.exports.can_add_packages = can_add_packages;
module.exports.has_state = has_state;
    