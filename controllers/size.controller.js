const Json = require('../utils/json.formatter');
const logger = require('../utils/custom.logger');
const loggerEvent = require('../utils/logging.events');
const service = require('../services/size.service');
const validateService = require('../services/userValidation.service');

const NOT_VALID = 'JSON do Tamanho não é válido.';
const NO_SIZE = 'Tamanho não existe.';
const SIZE_EXISTS = 'Tamanho já existe.';
const UPDATE_REF = 'Não é possível atualizar referência.';

exports.submit_size = async function (request, response) {
    if(!validateService.check_authorization_token(request.get('Authorization'))){
        return response.status(401).send();
    }
    let validate = await validateService.validate_content_manager(request.get('Authorization').split(" ")[1]);
    if(!(validate.boolean)){
        return response.status(401).send();
    }

    var user = await validateService.get_user_ref_by_token(request.get('Authorization').split(" ")[1]);
    var userRef = user.userRef;

    logger.logInformation(userRef, loggerEvent.PostItem.value, 'Creating Size By Json: ', '');
    let exists = await service.get_size(request);
    if(exists.boolean === false) {
        if (exists.type === 'no size') {
            let result = await service.create(request);
            if (result.boolean === false) {
                if(result.type === 'error'){
                    logger.logError(userRef, loggerEvent.PostBadRequest.value, 'Creating Size Failed: JSON is not valid => ', result.res.message);
                    return response.status(400).send(Json.json_to_string(NOT_VALID, response));
                }
                if(result.type === 'weight invalid'){
                    logger.logError(userRef, loggerEvent.PostBadRequest.value, 'Creating Size Failed: JSON is not valid => ', 'Minimum weight ' +
                        'is bigger than maximum.');
                    return response.status(400).send(Json.json_to_string(NOT_VALID, response));
                }
            }
            logger.logInformation(userRef, loggerEvent.PostCreated.value, 'Creating Size Succeeded: ', request.body.sizeRef);

            //envia packageSize para Logistic
            logger.logInformation(userRef, loggerEvent.PostItem.value, 'Creating PackageSize in Logistic: ', request.body.sizeRef);
            await service.create_logistic(result.res);
            logger.logInformation(userRef, loggerEvent.PostCreated.value, 'Creating PackageSize Succeeded: ', request.body.sizeRef);
            return response.status(201).json(result.res);
        }
    }
    if(exists.boolean === true){
        logger.logError(userRef, loggerEvent.PostBadRequest.value, 'Size already exists with reference', request.body.sizeRef);
        return response.status(400).send(Json.json_to_string(SIZE_EXISTS, response));
    }
};

exports.get_size = async function (request, response) {
    if(!validateService.check_authorization_token(request.get('Authorization'))){
        return response.status(401).send();
    }
    let validate = await validateService.validate_content_manager(request.get('Authorization').split(" ")[1]);
    if(!(validate.boolean)){
        return response.status(401).send();
    }

    var user = await validateService.get_user_ref_by_token(request.get('Authorization').split(" ")[1]);
    var userRef = user.userRef;

    logger.logInformation(userRef, loggerEvent.GetItem.value, 'Getting Size By Reference: ', request.params.sizeRef);
    let result = await service.get_size(request);
    if(result.boolean === false){
        if (result.type === 'error') {
            logger.logError(userRef, loggerEvent.GetItemBadRequest.value, 'Getting Size Failed: ', result.res.message);
            return response.status(400).send(Json.json_to_string(result.res, response));
        }
        if(result.type === 'no size'){
            logger.logWarning(userRef, loggerEvent.GetItemNotFound.value, 'Getting Size Failed: Reference of size =>', 'There are no Sizes with the given reference');
            return response.status(404).send(Json.json_to_string(NO_SIZE, response));
        }
    }
    logger.logInformation(userRef, loggerEvent.GetItemOk.value, 'Getting Size Succeeded: ', result.res.sizeRef);
    return response.status(200).send(result.res);
};

