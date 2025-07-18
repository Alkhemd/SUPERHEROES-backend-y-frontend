import mongoose from 'mongoose';
import fs from 'fs-extra';
import Battle from '../models/battleModel.js';
import Hero from '../models/heroModel.js';
import Villain from '../models/villainModel.js';

const HEROES_PATH = './superheroes.json';
const VILLAINS_PATH = './villains.json';
// const BATTLES_PATH = './📄 battles.json'; // Ya no se usa

// --- Conexión a MongoDB ---
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

// --- Esquema de Batalla para Mongoose ---
const battleSchema = new mongoose.Schema({}, { strict: false, collection: 'battles' });
const BattleMongoose = mongoose.model('Battle', battleSchema);

function getHeroes() {
  return fs.readJson(HEROES_PATH);
}

function getVillains() {
  return fs.readJson(VILLAINS_PATH);
}

// --- Persistencia en MongoDB ---
async function getBattles() {
  return await BattleMongoose.find({}).lean();
}

async function saveBattle(battle) {
  // Asegura que el campo 'id' esté presente en el documento guardado
  if (!battle.id) {
    battle.id = Date.now();
  }
  await BattleMongoose.create(battle);
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function fight(heroId, villainId, userId) {
  let hero, villain;

  // Buscar héroe
  if (isValidObjectId(heroId)) {
    hero = await Hero.findById(heroId).lean();
  } else if (!isNaN(heroId)) {
    hero = await Hero.findOne({ id: Number(heroId) }).lean();
  }

  // Buscar villano
  if (isValidObjectId(villainId)) {
    villain = await Villain.findById(villainId).lean();
  } else if (!isNaN(villainId)) {
    villain = await Villain.findOne({ id: Number(villainId) }).lean();
  }

  if (!hero) {
    throw new Error(`Héroe con ID ${heroId} no encontrado`);
  }

  if (!villain) {
    throw new Error(`Villano con ID ${villainId} no encontrado`);
  }

  if (typeof hero?.power !== 'number' || typeof villain?.power !== 'number') {
    throw new Error('Ambos deben tener un atributo "power" numérico');
  }

  // Lógica de batalla mejorada
  const heroPower = hero.power;
  const villainPower = villain.power;
  
  // Factor de aleatoriedad para hacer las batallas más emocionantes
  const heroRandom = Math.random() * 10;
  const villainRandom = Math.random() * 10;
  
  const heroFinalPower = heroPower + heroRandom;
  const villainFinalPower = villainPower + villainRandom;

  const winner = heroFinalPower >= villainFinalPower ? hero : villain;
  const loser = heroFinalPower >= villainFinalPower ? villain : hero;
  
  const battleResult = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    userId: userId, // Almacenar el userId
    hero: {
      id: hero.id,
      name: hero.name,
      alias: hero.alias,
      power: heroPower,
      finalPower: Math.round(heroFinalPower * 100) / 100
    },
    villain: {
      id: villain.id,
      name: villain.name,
      alias: villain.alias,
      power: villainPower,
      finalPower: Math.round(villainFinalPower * 100) / 100
    },
    winner: {
      id: winner.id,
      name: winner.name,
      alias: winner.alias,
      power: winner.power,
      finalPower: Math.round((winner === hero ? heroFinalPower : villainFinalPower) * 100) / 100
    },
    loser: {
      id: loser.id,
      name: loser.name,
      alias: loser.alias,
      power: loser.power,
      finalPower: Math.round((loser === hero ? heroFinalPower : villainFinalPower) * 100) / 100
    },
    message: `El ganador es: ${winner.alias} (${winner.name})`,
    powerDifference: Math.abs(heroFinalPower - villainFinalPower).toFixed(2),
    isCloseBattle: Math.abs(heroFinalPower - villainFinalPower) < 5
  };

  // Guardar la batalla en el historial
  await saveBattle(battleResult);

  return battleResult;
}

async function getBattleHistory() {
  return await getBattles();
}

async function getBattleHistoryByUser(userId) {
  const all = await getBattleHistory();
  return all.filter(b => b.userId === userId);
}

