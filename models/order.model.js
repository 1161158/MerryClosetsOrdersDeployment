const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./productOrder.model');
const State = require('./state.model');
const Package = require('./package.model');
const Object = Schema.Types.Object;

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
        client: {type: Object, ref: 'Client'},
        orderState: {type: [State], required: false},
        manufactureRef: {type: String, required: false},
        packages: {type: [Package], required: false}
    });

module.exports = mongoose.model('Order', OrderSchema);
    