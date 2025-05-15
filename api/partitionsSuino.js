const {getConnection, oracledb} = require('../database/oracleConnectors')

/*Realiza as partições do Boi*/
async function particionarSuino(inventario, resfriado, congelado) {
    if(resfriado > 0 && congelado){
        return message = await particionarCongelado(inventario, congelado) + " e " + await particionarResfriado(inventario, resfriado);

    } else if(resfriado > 0){
        return message = await particionarResfriado(inventario, resfriado);

    } else if (congelado > 0){
        return message = await particionarCongelado(inventario, congelado);

    } 
}


/*Partição do Suino Congelado*/
async function particionarCongelado(inventario, qt) {
    const prodCongelado = 63595;

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

        result = await conn.execute(sql, [qt, prodCongelado], {outFormat: oracledb.OUT_FORMAT_OBJECT});

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

        return "Suino Congelado Particionado";

    } catch(err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}


/*Partição do Suino Resfriado*/
async function particionarResfriado(inventario, qt) {
    const prodResfriado = 58365;

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

        result = await conn.execute(sql, [qt, prodResfriado], {outFormat: oracledb.OUT_FORMAT_OBJECT});

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

        return "Suino Resfriado Particionado";
    } catch(err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}

module.exports = {particionarSuino};