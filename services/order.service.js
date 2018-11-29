const Order = require('../models/order.model');
const StateEnum = require('../models/stateEnum.model');
const size_service = require('../services/size.service');
const manufacture_service = require('../services/manufacture.service');
const url = 'http://localhost:5000/api/';
const http = require('http');
const client = require('../utils/http.client');
const DateAndTime = require('date-and-time');

function create(request){
    return new Promise(async function(resolve) {
        if(request.body.products.length === 0 || request.body.products === undefined){
            resolve({
                boolean: false,
                type: 'no products',
            })
        }
        let info = await iterateProducts(request.body.products);
        if(info === undefined){
            resolve({
                boolean: false,
                type: '0 returned'
            })
        }
        let orders = await get_all();
        let number = orders.res.length;
        let newOrderRef;
        if(number === 0){
            newOrderRef = 1;
        }else{
            newOrderRef = number + 1;
        }
        let states = [];
        let state = {
            state: StateEnum.VALIDATING.value,
            date: DateAndTime.format(new Date(), 'DD/MM/YYYY HH:mm:ss'),
        };
        states.push(state);
        let newPackages = [];
        let order = new Order(
            {
                orderRef: newOrderRef,
                total_cost: info.cost,
                address: request.body.address,
                products: info.array,
                orderState: states,
                client: request.body.client,
                packages: newPackages,
            }
        );
        order.save(function (err) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: order
            });
        })
    })
}

async function iterateProducts(products) {
    var array = [];
    let product;
    let final_cost = 0;
    let json;
    for (let i = 0; i < products.length; i++) {
        product = products[i];
        json = await getProductInfo(url + 'configuredProduct/' + product.productRef + '/all-info');
        product.productInfo = json;
        product.cost = product.productInfo.price.value;
        if(product.quantity === undefined) {
            product.quantity = 1;
            final_cost = final_cost + (product.cost * product.quantity);
        }else{
            final_cost = final_cost + (product.cost * product.quantity);
        }
        array.push(product);
    }
    return {
        array: array,
        cost: final_cost
    };
}

function getProductInfo(url) {
    return new Promise(async function (resolve, reject) {
        var req = http.get(url,(res) =>{
            res.setEncoding("utf8");
            let body = "";
            res.on("data", (data) => {
                body += data;
            });

            res.on("end",()=>{
                body = JSON.parse(body);
                resolve(body);
            });
        }).on("error", reject);
        req.end();
    });
}

function get_order(request){
    return new Promise(async function(resolve) {
        Order.findOne({'orderRef': request.params.orderRef}, async function (err, order) {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                });
            }
            if(!order){
                resolve( {
                    boolean: false,
                    type: 'no order'
                });
            }
            resolve({
                boolean: true,
                res: order
            });
        })
    })
}

function get_all(){
    return new Promise(async function (resolve) {
        Order.find({}, function (err, orders) {
            if (err) {
                resolve( {
                    boolean: false,
                    res: err
                });
            }
            resolve({
                boolean: true,
                res: orders
            });
        })
    })
}

function get_all_by_client(request) {
    /////// MAIS TARDE VERIFICAR SE INTRODUZIDO CLIENTE EXISTE
    Order.find({'clientRef': request.params.clientId}, function (err, orders) {
        if (err) {
            resolve({
                boolean: false,
                type: 'error',
                res: err
            })
        }
        resolve({
            boolean: true,
            res: orders
        });
    })
}

function get_current_state(request){
    return new Promise(async function (resolve) {
        if(request.params === undefined){
            Order.findOne({'orderRef': request.orderRef}, function (err, order) {
                let states = order.orderState;
                let currentState = (states[0]);
                for (let i = 0; i < states.length; i++) {
                    if ((states[i].date >= currentState.date)) {
                        currentState = states[i];
                    }
                }
                resolve({
                    order: order,
                    state: currentState
                });
            })
        }else {
            Order.findOne({'orderRef': request.params.orderRef}, function (err, order) {
                let states = order.orderState;
                let currentState = (states[0]);
                for (let i = 0; i < states.length; i++) {
                    if ((states[i].date >= currentState.date)) {
                        currentState = states[i];
                    }
                }
                resolve({
                    order: order,
                    state: currentState
                });
            })
        }
    })
}

function update_state(request){
    return new Promise(async function (resolve) {
        let is_valid = await StateEnum.validate_state_to_update(request.body.orderState);
        if (!is_valid) {
            resolve({
                boolean: false,
                type: 'not valid'
            });
        }else {
            let result = await has_state(request);
            if (result.boolean) {
                let array = await new_state(request, result.res);
                Order.findOneAndUpdate({'orderRef': request.params.orderRef}, {$set: {orderState: array}}, {new: true}, (err, order) => {
                    if (err) {
                        resolve({
                            boolean: false,
                            type: 'error',
                            res: err
                        });
                    }
                    resolve({
                        boolean: true,
                        res: order
                    });
                });
            } else {
                let newState = {
                    state: request.body.orderState,
                    date: DateAndTime.format(new Date(), 'DD/MM/YYYY HH:mm:ss')
                };
                Order.findOneAndUpdate({'orderRef': request.params.orderRef}, {$push: {orderState: newState}}, {new: true}, (err, order) => {
                    if (err) {
                        resolve({
                            boolean: false,
                            type: 'error',
                            res: err
                        });
                    }
                    resolve({
                        boolean: true,
                        res: order
                    });
                });
            }
        }
    })
}

