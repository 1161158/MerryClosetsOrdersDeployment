const logisticUrl = "http://localhost:5002/";
const request = require('request');
const async = require('async');

class HttpClient {
    /*static async get(extraUrl, propertiesObject) {
        request.get({
            url: logisticUrl.concat(extraUrl),
            qs: propertiesObject}, async (error, res, body) => {
                                    if (error) {
                                    console.error(error)
                                        console.log("!!!!!!!!!!!!!!!!")
                                    return
                                    }
                                    console.log(`statusCode: ${res.statusCode}`)
                                    console.log(body)
                                    console.log("!!!!!!!!!!!!!!!!")
                                    return body
                                })
    }*/

    static async get(extraUrl, propertiesObject) {
        return new Promise(async function (resolve, reject) {
                var req = request.get({
                    url: logisticUrl.concat(extraUrl),
                    qs: propertiesObject
                }, async (error, res, body) => {
                    if (error) {
                        console.log("##########");
                        console.error(error);
                        return
                    }
                    console.log("!!!!!!!!!");
                    console.log(`statusCode:${res.statusCode}`)
                    ;
                    body = JSON.parse(body.replace("Content-type: application/json; charset=UTF-8", ""));
                    resolve(body);
                    console.log(body)
                }).on("error", reject);
                req.end();
            }
        );
    }

    static post(data, extraUrl) {
        console.log(data);
        request.post({
            headers: {'content-type': 'application/json'},
            url: logisticUrl.concat(extraUrl),
            json: true,
            body: JSON.parse(data)
        }, (error, res, body) => {
            if (error) {
                console.error(error)
                return
            }
            console.log(`statusCode: ${res.statusCode}`)
            console.log(body)
        })
    }

    static put(data, extraUrl, propertiesObject) {
        console.log(data);
        request.put({
            headers: {'content-type': 'application/json'},
            url: logisticUrl.concat(extraUrl),
            qs: propertiesObject,
            json: true,
            body: JSON.parse(data)
        }, (error, res, body) => {
            if (error) {
                console.error(error)
                return
            }
            console.log(`statusCode: ${res.statusCode}`)
            console.log(body)
        })
    }

    static delete(extraUrl, propertiesObject) {
        request.delete({
            url: logisticUrl.concat(extraUrl),
            qs: propertiesObject
        }, (error, res, body) => {
            if (error) {
                console.error(error)
                return
            }
            console.log(`statusCode: ${res.statusCode}`)
            console.log(body)
        })
    }
}

module.exports = HttpClient;