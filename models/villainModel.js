import mongoose from 'mongoose';

const villainSchema = new mongoose.Schema({
  id: { type: Number }, // id numérico opcional para compatibilidad
  name: { type: String, required: true },
  alias: { type: String, required: true },
  city: { type: String },
  team: { type: String },
  userId: { type: String, required: true },
  power: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  defense: { type: Number, default: 0 }
}, { collection: 'villains' });

const Villain = mongoose.model('Villain', villainSchema);
export default Villain;
