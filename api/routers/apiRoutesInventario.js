const {getConnection, oracledb} = require('../../database/oracleConnectors');
const express = require('express');
const router = express.Router();
const {existOrError, extensionError} = require('../validations');
const {upload, processSheet} = require('../controller/sheetController');
const inventariosController = require('../controller/inventariosController');
const {particionarBoi} = require('../controller/partitionsBoiController');
const {particionarSuino} = require('../controller/partitionsSuinoController');
const {particionarPao} = require('../controller/partitionsPaoController');

const fs = require('fs');


/*Buscar Inventários Abertos*/
router.get('/inventarios', async(req, res) => {
    try {
        const result = inventariosController.buscarInventariosAbertos();
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


/*Atualizar Inventários*/
router.post('/inventarios/atualizar', async (req, res) => {
    const {oneInvent, inventario1, inventario2} = req.body;
    console.log("Valores Digitados:", req.body);

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
    

    try {
        const result = await inventariosController.atualizarInventario(inventario1, inventario2, oneInvent);
        console.log(result);
        res.status(200).json(result);
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
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