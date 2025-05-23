/*Valida as entradas*/
function existOrError(value, msg){
    if(!value) throw msg;
    if(Array.isArray(value) && value.length === 0) throw msg;
    if(typeof value === 'string' && !value.trim()) throw msg;
};

module.exports = {existOrError};