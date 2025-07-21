# 🦸‍♂️ API de Superhéroes

Una API REST completa para gestionar superhéroes, villanos y batallas épicas entre ellos.

## 🚀 Características

- **CRUD completo** para superhéroes y villanos
- **Sistema de batallas** con lógica de poder y aleatoriedad
- **Historial de batallas** persistente
- **Documentación automática** con Swagger
- **Validaciones** robustas
- **Arquitectura MVC** limpia

## 📋 Requisitos

- Node.js 18+
- npm o yarn


## 🛠️ Instalación

<!-- Línea de prueba para commit -->

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd api-superheroes

# Instalar dependencias
npm install

# Iniciar el servidor
npm start

# O para desarrollo con auto-reload
npm run dev
```

## 🌐 Endpoints

### Superhéroes
- `GET /api/heroes` - Listar todos los héroes
- `GET /api/heroes/:id` - Obtener héroe por ID
- `POST /api/heroes` - Crear nuevo héroe
- `PUT /api/heroes/:id` - Actualizar héroe
- `DELETE /api/heroes/:id` - Eliminar héroe

### Villanos
- `GET /api/villains` - Listar todos los villanos
- `GET /api/villains/:id` - Obtener villano por ID
- `POST /api/villains` - Crear nuevo villano
- `PUT /api/villains/:id` - Actualizar villano
- `DELETE /api/villains/:id` - Eliminar villano

### Batallas
- `POST /api/battle/:heroId/:villainId` - Realizar batalla
- `GET /api/battles` - Ver historial de batallas
- `GET /api/battles/:battleId` - Ver batalla específica

## 📊 Estructura de Datos

### Superhéroe
```json
{
  "id": 1,
  "name": "Clark Kent",
  "alias": "Superman",
  "city": "Metrópolis",
  "team": "Liga de la Justicia",
  "power": 95
}
```

### Villano
```json
{
  "id": 1,
  "name": "Lex Luthor",
  "alias": "Lex Luthor",
  "city": "Metrópolis",
  "team": "Ninguno",
  "power": 85
}
```

### Batalla
```json
{
  "id": 1703123456789,
  "timestamp": "2023-12-21T10:30:45.123Z",
  "hero": {
    "id": 1,
    "name": "Clark Kent",
    "alias": "Superman",
    "power": 95,
    "finalPower": 98.5
  },
  "villain": {
    "id": 1,
    "name": "Lex Luthor",
    "alias": "Lex Luthor",
    "power": 85,
    "finalPower": 87.2
  },
  "winner": { /* datos del ganador */ },
  "loser": { /* datos del perdedor */ },
  "message": "El ganador es: Superman (Clark Kent)",
  "powerDifference": "11.30",
  "isCloseBattle": false
}
```

## 🎮 Cómo usar

### 1. Iniciar el servidor
```bash
npm start
```

### 2. Ver documentación
Abre tu navegador en: `http://localhost:3001/api-docs`

### 3. Ejemplo de batalla
```bash
curl -X POST http://localhost:3001/api/battle/1/1
```

## 🔧 Tecnologías

- **Express.js** - Framework web
- **Swagger** - Documentación automática
- **fs-extra** - Manejo de archivos JSON
- **express-validator** - Validaciones

## 📁 Estructura del Proyecto

```
api-superheroes/
├── app.js                 # Punto de entrada
├── package.json           # Dependencias
├── swaggerConfig.js       # Configuración Swagger
├── superheroes.json       # Datos de héroes
├── villains.json          # Datos de villanos
├── 📄 battles.json        # Historial de batallas
├── controllers/           # Controladores
│   ├── heroController.js
│   ├── villainController.js
│   └── battleController.js
├── services/             # Lógica de negocio
│   ├── heroService.js
│   ├── villainService.js
│   └── battleService.js
├── repositories/         # Acceso a datos
└── models/              # Modelos de datos
```

## 🎯 Funcionalidades Destacadas

### Sistema de Batallas
- **Lógica de poder**: Cada personaje tiene un nivel de poder base
- **Factor aleatorio**: Se añade aleatoriedad para batallas más emocionantes
- **Historial persistente**: Todas las batallas se guardan automáticamente
- **Batallas cerradas**: Identifica cuando una batalla fue muy reñida

### Validaciones
- Verificación de existencia de personajes
- Validación de tipos de datos
- Manejo de errores robusto

### Documentación
- Swagger UI automático
- Ejemplos de uso
- Códigos de respuesta detallados

## 🚀 Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] Base de datos (PostgreSQL/MongoDB)
- [ ] Tests unitarios y de integración
- [ ] Rate limiting
- [ ] Logging avanzado
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📝 Licencia

ISC License 

## 🛠️ Troubleshooting: Batallas por Equipos (Solución a problema de turnos y participantes)

### Problema
Al crear una batalla por equipos (3 vs 3), solo participaba 1 personaje de cada bando y la batalla terminaba cuando uno era derrotado, sin que los otros dos participaran.

### Análisis
- El endpoint de ataque y la lógica interna buscaban la batalla por el campo `id` propio (numérico), pero el endpoint requería el campo `_id` de MongoDB (ObjectId).
- Además, al crear la batalla, a veces solo se seleccionaba 1 personaje por bando por error en el payload.
- La lógica de turnos y cambio de personaje activo estaba bien, pero si el payload era incorrecto, la batalla se comportaba como 1 vs 1.

### Solución
1. **Unificar la búsqueda de batallas por `_id` de MongoDB** en todos los endpoints y funciones internas.
2. **Actualizar la función `teamAttack`** para buscar y actualizar la batalla usando Mongoose y el campo `_id`.
3. **Verificar que el payload de creación de batalla incluya 3 héroes y 3 villanos** en los arrays `heroes` y `villains`.
4. **Probar la batalla**: ahora, cuando un personaje es derrotado, el siguiente entra automáticamente y la batalla termina solo cuando todos los personajes de un equipo han sido derrotados.

### Ejemplo de payload correcto para batalla por equipos
```json
{
  "heroes": [1, 2, 3],
  "villains": [1, 2, 3],
  "userSide": "heroes",
  "firstHero": 1,
  "firstVillain": 1,
  "heroConfig": {
    "1": { "level": 3, "defense": 20 },
    "2": { "level": 2, "defense": 18 },
    "3": { "level": 3, "defense": 22 }
  },
  "villainConfig": {
    "1": { "level": 1, "defense": 19 },
    "2": { "level": 2, "defense": 17 },
    "3": { "level": 3, "defense": 23 }
  }
}
```

### Resultado
- Las batallas por equipos ahora funcionan correctamente: todos los personajes participan y la batalla termina solo cuando un equipo es completamente derrotado.
- El endpoint de ataque y la lógica interna son consistentes usando `_id` de MongoDB.

---
¡Problema resuelto tras mucho análisis y pruebas! 🎉 