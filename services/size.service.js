const Size = require('../models/size.model');
const client = require('../utils/http.client');

function create(request){
    return new Promise(async function(resolve) {
        let size = new Size(
            {
                sizeRef: request.body.sizeRef,
                height: request.body.height,
                width: request.body.width,
                depth: request.body.depth,
            }
        );
        if(request.body.minWeight !== undefined){
            size.minWeight = request.body.minWeight;
            size.maxWeight = request.body.maxWeight;

            if(size.minWeight > size.maxWeight){
                resolve({
                    boolean: false,
                    type: 'weight invalid'
                })
            }
        }
        size.save(function (err) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
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

function get_size(request){
    return new Promise(async function(resolve) {
        Size.findOne({'sizeRef': request.params.sizeRef}, async function (err, size) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            if(!size){
                resolve( {
                    boolean: false,
                    type: 'no size'
                });
            }
            resolve({
                boolean: true,
                res: size
            });
        })
    })
}

function get_all(){
    return new Promise(async function (resolve) {
        Size.find({}, function (err, sizes) {
            if (err) {
                resolve( {
                    boolean: false,
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: sizes
            });
        })
    })
}

function update(request){
    return new Promise(async function (resolve) {
        if(request.body.sizeRef !== undefined){
            resolve({
                boolean: false,
                type: 'ref'
            });
        }
        Size.findOneAndUpdate({'sizeRef': request.params.sizeRef}, {$set: request.body}, function (err, size) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: size
            });
        });
    })
}

function remove(request){
    return new Promise(async function(resolve) {
        Size.findOneAndDelete({'sizeRef': request.params.sizeRef}, function (err, size) {
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

function create_logistic(size){
    return new Promise(async function(resolve) {
        resolve(client.post(JSON.stringify(size), "packageSize"));
    })
}

function update_logistic(size){
    return new Promise(async function(resolve) {
        resolve(client.put(JSON.stringify([size]), "packageSize", size.sizeRef));
    })
}

function remove_logistic(size){
    return new Promise(async function(resolve) {
        resolve(client.delete(JSON.stringify([size]), "packageSize", size.sizeRef));
    })
}


exports.create = create;
exports.get_size = get_size;
exports.get_all = get_all;
exports.update = update;
exports.remove = remove;
exports.create_logistic = create_logistic;
exports.update_logistic = update_logistic;
exports.remove_logistic = remove_logistic;