import express from 'express';
import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';

const router = express.Router();
const JWT_SECRET = 'supersecret'; // Cambiar por variable de entorno en producción

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Ya existe una cuenta con ese correo, por favor introduce otro.
 */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El correo electrónico no es válido.' });
  }
  // Verificar si el email ya existe
  const users = await userService.getAllUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Ya existe una cuenta con ese correo, por favor introduce otro.' });
  }
  // Verificar si el username ya existe
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
  }
  try {
    const user = await userService.registerUser({ username, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameOrEmail
 *               - password
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *                 description: Nombre de usuario o correo electrónico
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT generado
 *       400:
 *         description: Credenciales inválidas
 */
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  try {
    const user = await userService.findByUsernameOrEmail(usernameOrEmail);
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    const isValid = await userService.verifyPassword(user, password);
    if (!isValid) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    // Generar y devolver el token JWT
    const token = await userService.generateJWT(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 