async function getBattleById(battleId) {
  const battles = await getBattles();
  return battles.find(b => b.id === battleId);
}

// NUEVO: Crear batalla por equipos
async function createTeamBattle({ heroes, villains, userSide, firstHero, firstVillain, heroConfig = {}, villainConfig = {}, userId }) {
  const id = Date.now();
  const battle = new Battle({ id, heroes, villains, userSide, firstHero, firstVillain, userId });
  battle.id = id; // Asegura que el campo id esté presente
  
  // Cargar datos completos de héroes y villanos para obtener nivel y defensa por defecto
  const heroesData = await getHeroes();
  const villainsData = await getVillains();
  
  // Asignar nivel y defensa inicial a cada personaje (usando configuración personalizada o valores por defecto)
  battle.teams.heroes.forEach(hero => {
    const heroData = heroesData.find(h => h.id === hero.id);
    const customConfig = heroConfig[hero.id];
    
    if (customConfig) {
      // Usar configuración personalizada
      hero.level = customConfig.level || 1;
      hero.defense = customConfig.defense || 0;
      hero.maxDefense = customConfig.defense || 0;
    } else if (heroData) {
      // Usar valores por defecto del archivo
      hero.level = heroData.level || 1;
      hero.defense = heroData.defense || 0;
      hero.maxDefense = heroData.defense || 0;
    } else {
      // Valores por defecto
      hero.level = 1;
      hero.defense = 0;
      hero.maxDefense = 0;
    }
  });
  
  battle.teams.villains.forEach(villain => {
    const villainData = villainsData.find(v => v.id === villain.id);
    const customConfig = villainConfig[villain.id];
    
    if (customConfig) {
      // Usar configuración personalizada
      villain.level = customConfig.level || 1;
      villain.defense = customConfig.defense || 0;
      villain.maxDefense = customConfig.defense || 0;
    } else if (villainData) {
      // Usar valores por defecto del archivo
      villain.level = villainData.level || 1;
      villain.defense = villainData.defense || 0;
      villain.maxDefense = villainData.defense || 0;
    } else {
      // Valores por defecto
      villain.level = 1;
      villain.defense = 0;
      villain.maxDefense = 0;
    }
  });
  
  await saveBattle(battle);
  // Construir la respuesta con _id justo debajo de id
  const response = { id: battle.id, _id: battle._id, ...battle };
  return response;
}

