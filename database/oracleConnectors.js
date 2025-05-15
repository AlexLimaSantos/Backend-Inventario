const oracledb = require('oracledb');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectString: process.env.DATABASE_URL,
}

async function getConnection() {
    oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_12_2' });
    const connection = await oracledb.getConnection(config);
    return connection;
}

module.exports = {getConnection, oracledb};