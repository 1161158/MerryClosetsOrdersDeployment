const Order = require('../models/order.model');
const State = require('../models/state.model');
const StateEnum = require('../models/stateEnum.model');
const Package = require('../models/package.model');
const size_service = require('../services/size.service');
const manufacture_service = require('../services/manufacture.service');
const url = 'https://merryclosetsproductmanager.azurewebsites.net/api/';
const http = require('http');
const axios = require('axios');
const client = require('../utils/http.client');

function create(request, userRef) {
    return new Promise(async function (resolve) {
        if(request.body.products === undefined){
            resolve({
                boolean: false,
                type: 'no products',
            })
        }else if (request.body.products.length === 0) {
            resolve({
                boolean: false,
                type: 'no products',
            })
        }else {
            let info = await iterateProducts(request.body.products, request.get('Authorization'));
            if (info === undefined) {
                resolve({
                    boolean: false,
                    type: '0 returned'
                })
            } else {
                let orders = await get_all();
                let newOrderRef = orders.res.length + 1;
                let states = [];
                let result = await State.create_state("Em Validação");
                if (result.boolean === false) {
                    resolve({
                        boolean: false,
                        type: 'state '
                    })
                }
                states.push(result.res);
                let order = new Order(
                    {
                        orderRef: newOrderRef,
                        total_cost: info.cost,
                        address: request.body.address,
                        products: info.array,
                        orderState: states,
                        userRef: userRef,
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
            }
        }
    })
}

async function iterateProducts(products, tokenString) {
    var array = [];
    let product;
    let final_cost = 0;
    let json;
    for (let i = 0; i < products.length; i++) {
        product = products[i];
        try {
            json = await getProductInfo(url + 'configuredProduct/' + product.productRef + '/all-info', tokenString);
            product.productInfo = json;
            product.cost = product.productInfo.price.value;
            if (product.quantity === undefined) {
                product.quantity = 1;
                final_cost = final_cost + (product.cost * product.quantity);
            } else {
                final_cost = final_cost + (product.cost * product.quantity);
            }
            array.push(product);
        } catch (e) {
            return undefined;
        }
    }
    return {
        array: array,
        cost: final_cost
    };
}

function getProductInfo(url, tokenString) {
    return new Promise(async function (resolve, reject) {
        axios.get(url, { headers: { Authorization: tokenString } })
            .then((res) => {
                resolve(res.data);
            })
            .catch(() => {
                reject();
            });
    });
}

function get_order(request) {
    return new Promise(async function (resolve) {
        Order.findOne({ 'orderRef': request.params.orderRef }, async function (err, order) {
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
            resolve({
                boolean: true,
                res: order
            });
        })
    })
}

function get_all() {
    return new Promise(async function (resolve) {
        Order.find({}, function (err, orders) {
            if (err) {
                resolve({
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

function get_all_by_client(userRef) {
    return new Promise(async function (resolve) {
        Order.find({ 'userRef': userRef }, function (err, orders) {
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
    });
}

function get_current_state(request) {
    return new Promise(async function (resolve) {
        if (request.params === undefined || request.params.orderRef.packages !== undefined) {
            Order.findOne({ 'orderRef': request.orderRef }, async function (err, order) {
                let result = await Order.current_state(order);
                resolve({
                    order: order,
                    state: result
                });
            })
        } else {
            Order.findOne({ 'orderRef': request.params.orderRef }, async function (err, order) {
                let result = await Order.current_state(order);
                resolve({
                    order: order,
                    state: result
                });
            })
        }
    })
}

function update_state(request) {
    return new Promise(async function (resolve) {
        let result = await has_state(request);
        if (result.boolean === true) {
            let array = await new_state(request, result.res);
            if (array.boolean === false) {
                resolve({
                    boolean: false,
                    type: 'not valid'
                });
            } else if (array.boolean === true) {
                Order.findOneAndUpdate({ 'orderRef': request.params.orderRef }, { $set: { orderState: array.res } }, { new: true }, (err, order) => {
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
        } else if (result.boolean === false) {
            let newState = await State.create_state(request.body.orderState);
            if (newState.boolean === false) {
                resolve({
                    boolean: false,
                    type: 'not valid'
                });
            } else if (newState.boolean === true) {
                Order.findOneAndUpdate({ 'orderRef': request.params.orderRef }, { $push: { orderState: newState.res } }, { new: true }, (err, order) => {
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
    return new Promise(async function (resolve) {
        let newStates = [];
        for (let i = 0; i < order.orderState.length; i++) {
            if (order.orderState[i].state === request.body.orderState) {
                let newState = await State.create_state(request.body.orderState);
                if (newState.boolean === false) {
                    resolve({
                        boolean: false
                    })
                }
                newStates.push(newState);
            } else {
                newStates.push(order.orderState[i]);
            }
        }
        resolve({
            boolean: true,
            array: newStates
        });
    })
}

function has_state(request) {
    return new Promise(async function (resolve) {
        Order.findOne({ 'orderRef': request.params.orderRef }, async function (err, order) {
            let result = await Order.has_state(order, request.body.orderState);
            if (result.boolean === false) {
                resolve({ boolean: false });
            } else {
                resolve({
                    boolean: true,
                    res: order
                });
            }
        })
    })
}

function add_packages(request) {
    return new Promise(async function (resolve) {
        let result = await get_current_state(request);
        if (await Order.can_add_packages(result.state.state)) {
            let newPackages = await make_packages(request, request.body.packages, result.order);
            if (newPackages.boolean === false) {
                resolve(newPackages);
            } else {
                Order.findOneAndUpdate({ 'orderRef': request.params.orderRef }, { $push: { packages: newPackages.res } }, { new: true }, (err, order) => {
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
                    if (State.is_produced(result.state.state)) {
                        let body = { orderState: StateEnum.READY_TO_SHIP.value };
                        let params = { orderRef: order.orderRef };
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
        } else {
            resolve({
                boolean: false,
                type: 'not valid'
            })
        }
    })
}

function make_packages(request, packages, order) {
    return new Promise(async function (resolve) {
        let newPackages = [];
        let newPackagesTmp1 = [];
        var added = order.packages.length;
        for (var i = 0; i < packages.length; i++) {
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
                if (newPackagesTmp2.type === 'weight invalid') {
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

function make(request, package, order, added) {
    return new Promise(async function (resolve) {
        let params = { sizeRef: package.sizeRef };
        let request = { params: params };
        let result = await size_service.get_size(request);
        if (result.boolean === false) {
            if (result.type === 'error') {
                resolve({
                    boolean: false,
                    type: 'size error',
                    res: err
                });
            }
            if (result.type === 'no size') {
                resolve({
                    boolean: false,
                    type: 'no size',
                });
            }
        }
        let newPackages = [];
        for (var j = 0; j < package.quantity; j++) {
            added++;
            let newPackage = await Package.create_package(order, result.res, package.weight, added);
            if (result.res.minWeight !== undefined) {
                if (newPackage.weight >= result.res.minWeight && newPackage.weight <= result.res.maxWeight) {
                    newPackages.push(newPackage);
                } else {
                    resolve({
                        boolean: false,
                        type: 'weight invalid',
                    });
                }
            } else {
                newPackages.push(newPackage);
            }
        }
        resolve({
            boolean: true,
            res: newPackages
        });
    })
}

function get_best_manufacture(order) {
    return new Promise(async function (resolve) {
        let manufacture = await client.get('best_manufactory', { orderCity: order.address.city });
        if (!manufacture) {
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

function add_manufacture(request, order) {
    return new Promise(async function (resolve) {
        let params = { factoryRef: request.body.factoryRef };
        let newRequest = { params };
        let result = await manufacture_service.get_manufacture(newRequest);
        if (result.boolean === false) {
            if (result.type === 'error') {
                resolve({
                    boolean: false,
                    type: 'manufacture error',
                    res: err
                });
            }
            if (result.type === 'no manufacture') {
                resolve({
                    boolean: false,
                    type: 'no manufacture',
                });
            }
        }
        Order.findOneAndUpdate({ 'orderRef': order.orderRef }, { manufactureRef: result.res.factoryRef }, { new: true }, (err, newOrder) => {
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
exports.add_manufacture = add_manufacture;