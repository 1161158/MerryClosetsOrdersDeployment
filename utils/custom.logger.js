const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');
const util = require('util');

const fileDirectory = 'LoggerFiles';
const fileName = 'log.txt';

// Create the log directory if it does not exist
if (!fs.existsSync(fileDirectory)) {
    fs.mkdirSync(fileDirectory);
}


const filePath = path.join(fileDirectory, fileName);

var logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'DD-MMMM-YYYY HH:mm:ss.SSS'
        }),
        format.printf(info => `[${info.timestamp} ${info.level.toUpperCase()}]: ${info.message}`)
    ),
    transports: [
        new transports.File({ 
            filename: filePath,
        })
    ]
});

function logInformation(logId, message, args){
    logMessageFormated = util.format(message, args);
    info = util.format('     EVENTID: %d     MESSAGE: %s', logId, logMessageFormated);
    logger.info(info);
}

function logWarning(logId, message, args){
    logMessageFormated = util.format(message, args);
    info = util.format('     EVENTID: %d     MESSAGE: %s', logId, logMessageFormated);
    logger.warn(info);
}

function logError(logId, message, args){
    logMessageFormated = util.format(message, args);
    info = util.format('     EVENTID: %d     MESSAGE: %s', logId, logMessageFormated);
    logger.error(info);
}

module.exports.logInformation = logInformation;
module.exports.logWarning = logWarning;
module.exports.logError = logError;