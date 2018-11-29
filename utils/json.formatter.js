class JsonFormatter {
    static json_to_string(error, response){
        response.setHeader('Content-Type', 'application/json');
        return JSON.stringify({'Mensagem de erro': error});
    }
}

module.exports = JsonFormatter;