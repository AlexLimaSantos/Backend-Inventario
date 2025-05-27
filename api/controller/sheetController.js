const XLSX = require('xlsx');
const fs = require('fs');
const multer = require('multer');


/*Salva planilha na pasta */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './api/uploads-kaizen/');
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.')[1];
        const filename = Date.now() + "-" + file + '.' + ext;
        cb(null, filename);
        console.log(filename);
    }
});

const upload = multer({ storage });

/*Trata dados da planilha*/
async function processSheet(file){

    try {
        const workbook = XLSX.readFile(file);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log('Dados da Planilha:', data);

        fs.unlinkSync(file);

        return 'Planilha processada com sucesso!';
    } catch (error){
        console.error('Erro ao processar planilha:', error);
        return 'Erro ao processar a planilha.';
    }

};

module.exports = {upload, processSheet};