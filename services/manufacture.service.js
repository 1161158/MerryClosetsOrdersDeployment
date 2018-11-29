const Manufacture = require('../models/manufacture.model');
const city_service = require('./city.service');
const client = require('../utils/http.client');

function create(request){
    return new Promise(async function(resolve) {
        let exists = await city_service.get_city(request);
        if(exists.boolean === false){
            resolve({
                boolean: false,
                type: exists.type
            });
        }
        let manufacture = new Manufacture({
            factoryRef: request.body.factoryRef,
            cityName: request.body.cityName,
            name: request.body.name,
            coordinates: request.body.coordinates,
        });
        manufacture.save(function (err) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: manufacture
            });
        })
    })
}

function get_manufacture(request){
    return new Promise(async function(resolve) {
        Manufacture.findOne({'factoryRef': request.params.factoryRef}, async function (err, manufacture) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            if(!manufacture){
                resolve( {
                    boolean: false,
                    type: 'no manufacture'
                });
            }
            resolve({
                boolean: true,
                res: manufacture
            });
        })
    })
}

function get_all(){
    return new Promise(async function (resolve) {
        Manufacture.find({}, function (err, manufactures) {
            if (err) {
                resolve( {
                    boolean: false,
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: manufactures
            });
        })
    })
}

function update(request){
    return new Promise(async function (resolve) {
        if(request.body.factoryRef !== undefined){
            resolve({
                boolean: false,
                type: 'ref'
            });
        }
        if(request.body.cityName !== undefined){
            let exists = await city_service.get_city(request);
            if(exists.boolean === false){
                resolve({
                    boolean: false,
                    type: exists.type
                });
            }
        }
        Manufacture.findOneAndUpdate({'factoryRef': request.params.factoryRef}, {$set: request.body}, function (err, manufacture) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: manufacture
            });
        });
    })
}

function remove(request){
    return new Promise(async function(resolve) {
        Manufacture.findOneAndDelete({'factoryRef': request.params.factoryRef}, function (err, manufacture) {
            if (err) {
                resolve({
                    boolean: false,
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: manufacture
            });
        })
    })
}

function create_logistic(manufacture){
    return new Promise(async function(resolve) {
        resolve(client.post(JSON.stringify([manufacture]), "manufacture"));
    })
}

function update_logistic(manufacture){
    return new Promise(async function(resolve) {
        resolve(client.put(JSON.stringify([manufacture]), "manufacture", manufacture.factoryRef));
    })
}

function remove_logistic(manufacture){
    return new Promise(async function(resolve) {
        resolve(client.delete("manufacture", manufacture.factoryRef));
    })
}


exports.create = create;
exports.get_manufacture = get_manufacture;
exports.get_all = get_all;
exports.update = update;
exports.remove = remove;
exports.create_logistic = create_logistic;
exports.update_logistic = update_logistic;
exports.remove_logistic = remove_logistic;