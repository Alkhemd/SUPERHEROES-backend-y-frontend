import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import userRepository from '../repositories/userRepository.js';
import User from '../models/userModel.js';

const SALT_ROUNDS = 10;

export default {
  async register(username, password) {
    if (userRepository.findByUsername(username)) {
      throw new Error('El usuario ya existe');
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ id: uuidv4(), username, password: hashedPassword });
    userRepository.create(user);
    return { id: user.id, username: user.username };
  },

  async login(username, password) {
    const user = userRepository.findByUsername(username);
    if (!user) throw new Error('Usuario o contraseña incorrectos');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Usuario o contraseña incorrectos');
    return { id: user.id, username: user.username };
  }
}; 