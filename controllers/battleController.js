// controllers/battleController.js
import express from 'express';
import battleService from '../services/battleService.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Declarar rutas públicas aquí si las hubiera

// Proteger solo las rutas siguientes
// Eliminar router.use(authMiddleware)

/**
 * @swagger
 * /battle/duel/{heroId}/{villainId}:
 *   post:
 *     summary: Enfrenta a un héroe contra un villano y determina al ganador
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: heroId
 *         required: true
 *         schema:
 *           type: string  # Cambiado de integer a string para permitir ObjectId de MongoDB
 *         description: ID del héroe (ObjectId de MongoDB o id numérico)
 *       - in: path
 *         name: villainId
 *         required: true
 *         schema:
 *           type: string  # Cambiado de integer a string para permitir ObjectId de MongoDB
 *         description: ID del villano (ObjectId de MongoDB o id numérico)
 *     responses:
 *       201:
 *         description: Resultado de la batalla
 *       400:
 *         description: Error al realizar la batalla
 *       404:
 *         description: Héroe o villano no encontrado
 */
router.post('/battle/duel/:heroId/:villainId', authMiddleware, async (req, res) => {
  try {
    const { heroId, villainId } = req.params;
    const battle = await battleService.fight(heroId, villainId, req.userId);
    res.status(201).json(battle);
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /battles:
 *   get:
 *     summary: Obtiene el historial completo de batallas
 *     tags: [Batallas]
 *     responses:
 *       200:
 *         description: Lista de todas las batallas
 */
router.get('/battles', authMiddleware, async (req, res) => {
  try {
    // Solo devolver batallas del usuario autenticado
    const battles = await battleService.getBattleHistoryByUser(req.userId);
    res.json(battles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battles/{battleId}:
 *   get:
 *     summary: Obtiene una batalla específica por su ID
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: battleId
 *         required: true
 *         schema:
 *           type: string  # Cambiado de integer a string para permitir ObjectId de MongoDB
 *         description: ID de la batalla (ObjectId de MongoDB)
 *     responses:
 *       200:
 *         description: Detalles de la batalla
 *       404:
 *         description: Batalla no encontrada
 */
router.get('/battles/:battleId', authMiddleware, async (req, res) => {
  try {
    const { battleId } = req.params;
    // Pasar el battleId como string directamente
    const battle = await battleService.getBattleByMongoId(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Batalla no encontrada' });
    }
    res.status(200).json(battle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battle/team:
 *   post:
 *     summary: Crea una batalla por equipos (3 héroes vs 3 villanos)
 *     tags: [Batallas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heroes:
 *                 type: array
 *                 items:
 *                   type: integer
 *               villains:
 *                 type: array
 *                 items:
 *                   type: integer
 *               userSide:
 *                 type: string
 *                 enum: [heroes, villains]
 *               firstHero:
 *                 type: integer
 *               firstVillain:
 *                 type: integer
 *               heroConfig:
 *                 type: object
 *                 description: Configuración personalizada de niveles y defensa para héroes
 *               villainConfig:
 *                 type: object
 *                 description: Configuración personalizada de niveles y defensa para villanos

 *     responses:
 *       201:
 *         description: Batalla creada
 */
router.post('/battle/team', authMiddleware, async (req, res) => {
  try {
    const { heroes, villains, userSide, firstHero, firstVillain, heroConfig, villainConfig } = req.body;
    const battle = await battleService.createTeamBattle({ 
      heroes, 
      villains, 
      userSide, 
      firstHero, 
      firstVillain,
      heroConfig,
      villainConfig,
      userId: req.userId
    });
    res.status(201).json(battle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battle/{id}/attack:
 *   post:
 *     summary: Realiza un ataque en una batalla por equipos
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la batalla (ObjectId de MongoDB)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attacker:
 *                 type: integer
 *               defender:
 *                 type: integer
 *               attackType:
 *                 type: string
 *                 enum: [basico, especial, critico]
 *                 description: Tipo de ataque a realizar (Básico, Especial, Crítico)
 *     responses:
 *       200:
 *         description: Acción realizada
 */
router.post('/battle/:id/attack', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { attacker, defender, attackType } = req.body;
    const battle = await battleService.getBattleByMongoId(id);
    if (!battle || battle.finished) throw new Error('Batalla no encontrada o ya finalizada');
    const updatedBattle = await battleService.teamAttack(battle._id, attacker, defender, attackType, req.userId);
    res.status(200).json(updatedBattle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /battle/{id}:
 *   get:
 *     summary: Obtiene el registro completo de una batalla por equipos
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string  # Cambiado de integer a string para permitir ObjectId de MongoDB
 *         description: ID de la batalla (ObjectId de MongoDB)
 *     responses:
 *       200:
 *         description: Registro de la batalla
 */
router.get('/battle/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // Pasar el id como string directamente
    const battle = await battleService.getTeamBattleById(id, req.userId);
    if (!battle) return res.status(404).json({ error: 'Batalla no encontrada' });
    res.status(200).json(battle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
