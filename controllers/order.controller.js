const Json = require('../utils/json.formatter');
const logger = require('../utils/custom.logger');
const loggerEvent = require('../utils/logging.events');
const service = require('../services/order.service');

const NO_SIZE = 'Tamanho não existe.';
const NO_ORDER = 'Encomenda não existe.';
const NO_MANUFACTURE = 'Fábrica não existe.';
const NO_PRODUCTS = 'Não foram especificados produtos.';
const PRODUCTS_NOT_FOUND = 'Produtos especificados não existem.';
const NOT_SAVED = 'Encomenda não guardada.';
const STATE_NOT_VALID = 'Estado de Encomenda não é válido.';

exports.submit_order = async function (request, response) {
    logger.logInformation(loggerEvent.PostItem.value, 'Creating Order By Json: ', '');
    let result = await service.create(request);
    if(result.boolean === false){
        if(result.type === 'error'){
            logger.logError(loggerEvent.PostBadRequest.value, 'Creating Order Failed: JSON is not valid => ', result.res.message);
            return response.status(400).send(Json.json_to_string(NOT_SAVED, response));
        }
        if(result.type === 'no products'){
            logger.logError(loggerEvent.PostNotFound.value, 'Creating Order Failed: JSON is not valid => ', NO_PRODUCTS);
            return response.status(404).send(Json.json_to_string(NO_PRODUCTS, response));
        }
        if(result.type === '0 returned'){
            logger.logError(loggerEvent.PostNotFound.value, 'Creating Order Failed: JSON is not valid => ', PRODUCTS_NOT_FOUND);
            return response.status(404).send(Json.json_to_string(PRODUCTS_NOT_FOUND, response));
        }
    }
    let stateJson = await service.get_current_state(result.res);
    let orderJson = {
        orderRef: result.res.orderRef,
        address: result.res.address,
        total_cost: result.res.total_cost,
        products: result.res.products,
        orderState: stateJson.state,
        client: result.res.client,
    };
    logger.logInformation(loggerEvent.PostCreated.value, 'Creating Order Succeeded: ', result.res.orderRef);
    return response.status(201).send(orderJson);
};

exports.get_order = async function (request, response) {
    logger.logInformation(loggerEvent.GetItem.value, 'Getting Order By Reference: ', request.params.orderRef);
    let result = await service.get_order(request);
    if (result.boolean === false) {
        if (result.type === 'error') {
        }
        logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Order Failed: ', result.res.message);
        return response.status(400).send(Json.json_to_string(result.res, response));

        if (result.type === 'no order') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of order =>', 'There are no Orders with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
    }
    let stateJson = await service.get_current_state(result.res);
    let orderJson = {
        orderRef: result.res.orderRef,
        address: result.res.address,
        total_cost: result.res.total_cost,
        products: result.res.products,
        orderState: stateJson.state,
        client: result.res.client,
        packages: result.res.packages,
        manufactureRef: result.res.manufactureRef,
    };
    logger.logInformation(loggerEvent.GetItemOk.value, 'Getting Order Succeeded: ', result.res.orderRef);
    response.status(200).send(orderJson);

};

exports.get_current_state= async function(request, response){
    logger.logInformation(loggerEvent.GetItem.value, 'Getting State By Reference: ', request.params.orderRef);
    let exists = await service.get_order(request);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
        }
        logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Order Failed: ', exists.res.message);
        return response.status(400).send(Json.json_to_string(exists.res, response));

        if (exists.type === 'no order') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of order =>', 'There are no Orders with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
    }
    let result = await service.get_current_state(request);
    logger.logInformation(loggerEvent.GetItemOk.value, 'Getting State Succeeded: ', result.order.orderRef);
    return response.status(200).send(result.state);
};