exports.all_sizes = async function (request, response) {
    if(!validateService.check_authorization_token(request.get('Authorization'))){
        return response.status(401).send();
    }
    let validate = await validateService.validate_content_manager(request.get('Authorization').split(" ")[1]);
    if(!(validate.boolean)){
        return response.status(401).send();
    }

    var user = await validateService.get_user_ref_by_token(request.get('Authorization').split(" ")[1]);
    var userRef = user.userRef;

    logger.logInformation(userRef, loggerEvent.GetAllItems.value, 'Getting All Sizes', '');
    let result = await service.get_all();
    if (result.boolean === false) {
        logger.logError(userRef, loggerEvent.GetAllBadRequest.value, 'Getting All Sizes Failed: ', result.res.message);
        return response.status(400).send(Json.json_to_string(result.res, response));
    }
    logger.logInformation(userRef, loggerEvent.GetAllOk.value, 'Getting All Sizes Succeeded: ', result.res);
    return response.status(200).send(result.res);
};

exports.update = async function (request, response) {
    if(!validateService.check_authorization_token(request.get('Authorization'))){
        return response.status(401).send();
    }
    let validate = await validateService.validate_content_manager(request.get('Authorization').split(" ")[1]);
    if(!(validate.boolean)){
        return response.status(401).send();
    }

    var user = await validateService.get_user_ref_by_token(request.get('Authorization').split(" ")[1]);
    var userRef = user.userRef;

    logger.logInformation(userRef, loggerEvent.UpdateItem.value, 'Updating Size', request.params.sizeRef);
    let exists = await service.get_size(request);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
            logger.logError(userRef, loggerEvent.GetItemBadRequest.value, 'Getting Size Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if (exists.type === 'no size') {
            logger.logWarning(userRef, loggerEvent.GetItemNotFound.value, 'Getting Size Failed: Reference of size =>', 'There are no Size with the given reference');
            return response.status(404).send(Json.json_to_string(NO_SIZE, response));
        }
    }
    if (exists.boolean === true) {
        let result = await service.update(request);
        if (result.boolean === false) {
            if (result.type === 'error') {
                logger.logError(userRef, loggerEvent.GetItemBadRequest.value, 'Updating Size Failed: ', result.res.message);
                return response.status(400).send(Json.json_to_string(result.res, response));
            }
            if (result.type === 'ref') {
                logger.logError(userRef, loggerEvent.GetItemBadRequest.value, 'Updating Size Failed: ', UPDATE_REF);
                return response.status(403).send(Json.json_to_string(UPDATE_REF, response));
            }
        }
        logger.logInformation(userRef, loggerEvent.GetItemOk.value, 'Getting Size Succeeded: ', request.params.sizeRef);
        await service.update_logistic(result.res);
        logger.logInformation(userRef, loggerEvent.UpdateOk.value, 'Updating Size in Logistics Succeeded: ', request.params.sizeRef);

        logger.logInformation(userRef, loggerEvent.UpdateOk.value, 'Updating Size Succeeded: ', result.res.sizeRef);
        return response.status(204).send();
    }
};

exports.delete = async function (request, response) {
    if(!validateService.check_authorization_token(request.get('Authorization'))){
        return response.status(401).send();
    }
    let validate = await validateService.validate_content_manager(request.get('Authorization').split(" ")[1]);
    if(!(validate.boolean)){
        return response.status(401).send();
    }

    var user = await validateService.get_user_ref_by_token(request.get('Authorization').split(" ")[1]);
    var userRef = user.userRef;

    logger.logInformation(userRef, loggerEvent.HardDeleteItem.value, 'Deleting Size By Reference: ', request.params.sizeRef);
    let exists = await service.get_size(request);
    if (exists.boolean === false) {
        if (exists.type === 'error') {
            logger.logError(userRef, loggerEvent.GetItemBadRequest.value, 'Getting Size Failed: ', exists.res.message);
            return response.status(400).send(Json.json_to_string(exists.res, response));
        }
        if (exists.type === 'no size') {
            logger.logWarning(userRef, loggerEvent.GetItemNotFound.value, 'Getting Size Failed: Reference of size =>', 'There are no Size with the given reference');
            return response.status(404).send(Json.json_to_string(NO_SIZE, response));
        }
    }
    if (exists.boolean === true) {
        let result = await service.remove(request);
        if (result.boolean === false) {
            if (result.type === 'error') {
                logger.logError(userRef, loggerEvent.DeleteBadRequest.value, 'Deleting Size Failed: ', result.res.message);
                return response.status(400).send(Json.json_to_string(result.res, response));
            }
        }
        await service.remove_logistic(result.res);
        logger.logInformation(userRef, loggerEvent.HardDeleteOk.value, 'Deleting Size Succeeded: ', result.res.sizeRef);
        return response.status(204).send();
    }
};
