const express = require('express');
const  router = express.Router();
const {getConnection, oracledb} = require('../database/oracleConnectors');
const {existOrError, valuesBoi, valuesSuinoAndPao} = require('./validations');
const {particionarBoi} = require('./partitionsBoi');
const {particionarSuino} = require('./partitionsSuino');
const {particionarPao} = require('./partitionsPao');


/*Buscar Inventário*/
router.get('/inventarios', async(req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const select = 'SELECT DISTINCT NUMINVENT FROM PCINVENTROT WHERE DATA > TRUNC(SYSDATE)-360';
        const result = await conn.execute(select, [], {outFormat: oracledb.OUT_FORMAT_OBJECT});

        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err.message})
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});


/*Atualizar Inventários*/
router.post('/inventarios', async (req, res) => {
    const {oneInvent, inventario1, inventario2} = req.body;

    /*Valida se é somente um inventário*/
    try {
        if(oneInvent){
            existOrError(inventario1, 'Digite o número do inventário');
        } else {
            existOrError(inventario1, 'Digite o número do inventário 1');
            existOrError(inventario2, 'Digite o número do inventário 2');
        }
    } catch (msg){
        return res.status(400).send(msg);
    }

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
                AND pcinventrot.numinvent BETWEEN :1 AND :2
            `;

        if(oneInvent){
            result = await conn.execute(query, [inventario1, inventario1], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        } else {
            result = await conn.execute(query, [inventario1, inventario2], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        }

        /*Update das Quantidades na PCINVENTROT*/
        for(const row of result.rows) {
            const updateQuery = `
                    UPDATE pcinventrot
                    SET qtestger = :qtestger, DATA = TRUNC(SYSDATE)
                    WHERE codprod = :codprod AND numinvent = :numinvent
                `;

            resultUpdate = await conn.execute(updateQuery,{
                    QTESTGER: row.QTESTGER,
                    CODPROD: row.CODPROD,
                    NUMINVENT: row.NUMINVENT
            });
                
                console.log(resultUpdate);
                await conn.commit();
        }
        
        res.status(200).json({ message: "Updates successful", produtos_atualizados: result.rows.length});
       
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    } finally {
        if(conn) {
            await conn.close();
        }
    }
});


/*Particionar Boi*/
router.post('/inventarios/particionarBoi', async (req, res) => {
    const {numinvent, traseiro, dianteiro, pontaAgulha} = req.body;

    /*Valida o Número do Inventário e as quantidades digitadas*/
    try {
        existOrError(numinvent, "Digite o número do Inventário!");
        valuesBoi(traseiro, dianteiro, pontaAgulha, "Digite as quantidades das partições!");
    } catch(msg) {
        console.log(msg);
        return res.status(400).json(msg);
    }
    
    let conn;

    /*Filtra as partições a ser atualizadas e atualiza as quantidades no inventário*/
    try {
        result = await particionarBoi(numinvent, traseiro, dianteiro, pontaAgulha);
        return res.status(200).json(result);
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    } finally {
        if(conn) {
            await conn.close();
        }
    }
});


/*Particionar Suino*/
router.post('/inventarios/particionarSuino', async (req, res) => {
    const {numinvent, congelado, resfriado} = req.body;

    /*Valida o Número do Inventário e as quantidades digitadas*/
    try {
        existOrError(numinvent, "Digite o número do inventário");
        valuesSuinoAndPao(congelado, resfriado, "Digite as quantidades das partições!");
    } catch(msg) {
        console.log(msg);
        return res.status(400).json(msg);
    }

    let conn;

    /*Filtra as partições a ser atualizadas e atualiza as quantidades no inventário*/
    try {
        result = await particionarSuino(inventario, resfriado, congelado);
        return res.status(200).json(result);
    } catch(err) {
        console.log(err);
        return res.status(500).json(result);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});


/*Particionar Pão*/
router.post('/inventarios/particionarPao' , async (req, res) => {
    const {numinvent, tradicional, artesanal} = req.body;

    try {
        existOrError(numinvent, "Digite o número do inventário!");
        valuesSuinoAndPao(tradicional, artesanal, "Digite os valores das partições!");
    } catch(msg) {
        console.log(msg);
        res.status(400).json(msg);
    }

    let conn;

    try {
        result = await particionarPao(numinvent, tradicional, artesanal);
        return res.status(200).json(result);
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    } finally {
        if(conn){
            await conn.close();
        }
    }
});


module.exports = router;