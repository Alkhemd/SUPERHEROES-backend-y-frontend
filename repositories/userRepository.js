import fs from 'fs';
const USERS_FILE = './users.json';

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export default {
  findByUsername(username) {
    return loadUsers().find(u => u.username === username);
  },
  findById(id) {
    return loadUsers().find(u => u.id === id);
  },
  create(user) {
    const users = loadUsers();
    users.push(user);
    saveUsers(users);
    return user;
  },
  getAll() {
    return loadUsers();
  }
}; 