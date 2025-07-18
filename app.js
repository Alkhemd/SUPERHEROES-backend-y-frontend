import express from 'express';
import heroController from './controllers/heroController.js';
import villainController from './controllers/villainController.js';
import battleController from './controllers/battleController.js'; // 👈 NUEVO
import authController from './controllers/authController.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerConfig from './swaggerConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const swaggerSpec = swaggerJSDoc(swaggerConfig);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger SIEMPRE antes del frontend

// Redirigir la raíz al Swagger UI
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.use(express.json());

// Rutas de la API
app.use('/api', heroController);
app.use('/api', villainController);
app.use('/api', battleController); // 👈 NUEVO
app.use('/api/auth', authController);

// Servir el frontend estático al final
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static('public'));

// (Opcional) Catch-all para SPA frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
});
