// ===== CONFIGURACIÓN DE LA API =====
const API_BASE_URL = 'https://superheroes-backend-y-frontend.onrender.com';

// ===== CLASE PARA MANEJO DE API =====
class SuperheroAPI {
    constructor() {
        this.token = localStorage.getItem('token');
        this.username = localStorage.getItem('username');
    }

    // Método para hacer requests autenticadas
    async authenticatedRequest(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            ...options.headers
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Si el token es inválido, hacer logout automático
        if (response.status === 401) {
            this.logout();
            app.showMessage('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
            app.showScreen('auth-screen');
            return null;
        }

        return response;
    }

    // Registro de usuario
    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en el registro');
        }

        return data;
    }

    // Login de usuario
    async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en el login');
        }

        // Guardar token y datos del usuario
        this.token = data.token;
        localStorage.setItem('token', this.token);
        localStorage.setItem('username', credentials.usernameOrEmail);
        this.username = credentials.usernameOrEmail;

        return data;
    }

    // Logout
    logout() {
        this.token = null;
        this.username = null;
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    }

    // Obtener todos los héroes
    async getHeroes() {
        const response = await this.authenticatedRequest('/api/heroes');
        if (!response) return [];
        
        const data = await response.json();
        return response.ok ? data : [];
    }

    // Obtener todos los villanos
    async getVillains() {
        const response = await this.authenticatedRequest('/api/villains');
        if (!response) return [];
        
        const data = await response.json();
        return response.ok ? data : [];
    }

    // Crear héroe
    async createHero(heroData) {
        const response = await this.authenticatedRequest('/api/heroes', {
            method: 'POST',
            body: JSON.stringify(heroData)
        });

        if (!response) return null;
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al crear héroe');
        }

        return data;
    }

    // Crear villano
    async createVillain(villainData) {
        const response = await this.authenticatedRequest('/api/villains', {
            method: 'POST',
            body: JSON.stringify(villainData)
        });

        if (!response) return null;
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al crear villano');
        }

        return data;
    }

    // Eliminar héroe
    async deleteHero(heroId) {
        const response = await this.authenticatedRequest(`/api/heroes/${heroId}`, {
            method: 'DELETE'
        });

        if (!response) return false;
        
        return response.ok;
    }

    // Eliminar villano
    async deleteVillain(villainId) {
        const response = await this.authenticatedRequest(`/api/villains/${villainId}`, {
            method: 'DELETE'
        });

        if (!response) return false;
        
        return response.ok;
    }
}

