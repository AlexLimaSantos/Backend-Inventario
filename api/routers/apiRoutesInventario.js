const express = require('express');
const  router = express.Router();
const {getConnection, oracledb} = require('../../database/oracleConnectors');
const {existOrError, extensionError} = require('../validations');
const {particionarBoi} = require('../controller/partitionsBoiController');
const {particionarSuino} = require('../controller/partitionsSuinoController');
const {particionarPao} = require('../controller/partitionsPaoController');
const {upload, processSheet} = require('../controller/sheetController');
const fs = require('fs');


/*Buscar Inventários Abertos*/
router.get('/inventarios', async(req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const select = 'SELECT DISTINCT NUMINVENT FROM PCINVENTROT WHERE DTATUALIZACAO IS NULL AND NUMINVENT IS NOT NULL';
        const result = await conn.execute(select, [], {outFormat: oracledb.OUT_FORMAT_OBJECT});

        res.status(200).json(result.rows);
        console.log("Inventários Abertos: ", result.rows);
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
router.post('/inventarios/atualizar', async (req, res) => {
    const {oneInvent, inventario1, inventario2} = req.body;
    console.log(req.body);

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
                --AND DTATUALIZACAO IS NULL 
                AND pcinventrot.numinvent BETWEEN :ivent1 AND :invent2
            `;

        if(oneInvent){
            result = await conn.execute(query, [inventario1, inventario1], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        } else {
            result = await conn.execute(query, [inventario1, inventario2], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        }

        console.log("\nQuantidades a serem Atualizadas:", result.rows);

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
        console.log("Produtos Atualizados:" ,result.rows.length);
       
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
router.post('/inventarios/particionar-boi', async (req, res) => {
    const {numinvent, corte, qtd} = req.body;
    console.log(req.body);

    /*Valida o Número do Inventário e as quantidades digitadas*/
    try {
        existOrError(numinvent, "Digite o número do inventário!");
        existOrError(corte, "Informe o corte a ser realizado!");
        existOrError(qtd, "Digite a quantidade da partição!");
    } catch(msg) {
        console.log(msg);
        return res.status(400).json(msg);
    }

    return res.status(200).json(req.body);

    /*Filtra as partições a ser atualizadas e atualiza as quantidades no inventário*/
    /* try {
        result = await particionarBoi(numinvent, corte, qtd);
        console.log(result);
        return res.status(200).json(result);
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    } */
});


/*Particionar Suino*/
router.post('/inventarios/particionar-suino', async (req, res) => {
    const {numinvent, corte, qtd} = req.body;
    console.log(req.body);

    /*Valida o Número do Inventário e as quantidades digitadas*/
    try {
        existOrError(numinvent, "Digite o número do inventário");
        existOrError(corte, "Informe o corte a ser realizado!");
        existOrError(qtd, "Digite a quantidade da partição!");
    } catch(msg) {
        console.log(msg);
        return res.status(400).json(msg);
    }

    /*Filtra as partições a ser atualizadas e atualiza as quantidades no inventário*/
    try {
        result = await particionarSuino(numinvent, corte, qtd);
        return res.status(200).json(result);
        console.log(result);
    } catch(err) {
        console.log(err);
        return res.status(500).json(result);
    }
});


/*Particionar Pão*/
router.post('/inventarios/produzir-pao' , async (req, res) => {
    const {numinvent, tipo, qtd} = req.body;
    console.log(req.body);

    try {
        existOrError(numinvent, "Digite o número do inventário!");
        existOrError(tipo, "Informe o tipo do pão!");
        existOrError(qtd, "Digite a quantidade da produção!");
    } catch(msg) {
        console.log(msg);
        res.status(400).json(msg);
    }

    try {
        result = await particionarPao(numinvent, tipo, qtd);
        return res.status(200).json(result);
        console.log(result);
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    } 
});


/*Planilha Kaizen*/
router.post('/inventarios/planilha', upload.single('file'), async (req, res) => {

    if (!req.file) {
        console.log('Arquivo não enviado.');
        return res.status(400).json('Arquivo não enviado.');
    } else if(extensionError(req.file)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json('Extensão do arquivo inválida, envie em XLSX ou XLS.');
    }

    try {
        const file = req.file.path;
        result = await processSheet(file);
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    } 
});


module.exports = router;