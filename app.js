import express from 'express';
import cors from 'cors';
import heroController from './controllers/heroController.js';
import villainController from './controllers/villainController.js';
import battleController from './controllers/battleController.js';
import authController from './controllers/authController.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerConfig from './swaggerConfig.js';

const app = express();

// Configuración de CORS para permitir requests desde cualquier origen
app.use(cors({
  origin: '*', // Permite requests desde cualquier dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

const swaggerSpec = swaggerJSDoc(swaggerConfig);

// Ruta para exponer el JSON de Swagger
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Documentación Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redirigir la raíz al Swagger UI
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.use(express.json());

// Rutas de la API
app.use('/api', heroController);
app.use('/api', villainController);
app.use('/api', battleController);
app.use('/api/auth', authController);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
});
