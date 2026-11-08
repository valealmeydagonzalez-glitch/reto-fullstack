const mysql = require('mysql2');
require('dotenv').config();

// Crear la conexión usando las variables del archivo .env :P
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Probar la conexión
connection.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos MySQL:', err);
        return;
    }
    console.log('✅ ¡Conectado exitosamente a la base de datos MySQL!');
});

module.exports = connection;