exports.all_states = async function (request, response) {
    logger.logInformation(loggerEvent.GetItem.value, 'Getting Order By Reference: ', request.params.orderRef);
    let result = await service.get_order(request);
    if(result.boolean === false) {
        if (result.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Order Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        if (result.type === 'no order') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of order =>', 'There are no Orders with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
    }
    logger.logInformation(loggerEvent.GetItemOk.value, 'Getting Order Succeeded: ', result.res.orderRef);
    response.status(200).send(result.res.orderState);
};

exports.all_orders_by_client = async function (request, response) {
    logger.logInformation(loggerEvent.GetAllItems.value, 'Getting All Orders By Client: ', request.params.clientId);
    let result = await service.get_all_by_client(request);
    if(result.boolean === false){
        if(result.type === 'error'){
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Orders Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
    }
    let ordersJson = [];
    let orderJson;
    for (let i = 0; i < result.res.length; i++) {
        let stateJson = await service.get_current_state(result.res[i]);
        orderJson = {
            orderRef: result.res[i].orderRef,
            orderState: stateJson.state,
            packages: result.res[i].packages,
        };
        ordersJson.push(orderJson);
    }
    logger.logInformation(loggerEvent.GetAllOk.value, 'Getting All Manufactures Succeeded: ', '');
    return response.status(200).send(orderJson);
};

exports.all_orders = async function (request, response) {
    logger.logInformation(loggerEvent.GetAllItems.value, 'Getting All Orders', '' );
    let result = await service.get_all();
    if (result.boolean === false) {
        logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Orders Failed: ', result.res.message);
        return response.status(400).send(Json.json_to_string(result.res, response));
    }
    let ordersJson = [];
    let orderJson;
    for (let i = 0; i < result.res.length; i++) {
        let stateJson = await service.get_current_state(result.res[i]);
        orderJson = {
            orderRef: result.res[i].orderRef,
            orderState: stateJson.state,
            packages: result.res[i].packages,
        };
        ordersJson.push(orderJson);
    }
    logger.logInformation(loggerEvent.GetAllOk.value, 'Getting All Orders Succeeded: ', ordersJson);
    response.status(200).send(ordersJson);
};

exports.update_state = async function (request, response) {
    logger.logInformation(loggerEvent.UpdateItem.value, 'Updating State of Order', request.params.orderRef);
    let exists = await service.get_order(request);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Order Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if (exists.type === 'no order') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of order =>', 'There are no Order with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
    }
    let result = await service.update_state(request);
    if(result.boolean === false) {
        if (result.type === 'not valid') {
            logger.logWarning(loggerEvent.UpdateBadRequest.value, 'ERROR: ', 'Not possible to update state.');
            return response.status(400).send(Json.json_to_string(STATE_NOT_VALID, response));
        }
        if (result.type === 'error') {
            logger.logError(loggerEvent.UpdateBadRequest.value, 'Updating Order Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
    }
    logger.logInformation(loggerEvent.UpdateOk.value, 'Updating State of Order Succeeded: ', result.res.orderState[result.res.orderState.length-1]);
    return response.status(204).send();
};

exports.add_packages = async function (request, response){
    logger.logInformation(loggerEvent.UpdateItem.value, 'Add Packages of Order', request.params.orderRef);
    let exists = await service.get_order(request);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Order Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if (exists.type === 'no order') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of order =>', 'There are no Order with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
    }
    let result = await service.add_packages(request);
    if(result.boolean === false){
        if(result.type === 'error'){
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Adding Packages Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        if(result.type === 'size error'){
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Sizes Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        if(result.type === 'no size'){
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Size Failed: Reference of size =>', 'There are no Sizes with the given reference');
            return response.status(404).send(Json.json_to_string(NO_SIZE, response));
        }
        if(result.type === 'no order'){
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of order =>', 'There are no Orders with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
        if(result.type === 'not valid') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Adding Packages failed.', 'Not able to add packages because state of order is not Produced');
            return response.status(400).send(Json.json_to_string(STATE_NOT_VALID, response));
        }
    }
    logger.logInformation(loggerEvent.UpdateOk.value, 'Updating State of Order Succeeded: ', result.res.orderRef);
    return response.status(204).send();
};

exports.get_best_manufacture = async function (request, response){
    logger.logInformation(loggerEvent.GetItem.value, 'Getting Best Manufacture By Reference: ', request.body.orderRef);
    let exists = await service.get_order(request);
    if(exists.boolean === false){
        if(exists.type === 'error'){
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Order Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if(exists.type === 'no order'){
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of Order =>', 'There are no Order with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
    }
    let result = await service.get_best_manufacture(exists.res);
    if(result.boolean === false){
        logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting manufacture Failed: Reference of manufacture =>', 'There are no Manufactures with the given reference');
        return response.status(404).send(Json.json_to_string(NO_MANUFACTURE, response));
    }
    logger.logInformation(loggerEvent.GetItemOk.value, 'Getting manufacture Succeeded: ', result.res.factoryRef);
    return response.status(200).send(result.res);
};

exports.add_manufacture = async function (request, response){
    logger.logInformation(loggerEvent.UpdateItem.value, 'Adding manufacture to Order By Reference: ', request.params.orderRef);
    let exists = await service.get_order(request);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Order Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if (exists.type === 'no order') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of order =>', 'There are no Order with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
    }
    let result = await service.add_manufactures(request, exists.res);
    if(result.boolean === false) {
        if(result.type === 'error'){
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Order Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        if(result.type === 'manufacture error'){
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Manufacture Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        if(result.type === 'no manufacture'){
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Manufacture Failed: Reference of manufacture =>', 'There are no Manufactures with the given reference');
            return response.status(404).send(Json.json_to_string(NO_MANUFACTURE, response));
        }
        if(result.type === 'no order'){
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Order Failed: Reference of order =>', 'There are no Order with the given reference');
            return response.status(404).send(Json.json_to_string(NO_ORDER, response));
        }
    }
    logger.logInformation(loggerEvent.UpdateOk.value, 'Updating manufacture of Order Succeeded: ', result.res.manufactureRef);
    return response.status(204).send();
};
