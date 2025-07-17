// Modelo de usuario para autenticación y autorización
export default class User {
  constructor({ id, username, password }) {
    this.id = id;
    this.username = username;
    this.password = password; // Debe estar hasheado
  }
} 