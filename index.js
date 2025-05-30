const express = require('express');
const cors = require('cors');
const apiRoutesInventario = require('./api/routers/apiRoutesInventario');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRoutesInventario);

app.listen(3001, () => {
    console.log('Serviço iniciado na porta 3001');
});