// NUEVO: Realizar ataque por turnos en batalla por equipos
async function teamAttack(battleId, attackerId, defenderId, attackType = null, userId) {
  // Buscar la batalla por _id de MongoDB
  const battle = await BattleMongoose.findOne({ _id: battleId }).lean();
  if (!battle || battle.finished) throw new Error('Batalla no encontrada o ya finalizada');

  // Validar que la batalla pertenezca al userId
  if (battle.userId !== userId) {
    throw new Error('No tienes permiso para atacar en esta batalla');
  }

  // Determinar IDs activos
  const activeHero = battle.current.hero;
  const activeVillain = battle.current.villain;
  const userTeam = battle.userSide;

  // Validar que el usuario solo pueda atacar con su personaje activo y al rival activo
  if (userTeam === 'heroes' && battle.current.side === 'heroes') {
    if (attackerId !== activeHero || defenderId !== activeVillain) {
      throw new Error('Solo puedes atacar con tu héroe activo al villano activo');
    }
  } else if (userTeam === 'villains' && battle.current.side === 'villains') {
    if (attackerId !== activeVillain || defenderId !== activeHero) {
      throw new Error('Solo puedes atacar con tu villano activo al héroe activo');
    }
  } else {
    throw new Error('No es el turno de tu equipo');
  }

  // Función para actualizar los personajes activos
  function actualizarActivos() {
    battle.current.hero = siguienteVivo('heroes', battle.current.hero);
    battle.current.villain = siguienteVivo('villains', battle.current.villain);
    if (battle.current.heroe !== undefined) delete battle.current.heroe;
  }

  // Función para cambiar al siguiente personaje vivo de un equipo
  function siguienteVivo(equipo, actualId) {
    const vivos = battle.teams[equipo].filter(p => p.hp > 0);
    if (vivos.length === 0) return null;
    
    // Si el personaje actual está muerto, cambiar al primer vivo
    const actual = battle.teams[equipo].find(p => p.id === actualId);
    if (!actual || actual.hp === 0) {
      return vivos[0].id;
    }
    
    // Si el personaje actual está vivo, mantenerlo
    return actualId;
  }

  // Función para realizar un ataque entre los activos
  function realizarAtaque(attackerId, defenderId, attackType = null) {
    let atacante, defensor;
    if (battle.current.side === 'heroes') {
      atacante = battle.teams.heroes.find(h => h.id === attackerId);
      defensor = battle.teams.villains.find(v => v.id === defenderId);
    } else {
      atacante = battle.teams.villains.find(v => v.id === attackerId);
      defensor = battle.teams.heroes.find(h => h.id === defenderId);
    }
    if (!atacante || atacante.hp === 0) return false;
    if (!defensor || defensor.hp === 0) return false;
    
    // Definir tipos de ataques disponibles (los 3 originales)
    const ataques = {
      'basico': { tipo: 'Básico', damage: 5 },
      'especial': { tipo: 'Especial', damage: 30 },
      'critico': { tipo: 'Crítico', damage: 45 }
    };
    
    let golpe;
    if (attackType && ataques[attackType]) {
      // Usuario eligió un ataque específico
      golpe = ataques[attackType];
    } else {
      // Ataque aleatorio para la IA (solo entre los 3 originales)
      const ataquesIA = ['basico', 'especial', 'critico'];
      const ataqueAleatorio = ataquesIA[Math.floor(Math.random() * ataquesIA.length)];
      golpe = ataques[ataqueAleatorio];
    }
    
    // Calcular daño basado en el nivel del atacante
    const nivelMultiplicador = atacante.level || 1;
    const dañoBase = golpe.damage;
    const dañoFinal = dañoBase * nivelMultiplicador;
    
    // Sistema de defensa: primero reducir defensa, luego vida
    let dañoRestante = dañoFinal;
    let defensaReducida = 0;
    let vidaReducida = 0;
    
    // Si hay defensa, reducirla primero
    if (defensor.defense > 0) {
      defensaReducida = Math.min(defensor.defense, dañoRestante);
      defensor.defense = Math.max(0, defensor.defense - defensaReducida);
      dañoRestante -= defensaReducida;
    }
    
    // Si queda daño después de reducir defensa, reducir vida
    if (dañoRestante > 0) {
      vidaReducida = dañoRestante;
      defensor.hp = Math.max(0, defensor.hp - vidaReducida);
    }
    
    // Regenerar un poco de defensa al final del turno (máximo 10% de la defensa máxima)
    if (defensor.maxDefense) {
      const regeneracion = Math.floor(defensor.maxDefense * 0.1);
      defensor.defense = Math.min(defensor.maxDefense, defensor.defense + regeneracion);
    }
    
    battle.actions.push({
      turn: battle.turn,
      attacker: attackerId,
      attackerTeam: battle.current.side,
      defender: defenderId,
      defenderTeam: battle.current.side === 'heroes' ? 'villains' : 'heroes',
      type: golpe.tipo,
      damage: dañoFinal,
      damageToDefense: defensaReducida,
      damageToHP: vidaReducida,
      attackerLevel: atacante.level,
      defenderDefense: defensor.defense,
      remainingHP: defensor.hp,
      timestamp: new Date().toISOString(),
    });
    
    // Verificar si el defensor fue derrotado
    if (defensor.hp === 0) {
      const defenderTeam = battle.current.side === 'heroes' ? 'villains' : 'heroes';
      const next = battle.teams[defenderTeam].find(p => p.hp > 0);
      if (!next) {
        battle.finished = true;
        battle.winner = defenderTeam === 'heroes' ? 'villains' : 'heroes';
        return false; // Termina la batalla
      } else {
        battle.current[defenderTeam.slice(0, -1)] = next.id;
      }
    }
    return true; // Continúa la batalla
  }

  // Función para guardar la batalla actualizada usando Mongoose
  async function updateBattle() {
    await BattleMongoose.findByIdAndUpdate(battleId, battle, { new: true });
  }

  // 1. Ataque del usuario (solo entre activos)
  if (!realizarAtaque(attackerId, defenderId, attackType)) {
    // Actualizar los activos si alguno murió
    actualizarActivos();
    await updateBattle(); // Guardar batalla actualizada
    return battle;
  }
  battle.turn++;

  // Actualizar activos después del ataque del usuario
  actualizarActivos();

  // Verificar si el defensor murió después del ataque del usuario
  const defenderTeam = battle.current.side === 'heroes' ? 'villains' : 'heroes';
  const defensor = battle.teams[defenderTeam].find(p => p.id === defenderId);
  
  // Si el defensor murió, terminar el turno sin ataque automático
  if (defensor && defensor.hp === 0) {
    // Verificar si el equipo del defensor tiene más personajes vivos
    const nextDefender = battle.teams[defenderTeam].find(p => p.hp > 0);
    if (!nextDefender) {
      // No hay más personajes vivos en el equipo del defensor
      battle.finished = true;
      battle.winner = battle.current.side;
      await updateBattle(); // Guardar batalla actualizada
      return battle;
    } else {
      // Cambiar al siguiente personaje vivo del equipo del defensor
      battle.current[defenderTeam.slice(0, -1)] = nextDefender.id;
      // Alternar turno al equipo del usuario
      battle.current.side = userTeam;
      actualizarActivos();
      await updateBattle(); // Guardar batalla actualizada
      return battle;
    }
  }

  // Alternar turno solo si el equipo contrario tiene personajes vivos
  const nextSide = battle.current.side === 'heroes' ? 'villains' : 'heroes';
  const nextActive = battle.teams[nextSide].find(p => p.hp > 0);
  if (nextActive) {
    battle.current.side = nextSide;
    // Actualizar los activos si alguno murió
    actualizarActivos();
  } else {
    // Si no hay personajes vivos en el equipo contrario, termina la batalla
    battle.finished = true;
    battle.winner = battle.current.side;
    await updateBattle(); // Guardar batalla actualizada
    return battle;
  }

  // 2. Ataques automáticos del bando contrario (solo entre activos) hasta que vuelva el turno del usuario o termine la batalla
  while (!battle.finished && battle.current.side !== userTeam) {
    const autoAttacker = battle.current.side === 'heroes' ? battle.current.hero : battle.current.villain;
    const autoDefender = battle.current.side === 'heroes' ? battle.current.villain : battle.current.hero;
    if (!realizarAtaque(autoAttacker, autoDefender)) break;
    battle.turn++;
    // Alternar turno solo si el equipo contrario tiene personajes vivos
    const nextAutoSide = battle.current.side === 'heroes' ? 'villains' : 'heroes';
    const nextAutoActive = battle.teams[nextAutoSide].find(p => p.hp > 0);
    if (nextAutoActive) {
      battle.current.side = nextAutoSide;
      actualizarActivos();
    } else {
      battle.finished = true;
      battle.winner = battle.current.side;
      break;
    }
  }

  await updateBattle(); // Guardar batalla final
  return battle;
}

// NUEVO: Obtener batalla por ID (con registro completo)
async function getTeamBattleById(battleId, userId) {
  // Buscar la batalla por _id de MongoDB
  const battle = await BattleMongoose.findOne({ _id: battleId }).lean();
  if (battle && battle.userId === userId) return battle;
  return null;
}

async function getBattleByMongoId(mongoId) {
  if (!mongoose.Types.ObjectId.isValid(mongoId)) return null;
  return await BattleMongoose.findOne({ _id: mongoId }).lean();
}

export default { 
  fight, 
  getBattleHistory, 
  getBattleHistoryByUser,
  getBattleById, 
  // NUEVO:
  createTeamBattle,
  teamAttack,
  getTeamBattleById,
  getBattleByMongoId,
};
