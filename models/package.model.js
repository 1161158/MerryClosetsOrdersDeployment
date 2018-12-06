const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PackageSchema =  Schema({
    tag: { type: String},
    sizeRef: { type: String, required: true},
    weight: { type: Number, required: true}
});

function create_package(order, size, weight, added){
    return new Promise(async function (resolve) {
        var tagConcat = 'o' + order.orderRef + 'p' +  added + 's' + size.sizeRef.substring(4,5);
        let newPackage = {
            tag: tagConcat,
            sizeRef: size.sizeRef,
            weight: weight
        };
        resolve(newPackage);
    })
}

module.exports = PackageSchema;
module.exports.create_package = create_package;
