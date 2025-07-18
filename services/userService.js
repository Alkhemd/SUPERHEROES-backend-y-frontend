import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export default {
  // Registrar usuario con username, email y password
  async registerUser({ username, email, password }) {
    // Verificar unicidad de username y email
    if (await User.findOne({ username })) {
      throw new Error('El nombre de usuario ya está en uso.');
    }
    if (await User.findOne({ email })) {
      throw new Error('Ya existe una cuenta con ese correo, por favor introduce otro.');
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    return { id: user._id, username: user.username, email: user.email };
  },

  // Buscar usuario por username o email
  async findByUsernameOrEmail(usernameOrEmail) {
    return await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });
  },

  // Validar password
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  },

  // Generar JWT (debes tener tu lógica de JWT aquí)
  async generateJWT(user) {
    // Generar un JWT con el _id del usuario
    return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
  },

  // Obtener todos los usuarios
  async getAllUsers() {
    return await User.find().lean();
  }
}; 