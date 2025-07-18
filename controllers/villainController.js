import express from "express";
import { check, validationResult } from 'express-validator';
import villainService from "../services/villainService.js";
import Villain from "../models/villainModel.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Declarar rutas públicas aquí si las hubiera

// Proteger solo las rutas siguientes
// Eliminar router.use(authMiddleware)

/**
 * @swagger
 * /villains:
 *   get:
 *     summary: Obtiene todos los villanos
 *     tags: [Villanos]
 *     responses:
 *       200:
 *         description: Lista de villanos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Villain'
 */
router.get("/villains", authMiddleware, async (req, res) => {
    try {
        // Obtener todos los villanos sin filtrar por userId
        const villains = await villainService.getAllVillains();
        res.json(villains);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /villains:
 *   post:
 *     summary: Crea un nuevo villano
 *     tags: [Villanos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Villain'
 *     responses:
 *       201:
 *         description: Villano creado
 *       400:
 *         description: Error de validación
 */
router.post("/villains",
    [
        check('name').not().isEmpty().withMessage('El nombre es requerido'),
        check('alias').not().isEmpty().withMessage('El alias es requerido'),
        authMiddleware
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        try {
            const { name, alias, city, team } = req.body;
            // Crear el objeto villano como POJO y agregar el userId del token
            const newVillain = { name, alias, city, team, userId: req.userId };
            const addedVillain = await villainService.addVillain(newVillain);
            res.status(201).json(addedVillain);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

/**
 * @swagger
 * /villains/{id}:
 *   put:
 *     summary: Actualiza un villano existente
 *     tags: [Villanos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string  # Cambiado de integer a string para permitir ObjectId de MongoDB
 *         description: ID del villano (ObjectId de MongoDB o id numérico)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Villain'
 *     responses:
 *       200:
 *         description: Villano actualizado
 *       404:
 *         description: Villano no encontrado
 */
router.put("/villains/:id", authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const updatedVillain = await villainService.updateVillain(id, req.body);
        res.json(updatedVillain);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /villains/{id}:
 *   delete:
 *     summary: Elimina un villano
 *     tags: [Villanos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string  # Cambiado de integer a string para permitir ObjectId de MongoDB
 *         description: ID del villano (ObjectId de MongoDB o id numérico)
 *     responses:
 *       200:
 *         description: Villano eliminado
 *       404:
 *         description: Villano no encontrado
 */
router.delete('/villains/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await villainService.deleteVillain(id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /villains/city/{city}:
 *   get:
 *     summary: Busca villanos por ciudad
 *     tags: [Villanos]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de villanos de la ciudad
 */
router.get('/villains/city/:city', authMiddleware, async (req, res) => {
    const city = req.params.city;
    // Validar si es un número
    if (!isNaN(city)) {
        return res.status(400).json({ error: 'Solo se acepta texto relacionado a ciudades.' });
    }
    // Validar si es texto válido (solo letras y espacios)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(city)) {
        return res.status(400).json({ error: 'Escriba bien el nombre de la ciudad.' });
    }
    try {
        const villains = await villainService.findVillainsByCity(city);
        if (villains.length === 0) {
            return res.status(404).json({ error: 'Esa ciudad no se ha agregado.' });
        }
        res.json(villains);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Villain:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         alias:
 *           type: string
 *         city:
 *           type: string
 *         team:
 *           type: string
 */

export default router;
