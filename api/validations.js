/*Valida as entradas*/
function existOrError(value, msg){
    if(!value) throw msg;
    if(Array.isArray(value) && value.length === 0) throw msg;
    if(typeof value === 'string' && !value.trim()) throw msg;
};

/*Verifica os três valores das partições do Boi*/
function valuesBoi(value1, value2, value3, msg){
    if(!value1 && !value2 && !value3) throw msg;
    if(Array.isArray(value1) && value1.length === 0 && Array.isArray(value2) && value2.length === 0 && Array.isArray(value3) && value3.length === 0) throw msg;
    if(typeof value1 === 'int' && !value1.trim() && value2 === 'int' && !value2.trim() && value3 === 'int' && !value3.trim()) throw msg;
};

/*Verifica os dois valores das partições do Suino e dos Pães*/
function valuesSuinoAndPao(value1, value2, msg) {
    if(!value1 && !value2) throw msg;
    if(Array.isArray(value1) && value1.length === 0 && Array.isArray(value2) && value2.length === 0) throw msg;
    if(typeof value1 === 'int' && !value1.trim() && value2 === 'int' && !value2.trim()) throw msg;
};

module.exports = {existOrError, valuesBoi, valuesSuinoAndPao};