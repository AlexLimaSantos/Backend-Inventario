const {getConnection, oracledb} = require('../database/oracleConnectors')

const corteTraseiro = 14258;
const corteDianteiro = 14259;
const cortePontaAgulha = 14264

/*Realiza as partições do Boi*/
async function particionarBoi(inventario, corte, qt) {
    if (corte = corteTraseiro){
        particionarTraseiro(inventario, qt);
    } else if (corte = corteDianteiro) {
        particionarDianteiro(inventario, qt);
    } else if (corte = cortePontaAgulha) {
        particionarPontaAgulha(inventario, qt);
    } else {
        return "Corte não encontrado!"
    }
}


/*Partição do Traseiro*/
async function particionarTraseiro(inventario, qt) {

    try {
        conn = await getConnection();

        /*Buscando produtos da partições e calculando o valor de cada partição*/
        const sql = `
            SELECT C.CODPRODMP as CODPROD, (:qt * C.PERCPRODACABADO)/100 as QT                                                      
                FROM PCFORMPROD C      
                WHERE 
                    C.CODPRODMP <> 0                                                        
                    AND C.CODPRODACAB IN (SELECT CODPROD FROM PCPRODUT WHERE TIPOMERC = 'BC')                             
                    AND C.CODPRODACAB <> 0                                                      
                    AND C.CODPRODACAB = :prodTraseiro
                    ORDER BY C.CODPRODMP
        `;

        result = await conn.execute(sql, [qt, corteTraseiro], {outFormat: oracledb.OUT_FORMAT_OBJECT});

        /*Aplicando valores das partições no inventário*/
        for(const row of result.rows) {
            const updateQuery = `
                   UPDATE PCINVENTROT SET QT1 = QT1 + :QT WHERE CODPROD = :CODPROD AND NUMINVENT = :NUMINVENT
                `;

            resultUpdate = await conn.execute(updateQuery,{
                QT: row.QT,
                CODPROD: row.CODPROD,
                NUMINVENT: inventario
            });

            await conn.commit();
        }

        console.log("Valores incluidos:", result);
        return "Traseiro Particionado";

    } catch(err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}


/*Partição do Dianteiro*/
async function particionarDianteiro(inventario, qt) {

    try {
        conn = await getConnection();
        
        /*Buscando produtos da partições e calculando o valor de cada partição*/    
        const sql = `
            SELECT C.CODPRODMP, (:qt * C.PERCPRODACABADO)/100 as QT                                                      
                FROM PCFORMPROD C      
                WHERE 
                    C.CODPRODMP <> 0                                                        
                    AND C.CODPRODACAB IN (SELECT CODPROD FROM PCPRODUT WHERE TIPOMERC = 'BC')                             
                    AND C.CODPRODACAB <> 0                                                      
                    AND C.CODPRODACAB = :prodDianteiro
                    ORDER BY C.CODPRODMP
        `;

        result = await conn.execute(sql, [qt, corteDianteiro], {outFormat: oracledb.OUT_FORMAT_OBJECT});

        /*Aplicando valores das partições no inventário*/
        for(const row of result.rows) {
            const updateQuery = `
                   UPDATE PCINVENTROT SET QT1 = QT1 + :QT WHERE CODPROD = :CODPROD AND NUMINVENT = :NUMINVENT
                `;

            resultUpdate = await conn.execute(updateQuery,{
                QT: row.QT,
                CODPROD: row.CODPROD,
                NUMINVENT: inventario
            });

            await conn.commit();
        }

        console.log("Valores incluidos:", result);
        return "Dianteiro Particionado";
    } catch(err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}


/*Partição da Ponta de Agulha*/
async function particionarPontaAgulha(inventario, qt) {
    
    try {
        conn = await getConnection();

        /*Buscando produtos da partições e calculando o valor de cada partição*/
        const sql = `
            SELECT C.CODPRODMP, (:qt * C.PERCPRODACABADO)/100 as QT                                                      
                FROM PCFORMPROD C      
                WHERE 
                    C.CODPRODMP <> 0                                                        
                    AND C.CODPRODACAB IN (SELECT CODPROD FROM PCPRODUT WHERE TIPOMERC = 'BC')                             
                    AND C.CODPRODACAB <> 0                                                      
                    AND C.CODPRODACAB = :prodPontaAgulha
                    ORDER BY C.CODPRODMP
        `;

        result = await conn.execute(sql, [qt, cortePontaAgulha], {outFormat: oracledb.OUT_FORMAT_OBJECT});

        /*Aplicando valores das partições no inventário*/
        for(const row of result.rows) {
            const updateQuery = `
                   UPDATE PCINVENTROT SET QT1 = QT1 + :QT WHERE CODPROD = :CODPROD AND NUMINVENT = :NUMINVENT
                `;

            resultUpdate = await conn.execute(updateQuery,{
                QT: row.QT,
                CODPROD: row.CODPROD,
                NUMINVENT: inventario
            });

            await conn.commit();
        }

        console.log("Valores incluidos:", result);
        return "Ponta de Agulha Particionado";
    } catch(err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}


module.exports = {particionarBoi};