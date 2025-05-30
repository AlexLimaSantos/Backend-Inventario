const fs = require('fs');


/*Valida as entradas*/
function existOrError(value, msg){
    if(!value) throw msg;
    if(Array.isArray(value) && value.length === 0) throw msg;
    if(typeof value === 'string' && !value.trim()) throw msg;
};

function extensionError(value){
    if(value.originalname.split('.')[1] === 'xlsx') {
        return false;
    } else if(value.originalname.split('.')[1] === 'xls') {
        return false;
    } else {
        return true;
    }
};

module.exports = {existOrError, extensionError};