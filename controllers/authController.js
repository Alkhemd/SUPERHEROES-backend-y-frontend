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
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *       400:
 *         description: Error de validación
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userService.register(username, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userService.login(username, password);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

export default router; 