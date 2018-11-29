var Enum = require('enum');
const mongoose = require('mongoose');

var StateEnum = new Enum({
    VALIDATING: 'Em Validação',
    VALIDATED: 'Validada',
    PRODUCING: 'Em Produção',
    PRODUCED: 'Produzida',
    READY_TO_SHIP: 'Pronta a Expedir',
    SHIPPED: 'Expedida',
    DELIVERED: 'Entregue',
});

function validate_state_to_update(state) {
    return new Promise(async function (resolve) {
        switch (state) {
            case StateEnum.VALIDATING.value:
                resolve(true);
                break;
            case StateEnum.VALIDATED.value:
                resolve(true);
                break;
            case StateEnum.PRODUCING.value:
                resolve(true);
                break;
            case StateEnum.PRODUCED.value:
                resolve(true);
                break;
            case StateEnum.READY_TO_SHIP.value:
                resolve(true);
                break;
            case StateEnum.SHIPPED.value:
                resolve(true);
                break;
            case StateEnum.DELIVERED.value:
                resolve(true);
                break;
            default:
                resolve(false);
        }
    })
}

function is_produced(state) {
    return StateEnum.PRODUCED.value === state;
}

function is_ready_to_ship(state) {
    return StateEnum.READY_TO_SHIP.value === state;
}

module.exports = StateEnum;
module.exports.validate_state_to_update = validate_state_to_update;
module.exports.is_produced = is_produced;
module.exports.is_ready_to_ship = is_ready_to_ship;
