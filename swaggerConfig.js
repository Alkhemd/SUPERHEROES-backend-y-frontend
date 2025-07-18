// Configuración Swagger para la API de superhéroes y villanos
const serverUrl = process.env.NODE_ENV === 'production'
  ? 'https://superheroes-backend-y-frontend.onrender.com/api'
  : 'http://localhost:3001/api';

export default {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Superhéroes',
      version: '1.0.0',
      description: 'API para gestionar superhéroes y villanos',
    },
    servers: [
      {
        url: serverUrl, // URL dinámica según entorno
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./controllers/*.js'], // Incluye todos los controladores
};
