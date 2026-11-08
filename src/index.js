const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database');
const routes = require('./routes'); // Importamos las rutas

const app = express();

app.use(express.json());
app.use(cors());

// Usar las rutas del CRUD y autenticación con prefijo /api
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del frontend
app.use(express.static('public'));
// --------------------------------------- :P
app.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});