import mongoose from 'mongoose';
import fs from 'fs-extra';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const files = [
  { file: './superheroes.json', collection: 'superheroes' },
  { file: './villains.json', collection: 'villains' },
  { file: './users.json', collection: 'users' },
  { file: './📄 battles.json', collection: 'battles' },
];

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    for (const { file, collection } of files) {
      if (!fs.existsSync(file)) {
        console.warn(`Archivo no encontrado: ${file}`);
        continue;
      }
      const data = await fs.readJson(file);
      if (!Array.isArray(data)) {
        console.warn(`El archivo ${file} no contiene un array. Saltando.`);
        continue;
      }
      const Model = mongoose.connection.collection(collection);
      await Model.deleteMany({}); // Limpia la colección antes de migrar
      if (data.length > 0) {
        await Model.insertMany(data);
        console.log(`Migrados ${data.length} documentos a la colección ${collection}`);
      } else {
        console.log(`El archivo ${file} está vacío. Nada que migrar.`);
      }
    }
    await mongoose.disconnect();
    console.log('Migración completada y desconectado de MongoDB');
  } catch (err) {
    console.error('Error en la migración:', err);
    process.exit(1);
  }
}

migrate(); 