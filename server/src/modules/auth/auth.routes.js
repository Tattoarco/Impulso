const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('./auth.controller');
const { verifyToken } = require('./auth.middleware');

// Rutas públicas
router.post('/register', register);
router.post('/login',    login);

// Rutas privadas (requieren token)
router.get('/me', verifyToken, getMe);

module.exports = router;