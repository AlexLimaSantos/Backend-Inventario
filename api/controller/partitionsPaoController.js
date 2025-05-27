const {getConnection, oracledb} = require('../../database/oracleConnectors')

const tipoTradicional = 2823;
const tipoArtesanal = 62288;

/*Realiza as partições do Boi*/
async function particionarPao(inventario, tipo, qt) {
    if (tipo = tipoTradicional) {
        produzirTradicional(inventario, qt);
    } else if (tipo = tipoArtesanal) {
        produzirArtesanal(inventario, qt);
    } else {
        return "Tipo de produção não encontrada!";
    }
}


/*Partição do Suino Congelado*/
async function produzirTradicional(inventario, qt) {

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

        result = await conn.execute(sql, [qt, prodTradicional], {outFormat: oracledb.OUT_FORMAT_OBJECT});

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
        return "Pão Tradicional Particionado";

    } catch(err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}


/*Partição do Suino Resfriado*/
async function produzirArtesanal(inventario, qt) {

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

        result = await conn.execute(sql, [qt, prodArtesanal], {outFormat: oracledb.OUT_FORMAT_OBJECT});

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

            console.log("Valores incluidos:", result);
            await conn.commit();
        }

        return "Pão Artesanal Particionado";
    } catch(err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}

module.exports = {particionarPao};