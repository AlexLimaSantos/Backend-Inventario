const {getConnection, oracledb} = require('../database/oracleConnectors')

/*Realiza as partições do Boi*/
async function particionarBoi(inventario, traseiro, dianteiro, pontaAgulha) {
    if(traseiro > 0 && dianteiro > 0 && pontaAgulha > 0){
        return message = await particionarTraseiro(inventario, traseiro) + ", " + await particionarDianteiro(inventario, dianteiro) + " e " +  await particionarPontaAgulha(inventario, pontaAgulha);

    } else if(traseiro > 0 && dianteiro > 0){
        return message = await particionarTraseiro(inventario, traseiro) + " e " + await particionarDianteiro(inventario, dianteiro); 

    } else if (traseiro > 0 && pontaAgulha > 0){
        return message = await particionarTraseiro(inventario, traseiro) + " e " + await particionarPontaAgulha(inventario, pontaAgulha);

    } else if (dianteiro > 0 && pontaAgulha > 0){
        return message = await particionarDianteiro(inventario, dianteiro)  + " e " + await particionarPontaAgulha(inventario, pontaAgulha);

    } else if (traseiro > 0){
       return message = await particionarTraseiro(inventario, traseiro);
            
    } else if (dianteiro > 0){
        return message  = await particionarDianteiro(inventario, dianteiro);

    } else if (pontaAgulha > 0){
        return message = await particionarPontaAgulha(inventario, pontaAgulha);
    }
}


/*Partição do Traseiro*/
async function particionarTraseiro(inventario, qt) {
    const prodTraseiro = 14258;

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

        result = await conn.execute(sql, [qt, prodTraseiro], {outFormat: oracledb.OUT_FORMAT_OBJECT});

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
    const prodDianteiro = 14259;

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

        result = await conn.execute(sql, [qt, prodDianteiro], {outFormat: oracledb.OUT_FORMAT_OBJECT});

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

        return "Dianteiro Particionado";
    } catch(err) {
        console.log(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}


/*Partição da POnta de Agulha*/
async function particionarPontaAgulha(inventario, qt) {
    const prodPontaAgulha = 14264;
    
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

        result = await conn.execute(sql, [qt, prodPontaAgulha], {outFormat: oracledb.OUT_FORMAT_OBJECT});

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