function new_state(request, order) {
    return new Promise(async function (resolve){
        let newStates = [];
        for (let i = 0; i < order.orderState.length; i++) {
            if(order.orderState[i].state === request.body.orderState){
                let newState = {
                    state: request.body.orderState,
                    date: DateAndTime.format(new Date(), 'DD/MM/YYYY HH:mm:ss'),
                };
                newStates.push(newState);
            }else{
                newStates.push(order.orderState[i]);
            }
        }
        resolve(newStates);
    })
}

function has_state(request){
    return new Promise(async function (resolve){
        Order.findOne({'orderRef': request.params.orderRef}, function (err, order) {
            for (let i = 0; i < order.orderState.length; i++) {
                if(order.orderState[i].state === request.body.orderState){
                    resolve({
                        boolean: true,
                        res: order
                    });
                }
            }
            resolve({boolean: false});
        })
    })
}

function add_packages(request){
    return new Promise(async function (resolve){
        let result = await get_current_state(request);
        if((StateEnum.is_produced(result.state.state)) ||
            StateEnum.is_ready_to_ship(result.state.state)){
            let newPackages = await make_packages(request, request.body.packages, result.order);
            if (newPackages.boolean === false) {
                resolve(newPackages);
            }else{
                Order.findOneAndUpdate({'orderRef': request.params.orderRef}, {$push: {packages: newPackages.res}}, {new: true},(err, order) => {
                    if (err) {
                        resolve({
                            boolean: false,
                            type: 'error',
                            res: err
                        });
                    }
                    if (!order) {
                        resolve({
                            boolean: false,
                            type: 'no order'
                        });
                    }
                    if(StateEnum.is_produced(result.state.state)) {
                        let body = {orderState: StateEnum.READY_TO_SHIP.value};
                        let params = {orderRef: order.orderRef};
                        let request = {
                            body: body,
                            params: params
                        };
                        update_state(request);
                        resolve({
                            boolean: true,
                            res: order
                        });
                    }
                });
            }
        }else{
            resolve({
                boolean: false,
                type: 'not valid'
            })
        }
    })
}

function make_packages(request, packages, order){
    return new Promise(async function (resolve){
        let newPackages = [];
        let newPackagesTmp1 = [];
        var added = order.packages.length;
        for(var i = 0; i < packages.length ; i++) {
            let package = packages[i];
            if (package.quantity === undefined) {
                package.quantity = 1;
            }
            let newPackagesTmp2 = await make(request, package, order, added);
            if (newPackagesTmp2.boolean === false) {
                if (newPackagesTmp2.type === 'size error') {
                    resolve(newPackagesTmp2);
                }
                if (newPackagesTmp2.type === 'no size') {
                    resolve(newPackagesTmp2);
                }
            } else {
                newPackages = newPackagesTmp1.concat(newPackagesTmp2.res);
                newPackagesTmp1 = newPackages;
                added += package.quantity;
            }
        }
        resolve({
            boolean: true,
            res: newPackages
        });
    })
}

function make(request, package, order,added){
    return new Promise(async function (resolve){
        let params = {sizeRef: package.sizeRef};
        let request = {params: params};
        let result = await size_service.get_size(request);
        if(result.boolean === false){
            if(result.type === 'error'){
                resolve({
                    boolean: false,
                    type: 'size error',
                    res: err
                });
            }
            if(result.type === 'no size'){
                resolve({
                    boolean: false,
                    type: 'no size',
                });
            }
        }
        let newPackages = [];
        for(var j = 0; j < package.quantity; j++){
            added++;
            var tagConcat = 'o' + order.orderRef + 'p' +  added + 's' + result.res.sizeRef.substring(4,5);
            let newPackage = {
                tag: tagConcat,
                sizeRef: result.res.sizeRef,
            };
            newPackages.push(newPackage);
        }
        resolve({
            boolean: true,
            res: newPackages
        });
    })
}

function get_best_manufacture(order) {
    return new Promise(async function (resolve){
        let manufacture = await client.get('best_manufactory', {orderCity: order.address.cityName});
        console.log(manufacture);
        if(!manufacture) {
            resolve({
                boolean: false
            });
        }
        resolve({
            boolean: true,
            res: manufacture
        });
    })
}

function add_manufactures(request, order) {
    return new Promise(async function (resolve) {
        let params = {factoryRef: request.body.factoryRef};
        let newRequest = {params};
        let result = await manufacture_service.get_manufacture(newRequest);
        if(result.boolean === false){
            if(result.type === 'error'){
                resolve({
                    boolean: false,
                    type: 'manufacture error',
                    res: err
                });
            }
            if(result.type === 'no manufacture'){
                resolve({
                    boolean: false,
                    type: 'no manufacture',
                });
            }
        }
        Order.findOneAndUpdate({'orderRef': order.orderRef}, {manufactureRef: result.res.factoryRef}, {new: true}, (err, newOrder) => {
            if (err) {
                resolve({
                    boolean: false,
                    type: 'error',
                    res: err
                })
            }
            resolve({
                boolean: true,
                res: newOrder
            })
        })
    })
}

exports.create = create;
exports.get_order = get_order;
exports.get_all = get_all;
exports.get_all_by_client = get_all_by_client;
exports.get_current_state = get_current_state;
exports.update_state = update_state;
exports.add_packages = add_packages;
exports.get_best_manufacture = get_best_manufacture;
exports.add_manufactures = add_manufactures;