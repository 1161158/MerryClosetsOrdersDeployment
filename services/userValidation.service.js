const validationURL = 'https://merryclosetsusers.herokuapp.com/users/validate';
const userRefURL = 'https://merryclosetsusers.herokuapp.com/users/user-ref';
const userURL = 'https://merryclosetsusers.herokuapp.com/users/';
const http = require('http');
const axios = require('axios');

function validate_content_manager(tokenString){
    return new Promise(async function (resolve) {
        const valid = await validate(tokenString);
        if(valid.boolean === true) {
            if (is_content_manager(valid.roles)) {
                resolve({
                    boolean: true
                });
            }
            else {
                resolve({
                    boolean: false,
                    error: 'not manager'
                });
            }
        }
        resolve({
            boolean: false,
            error: valid.error
        });
    })
}

function validate_logistics_manager(tokenString){
    return new Promise(async function (resolve) {
        const valid = await validate(tokenString);
        if(valid.boolean === true) {
            if (is_logistics_manager(valid.roles)) {
                resolve({
                    boolean: true
                });
            }
            else {
                resolve({
                    boolean: false,
                    error: 'not manager'
                });
            }
        }
        resolve({
            boolean: false,
            error: valid.error
        });
    })
}

function validate(tokenString) {
    return new Promise(async function(resolve){
        axios.post(validationURL, {token: tokenString})
            .then((res) => {
                resolve({
                    boolean: true,
                    roles: res.data.roles
                });
            })
            .catch(() =>{
                resolve({
                    boolean: false,
                    error: 'not valid'
                })
            })
    })
}

function get_user_ref_by_token(tokenString) {
    return new Promise(async function (resolve) {
        axios.post(userRefURL, {token: tokenString})
            .then((res) => {
                resolve({
                    boolean: true,
                    userRef: res.data.userRef
                });
            })
            .catch(() =>{
                resolve({
                    boolean: false,
                    error: 'not exists'
                })
            })
    })
}

function get_user_by_ref(userRef) {
    return new Promise(async function (resolve) {
        axios.post(userURL + userRef)
            .then(() => {
                resolve(true);
            })
            .catch(() =>{
                resolve(false)
            })
    })
}

function check_authorization_token(authorization){
   try{
       authorization.split(' ')[1];
       return true;
   }catch (error) {
       return false;
   }
}

function is_logistics_manager(roles){
    return new Promise(async function (resolve) {
        for (let i = 0; i < roles.length; i++) {
            if(roles[i] === 'Logistics Manager'){
                resolve(true);
            }
        }
        resolve(false);
    })
}

function is_content_manager(roles){
    return new Promise(async function (resolve) {
        for (let i = 0; i < roles.length; i++) {
            if(roles[i] === 'Content Manager'){
                resolve(true);
            }
        }
        resolve(false);
    })
}

exports.validate = validate;
exports.validate_content_manager = validate_content_manager;
exports.validate_logistics_manager = validate_logistics_manager;
exports.check_authorization_token = check_authorization_token;
exports.get_user_ref_by_token = get_user_ref_by_token;
exports.get_user_by_ref = get_user_by_ref;