// ===== CLASE PRINCIPAL DE LA APLICACIÓN =====
class SuperheroApp {
    constructor() {
        this.api = new SuperheroAPI();
        this.currentCharacterType = null; // 'hero' o 'villain'
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showLoadingScreen();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Tabs de autenticación
        document.getElementById('login-tab').addEventListener('click', () => this.showAuthTab('login'));
        document.getElementById('register-tab').addEventListener('click', () => this.showAuthTab('register'));

        // Formularios de autenticación
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

        // Tabs de personajes
        document.getElementById('heroes-tab').addEventListener('click', () => this.showCharacterTab('heroes'));
        document.getElementById('villains-tab').addEventListener('click', () => this.showCharacterTab('villains'));

        // Botones de agregar personajes
        document.getElementById('add-hero-btn').addEventListener('click', () => this.showCharacterModal('hero'));
        document.getElementById('add-villain-btn').addEventListener('click', () => this.showCharacterModal('villain'));

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.hideCharacterModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.hideCharacterModal());
        document.getElementById('character-form').addEventListener('submit', (e) => this.handleCharacterSubmit(e));

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
    }

    // Mostrar pantalla de carga
    showLoadingScreen() {
        this.showScreen('loading-screen');
        
        // Simular carga y verificar autenticación
        setTimeout(() => {
            if (this.api.token) {
                // Usuario ya autenticado, ir directamente a personajes
                this.showCharactersScreen();
            } else {
                // Mostrar pantalla de autenticación
                this.showScreen('auth-screen');
            }
        }, 2000);
    }

    // Mostrar una pantalla específica
    showScreen(screenId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostrar la pantalla solicitada
        document.getElementById(screenId).classList.add('active');
    }

    // Mostrar tab de autenticación
    showAuthTab(tabType) {
        // Actualizar botones de tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tabType}-tab`).classList.add('active');

        // Mostrar formulario correspondiente
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tabType}-form`).classList.add('active');

        // Limpiar mensajes
        this.clearMessage();
    }

    // Manejar login
    async handleLogin(e) {
        e.preventDefault();
        
        const credentials = {
            usernameOrEmail: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value
        };

        try {
            await this.api.login(credentials);
            this.showMessage('¡Login exitoso! Bienvenido de vuelta.', 'success');
            
            setTimeout(() => {
                this.showCharactersScreen();
            }, 1000);
            
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    // Manejar registro
    async handleRegister(e) {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('register-username').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value
        };

        try {
            await this.api.register(userData);
            this.showMessage('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
            
            // Cambiar a tab de login después del registro
            setTimeout(() => {
                this.showAuthTab('login');
                document.getElementById('login-username').value = userData.username;
            }, 1000);
            
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    // Mostrar pantalla de personajes
    async showCharactersScreen() {
        this.showScreen('characters-screen');
        
        // Mostrar nombre de usuario
        document.getElementById('username-display').textContent = this.api.username || 'Usuario';
        
        // Cargar personajes
        await this.loadCharacters();
    }

    // Mostrar tab de personajes
    showCharacterTab(tabType) {
        // Actualizar botones de tab
        document.querySelectorAll('.character-tab').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tabType}-tab`).classList.add('active');

        // Mostrar lista correspondiente
        document.querySelectorAll('.characters-list').forEach(list => list.classList.remove('active'));
        document.getElementById(`${tabType}-list`).classList.add('active');
    }

    // Cargar personajes desde la API
    async loadCharacters() {
        try {
            // Cargar héroes
            const heroes = await this.api.getHeroes();
            this.renderCharacters(heroes, 'heroes-grid', 'hero');

            // Cargar villanos
            const villains = await this.api.getVillains();
            this.renderCharacters(villains, 'villains-grid', 'villain');
            
        } catch (error) {
            this.showMessage('Error al cargar personajes: ' + error.message, 'error');
        }
    }

    // Renderizar personajes en el grid
    renderCharacters(characters, containerId, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No tienes ${type === 'hero' ? 'héroes' : 'villanos'} registrados aún.</p>
                    <p>¡Agrega algunos para empezar a batallar!</p>
                </div>
            `;
            return;
        }

        characters.forEach(character => {
            const card = this.createCharacterCard(character, type);
            container.appendChild(card);
        });
    }

    // Crear tarjeta de personaje
    createCharacterCard(character, type) {
        const card = document.createElement('div');
        card.className = `character-card ${type}`;
        
        card.innerHTML = `
            <div class="character-info">
                <h3>${character.name}</h3>
                <div class="alias">"${character.alias}"</div>
                <div class="details">
                    ${character.city ? `📍 ${character.city}` : ''}
                    ${character.team ? `👥 ${character.team}` : ''}
                </div>
                <div class="stats">
                    ⚡ Poder: ${character.power || 0} | 
                    🛡️ Defensa: ${character.defense || 0} | 
                    📊 Nivel: ${character.level || 1}
                </div>
            </div>
            <div class="character-actions">
                <button class="btn btn-small btn-delete" onclick="app.deleteCharacter('${character._id}', '${type}')">
                    🗑️ Eliminar
                </button>
            </div>
        `;

        return card;
    }

    // Mostrar modal de personaje
    showCharacterModal(type) {
        this.currentCharacterType = type;
        
        const modal = document.getElementById('character-modal');
        const title = document.getElementById('modal-title');
        
        title.textContent = `Agregar ${type === 'hero' ? 'Héroe' : 'Villano'}`;
        
        // Limpiar formulario
        document.getElementById('character-form').reset();
        
        modal.style.display = 'block';
    }

    // Ocultar modal de personaje
    hideCharacterModal() {
        document.getElementById('character-modal').style.display = 'none';
        this.currentCharacterType = null;
    }

    // Manejar envío del formulario de personaje
    async handleCharacterSubmit(e) {
        e.preventDefault();
        
        const characterData = {
            name: document.getElementById('character-name').value,
            alias: document.getElementById('character-alias').value,
            city: document.getElementById('character-city').value,
            team: document.getElementById('character-team').value
        };

        try {
            if (this.currentCharacterType === 'hero') {
                await this.api.createHero(characterData);
                this.showMessage('¡Héroe creado exitosamente!', 'success');
            } else {
                await this.api.createVillain(characterData);
                this.showMessage('¡Villano creado exitosamente!', 'success');
            }

            this.hideCharacterModal();
            await this.loadCharacters();
            
        } catch (error) {
            this.showMessage('Error al crear personaje: ' + error.message, 'error');
        }
    }

    // Eliminar personaje
    async deleteCharacter(characterId, type) {
        if (!confirm(`¿Estás seguro de que quieres eliminar este ${type === 'hero' ? 'héroe' : 'villano'}?`)) {
            return;
        }

        try {
            let success = false;
            
            if (type === 'hero') {
                success = await this.api.deleteHero(characterId);
            } else {
                success = await this.api.deleteVillain(characterId);
            }

            if (success) {
                this.showMessage('Personaje eliminado exitosamente.', 'success');
                await this.loadCharacters();
            } else {
                this.showMessage('Error al eliminar personaje.', 'error');
            }
            
        } catch (error) {
            this.showMessage('Error al eliminar personaje: ' + error.message, 'error');
        }
    }

    // Manejar logout
    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.api.logout();
            this.showMessage('Has cerrado sesión exitosamente.', 'success');
            
            setTimeout(() => {
                this.showScreen('auth-screen');
                this.showAuthTab('login');
            }, 1000);
        }
    }

    // Mostrar mensaje
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('auth-message');
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
    }

    // Limpiar mensaje
    clearMessage() {
        const messageEl = document.getElementById('auth-message');
        messageEl.style.display = 'none';
        messageEl.textContent = '';
        messageEl.className = 'message';
    }
}

// ===== INICIALIZAR APLICACIÓN =====
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SuperheroApp();
});

// Cerrar modal si se hace click fuera de él
window.addEventListener('click', (e) => {
    const modal = document.getElementById('character-modal');
    if (e.target === modal) {
        app.hideCharacterModal();
    }
});
