var Enum = require('enum');

var LoggingEvents = new Enum({
    //INFORMATIONS
    //General Info
    GenerateItem : 1000,
    GetItem : 1001,
    GetAllItems : 1002,
    PostItem : 1003,
    UpdateItem : 1004,
    SoftDeleteItem : 1005,
    HardDeleteItem : 1006,


    //Resposta HTTP OK
    GetItemOk : 2001,
    GetAllOk : 2002,
    PostOk : 2003,
    UpdateOk : 2004,
    SoftDeleteOk : 2005,
    HardDeleteOk : 2006,


    //HTTPRequest Created
    PostCreated : 2011,

    //HTTPRequest No Content
    GetItemNoContent : 2041,
    GetAllNoContent : 2042,
    PostNoContent : 2043,
    UpdateNoContent : 2044,
    DeleteNoContent : 2045,

    //WARNINGS
    //HTTPRequest Bad Request
    GetItemBadRequest : 4001,
    GetAllBadRequest : 4002,
    PostBadRequest : 4003,
    UpdateBadRequest : 4004,
    DeleteBadRequest : 4005,


    //Resposta HTTP NotFound
    GetItemNotFound : 4041,
    GetAllNotFound : 4042,
    PostNotFound : 4043,
    UpdateNotFound : 4044,
    DeleteNotFound : 4045,

    //ERRORS
    //Internal server error
    GetItemInternalError : 5001,
    GetAllInternalError : 5002,
    PostInternalError : 5003,
    UpdateInternalError : 5004,
    DeleteInternalError : 5005,


    //Exceptions
    NullPointer : 1,
    InvalidArgument : 2,
    SystemIO : 3,

});

module.exports = LoggingEvents;