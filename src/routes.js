const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

// Middleware para verificar el Token JWT (Proteger rutas)
function verificarToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(403).json({ error: 'Token requerido' });

    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido o expirado' });
        req.user = decoded; // Guardamos los datos del usuario
        next();
    });
}

// 1. REGISTRO DE USUARIOS
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
            if (err) return res.status(400).json({ error: 'El usuario ya existe o datos inválidos' });
            res.json({ message: 'Usuario registrado con éxito' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// 2. INICIO DE SESIÓN (LOGIN CON JWT)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });

        // Generar token JWT que expira en 1 hora
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login exitoso', token });
    });
});

// --- CRUD DE TAREAS (Protegidas con JWT) ---

// CREATE: Agregar una tarea
router.post('/tasks', verificarToken, (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id;

    db.query('INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)', [title, description, userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear la tarea' });
        res.json({ message: 'Tarea creada con éxito', taskId: result.insertId });
    });
});

// READ: Obtener las tareas del usuario logueado
router.get('/tasks', verificarToken, (req, res) => {
    const userId = req.user.id;

    db.query('SELECT * FROM tasks WHERE user_id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener las tareas' });
        res.json(results);
    });
});

// UPDATE: Modificar una tarea
router.put('/tasks/:id', verificarToken, (req, res) => {
    const { title, description } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    db.query('UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_id = ?', [title, description, taskId, userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar la tarea' });
        res.json({ message: 'Tarea actualizada con éxito' });
    });
});

// DELETE: Eliminar una tarea
router.delete('/tasks/:id', verificarToken, (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;

    db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar la tarea' });
        res.json({ message: 'Tarea eliminada con éxito' });
    });
});

module.exports = router;