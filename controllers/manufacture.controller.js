const Json = require('../utils/json.formatter');
const logger = require('../utils/custom.logger');
const loggerEvent = require('../utils/logging.events');
const service = require('../services/manufacture.service');

const NO_MANUFACTURE = 'Fábrica não existe.';
const NOT_VALID = 'JSON da Fábrica não é válido.';
const NO_CITY = 'Cidade não existe.';
const MANUFACTURE_EXISTS = 'Fábrica já existe.';
const UPDATE_REF = 'Não é possível atualizar referência.';

exports.submit_manufacture = async function (request, response) {
    logger.logInformation(loggerEvent.PostItem.value, 'Creating By Json: ', request.body.factoryRef);
    let exists = await service.get_manufacture(request);
    if(exists.boolean === false) {
        if (exists.type === 'no manufacture') {
            let result = await service.create(request);
            if (result.boolean === false) {
                if(result.type === 'no city'){
                    logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting City Failed: Name of city =>', 'There are no City with the given name');
                    return response.status(404).send(Json.json_to_string(NO_CITY, response));
                }
                logger.logError(loggerEvent.PostBadRequest.value, 'Creating manufacture Failed: JSON is not valid => ', result.res.message);
                return response.status(400).send(Json.json_to_string(NOT_VALID, response));
            }
            await service.create_logistic(result.res);
            logger.logInformation(loggerEvent.PostCreated.value, 'Creating manufacture Succeeded: ', request.body.factoryRef);
            return response.status(201).json(result.res);
        }
    }
    if(exists.boolean === true){
        logger.logError(loggerEvent.PostBadRequest.value, 'Manufacture already exists with reference', request.body.factoryRef);
        return response.status(400).send(Json.json_to_string(MANUFACTURE_EXISTS, response));
    }
};

exports.all_manufactures = async function (request, response) {
    logger.logInformation(loggerEvent.GetAllItems.value, 'Getting All Manufactures: ', '');
    let result = await service.get_all();
    if (result.boolean === false) {
        logger.logError(loggerEvent.GetAllBadRequest.value, 'Getting All Manufactures Failed: ', result.res.message);
        return response.status(400).send(Json.json_to_string(result.res, response));
    }
    logger.logInformation(loggerEvent.GetAllOk.value, 'Getting All Manufactures Succeeded: ', result.res);
    return response.status(200).send(result.res);
};

exports.get_manufacture = async function (request, response) {
    logger.logInformation(loggerEvent.GetItem.value, 'Getting manufacture By Reference: ', request.params.factoryRef);
    let result = await service.get_manufacture(request);
    if(result.boolean === false) {
        if (result.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting manufacture Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        if (result.type === 'no manufacture') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting manufacture Failed: Reference of manufacture =>', 'There are no Manufactures with the given reference');
            return response.status(404).send(Json.json_to_string(NO_MANUFACTURE, response));
        }
    }
    logger.logInformation(loggerEvent.GetItemOk.value, 'Getting manufacture Succeeded: ', result.res.factoryRef);
    return response.status(200).send(result.res);
};

exports.update = async function (request, response) {
    logger.logInformation(loggerEvent.UpdateItem.value, 'Updating manufacture', request.params.factoryRef);
    let exists = await service.get_manufacture(request);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Manufacture Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if (exists.type === 'no manufacture') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Manufacture Failed: Reference of manufacture =>', 'There are no Manufacture with the given reference');
            return response.status(404).send(Json.json_to_string(NO_MANUFACTURE, response));
        }
    }
    if (exists.boolean === true) {
        let result = await service.update(request);
        if (result.boolean === false) {
            if (result.type === 'error') {
                logger.logError(loggerEvent.GetItemBadRequest.value, 'Updating Manufacture Failed: ', result.res.message);
                return response.status(400).send(Json.json_to_string(result.res, response));
            }
            if (result.type === 'ref') {
                logger.logError(loggerEvent.GetItemBadRequest.value, 'Updating Manufacture Failed: ', UPDATE_REF);
                return response.status(400).send(Json.json_to_string(UPDATE_REF, response));
            }
            if (result.type === 'no city'){
                logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting City Failed: Coordinates of city =>', 'There are no City with the given coordinates');
                return response.status(404).send(Json.json_to_string(NO_CITY, response));
            }
        }
        logger.logInformation(loggerEvent.GetItemOk.value, 'Getting manufacture Succeeded: ', result.res.factoryRef);
        await service.update_logistic(result.res);
        logger.logInformation(loggerEvent.UpdateOk.value, 'Updating manufacture Succeeded: ', result.res);
        return response.status(204).send();
    }
};

exports.delete = async function (request, response) {
    logger.logInformation(loggerEvent.HardDeleteItem.value, 'Deleting manufacture By Reference: ', request.params.factoryRef);
    let exists = await service.get_manufacture(request);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting Manufacture Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if (exists.type === 'no manufacture') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting Manufacture Failed: Reference of Manufacture =>', 'There are no Manufacture with the given reference');
            return response.status(404).send(Json.json_to_string(NO_MANUFACTURE, response));
        }
    }
    if (exists.boolean === true) {
        logger.logInformation(loggerEvent.GetItemOk.value, 'Getting Manufacture Succeeded', exists.res.factoryRef);
        let result = await service.remove(request);
        if (result.boolean === false) {
            logger.logError(loggerEvent.DeleteBadRequest.value, 'Deleting Manufacture Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        await service.remove_logistic(result.res);
        logger.logInformation(loggerEvent.HardDeleteOk.value, 'Deleting Manufacture Succeeded: ', result.res);
        return response.status(204).send();
    }
};
