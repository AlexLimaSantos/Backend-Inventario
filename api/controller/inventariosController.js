const inventariosDAO = require('../DAO/inventariosDAO');

class InventariosController {

    /*Função para Buscar Inventários Abertos*/
    async buscarInventariosAbertos() {
        try {
            const result = await inventariosDAO.buscarInventariosAbertos();
            console.log("Inventários Abertos: ", result);
            return result;
        } catch(err) {
            console.log(err);
            return err;
        }
    }


    /*Função para Atualizar Estoque do Inventário*/
    async atualizarInventario(numinvent1, numinvent2, oneInvent = false) {
        try {
            const result = await inventariosDAO.atualizarInventario(numinvent1, numinvent2, oneInvent);
            console.log(result);
            return result;
        } catch(err) {
            console.log(err);
            return err;
        }
    }
}

module.exports = new InventariosController();