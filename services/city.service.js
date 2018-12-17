const City = require('../models/city.model');
const client = require('../utils/http.client');

function create(request){
    return new Promise(async function(resolve) {
        if(request.body.cityName === undefined) {
            resolve({
                boolean: false,
                type: 'not valid'
            })
        }else if (request.body.cityName.length === 0) {
            resolve({
                boolean: false,
                type: 'not valid'
            })
        }else if (request.body.cityCoordinates === undefined) {
            resolve({
                boolean: false,
                type: 'not valid'
            })
        }else if (request.body.cityCoordinates.latitude === undefined) {
            resolve({
                boolean: false,
                type: 'not valid'
            })
        }else if (request.body.cityCoordinates.longitude === undefined) {
            resolve({
                boolean: false,
                type: 'not valid'
            })
        }else {
            let city = new City(
                {
                    cityName: request.body.cityName,
                    cityCoordinates: request.body.cityCoordinates
                }
            );
            city.save(function (err) {
                if (err) {
                    resolve({
                        boolean: false,
                        type: 'error',
                        res: err
                    });
                }
                resolve({
                    boolean: true,
                    res: city
                });
            })
        }
    })
}

function get_city_by_name(request){
    return new Promise(async function(resolve) {
        City.findOne({'cityName': request.params.cityName}, async function (err, city) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            if(!city){
                resolve( {
                    boolean: false,
                    type: 'no city'
                });
            }
            resolve({
                boolean: true,
                res: city
            });
        })
    })
}

function get_city(request){
    return new Promise(async function(resolve) {
        City.findOne({'cityName': request.body.cityName}, async function (err, city) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            if(!city){
                resolve( {
                    boolean: false,
                    type: 'no city'
                });
            }
            resolve({
                boolean: true,
                res: city
            });
        })
    })
}

function get_city_by_coordinates(coordinates){
    return new Promise(async function(resolve) {
        City.findOne(coordinates, async function (err, city) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            if(!city){
                resolve( {
                    boolean: false,
                    type: 'no city'
                });
            }
            resolve({
                boolean: true,
                res: city
            });
        })
    })
}

function get_all(){
    return new Promise(async function (resolve) {
        City.find({}, function (err, cities) {
            if (err) {
                resolve( {
                    boolean: false,
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: cities
            });
        })
    })
}

function remove(city){
    return new Promise(async function(resolve) {
        City.findOneAndDelete(city, function (err, size) {
            if (err) {
                resolve({
                    boolean: false,
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: size
            });
        })
    })
}

function create_logistic(city){
    return new Promise(async function(resolve) {
        resolve(client.post(JSON.stringify([city]), "city"));
    })
}

function update_logistic(city){
    return new Promise(async function(resolve) {
        resolve(client.put(JSON.stringify([city]), "city", city.cityName));
    })
}

function remove_logistic(city){
    return new Promise(async function(resolve) {
        resolve(client.delete("city", {latitude:city['cityCoordinates.latitude'], longitude:city['cityCoordinates.longitude']}));
    })
}


exports.create = create;
exports.get_city_by_name = get_city_by_name;
exports.get_city = get_city;
exports.get_city_by_coordinates = get_city_by_coordinates;
exports.get_all = get_all;
exports.remove = remove;
exports.create_logistic = create_logistic;
exports.update_logistic = update_logistic;
exports.remove_logistic = remove_logistic;