const {getConnection, oracledb} = require('../../database/oracleConnectors');

class InventariosDAO {

    /*Função para Buscar Inventários Abertos no Banco*/
    async buscarInventariosAbertos() {
        let conn;

        try {
            conn = await getConnection();

            const select = 'SELECT DISTINCT NUMINVENT FROM PCINVENTROT WHERE DTATUALIZACAO IS NULL AND NUMINVENT IS NOT NULL';
            const result = await conn.execute(select, [], {outFormat: oracledb.OUT_FORMAT_OBJECT});
            
            return result.rows; 
        } catch (err) {
            return {error: err.message}
        } finally {
            if (conn) {
                await conn.close();
            }
        }
    }   


    /*Função para Atualizar Estoque Gerencial dos Inventários no Banco*/
    async atualizarInventario(numinvent1, numinvent2, oneInvent = false){
        let conn;

        /*Busca Atualizações das Quantidades do Estoque*/
        try {
            conn = await getConnection();
            let result;

            const query = `
                    SELECT pcest.qtestger, pcinventrot.codprod, pcinventrot.numinvent
                    FROM pcest, pcinventrot
                    WHERE pcest.codfilial = 1
                    AND pcest.codprod = pcinventrot.codprod
                    AND pcest.QTESTGER <> pcinventrot.QTESTGER
                    --AND DTATUALIZACAO IS NULL 
                    AND pcinventrot.numinvent BETWEEN :ivent1 AND :invent2
                `;

            // Usa o mesmo número se for um único inventário
            const invent1 = numinvent1;
            const invent2 = oneInvent ? numinvent1 : numinvent2;
            
            result = await conn.execute(query, [invent1, invent2], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        

            console.log("\nQuantidades a serem Atualizadas:", result.rows);

            /*Update das Quantidades na PCINVENTROT*/
            for(const row of result.rows) {
                const updateQuery = `
                        UPDATE pcinventrot
                        SET qtestger = :qtestger, DATA = TRUNC(SYSDATE)
                        WHERE codprod = :codprod AND numinvent = :numinvent
                    `;

                let resultUpdate = await conn.execute(updateQuery,{
                        QTESTGER: row.QTESTGER,
                        CODPROD: row.CODPROD,
                        NUMINVENT: row.NUMINVENT
                });
                    
                console.log("Atualizado:", resultUpdate);
                await conn.commit();
            }
            
            return {
                message: "Updates successful",
                produtos_atualizados: result.rows.length
            };

        } catch (err) {
            return { error: err.message };
        } finally {
            if(conn) {
                await conn.close();
            }
        }
    }
}

module.exports = new InventariosDAO();