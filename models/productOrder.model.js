const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductOrderSchema = Schema(
    {
        productRef: {type: String, index: true},
        quantity: {type: Number, default: 1, required: false},
        cost: {type: Number, required: true},
        productInfo: {type: Array, required: false},
    }
);

module.exports = ProductOrderSchema;
