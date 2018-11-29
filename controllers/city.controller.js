const Json = require('../utils/json.formatter');
const logger = require('../utils/custom.logger');
const loggerEvent = require('../utils/logging.events');
const service = require('../services/city.service');

const NOT_VALID = 'JSON da Cidade não é válido.';
const NO_CITY = 'Cidade não existe.';
const CITY_EXISTS = 'Cidade já existe.';

exports.submit_city = async function (request, response) {
    logger.logInformation(loggerEvent.PostItem.value, 'Creating City By Json: ', '');
    let exists = await service.get_city_by_name(request);
    if(exists.boolean === false) {
        if (exists.type === 'no city') {
            let result = await service.create(request);
            if (result.boolean === false) {
                logger.logError(loggerEvent.PostBadRequest.value, 'Creating City Failed: JSON is not valid => ', err.message);
                return response.status(400).send(Json.json_to_string(NOT_VALID, response));
            }
            logger.logInformation(loggerEvent.PostItem.value, 'Creating City in Logistic: ', request.body.cityName);
            await service.create_logistic(result.res);
            logger.logInformation(loggerEvent.PostCreated.value, 'Creating City Succeeded: ', request.body.cityName);
            return response.status(201).json(result.res);
        }
    }
    if(exists.boolean === true){
        logger.logError(loggerEvent.PostBadRequest.value, 'City already exists with reference', request.body.cityName);
        return response.status(400).send(Json.json_to_string(CITY_EXISTS, response));
    }
};

exports.get_city = async function (request, response) {
    logger.logInformation(loggerEvent.GetItem.value, 'Getting City By Coordinates: ', request.params.latitude + request.params.longitude);
    let city = {'cityCoordinates.latitude': parseFloat(request.params.latitude), 'cityCoordinates.longitude': parseFloat(request.params.longitude)};
    let result = await service.get_city_by_coordinates(city);
    if(result.boolean === false) {
        if (result.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting City Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        if (result.type === 'no city') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting City Failed: Coordinates of city =>', 'There are no City with the given coordinates');
            return response.status(404).send(Json.json_to_string(NO_CITY, response));
        }
    }
    logger.logInformation(loggerEvent.GetItemOk.value, 'Getting City Succeeded: ', result.res);
    return response.status(200).send(result.res);
};

exports.all_cities = async function (request, response) {
    logger.logInformation(loggerEvent.GetAllItems.value, 'Getting All Cities: ', '');
    let result = await service.get_all();
    if (result.boolean === false) {
            logger.logError(loggerEvent.GetAllBadRequest.value, 'Getting All Cities Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
    }
    logger.logInformation(loggerEvent.GetAllOk.value, 'Getting All Cities Succeeded: ', result.res);
    return response.status(200).send(result.res);
};

exports.delete = async function (request, response) {
	let city = {'cityCoordinates.latitude': parseFloat(request.params.latitude), 'cityCoordinates.longitude': parseFloat(request.params.longitude)};
    logger.logInformation(loggerEvent.HardDeleteItem.value, 'Deleting City By Coordinates: ', city);
    let exists = await service.get_city_by_coordinates(city);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
            logger.logError(loggerEvent.GetItemBadRequest.value, 'Getting City Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if (exists.type === 'no city') {
            logger.logWarning(loggerEvent.GetItemNotFound.value, 'Getting City Failed: Name of city =>', 'There are no City with the given name');
            return response.status(404).send(Json.json_to_string(NO_CITY, response));
        }
    }
    if (exists.boolean === true) {
        logger.logInformation(loggerEvent.GetItemOk.value, 'Getting City Succeeded', exists.res.cityName);
        let result = await service.remove(city);
        if(result.boolean === false) {
            logger.logError(loggerEvent.DeleteBadRequest.value, 'Deleting City Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        await service.remove_logistic(result.res);
        logger.logInformation(loggerEvent.HardDeleteOk.value, 'Deleting City Succeeded: ', city);
        return response.status(204).send();
    }
};
