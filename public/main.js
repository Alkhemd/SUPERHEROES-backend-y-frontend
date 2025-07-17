// Utilidad para obtener alias/nombre por ID SOLO entre los participantes de la batalla
function getAliasById(id, participants) {
  const found = participants.find(x => x.id == id);
  return found ? (found.alias || found.name || found.id) : id;
}

// Cargar héroes y villanos al iniciar
let HEROES_CACHE = [];
let VILLAINS_CACHE = [];
async function loadHeroesAndVillains() {
  const [heroesRes, villainsRes] = await Promise.all([
    fetch('/api/heroes'),
    fetch('/api/villains')
  ]);
  const heroes = await heroesRes.json();
  const villains = await villainsRes.json();
  HEROES_CACHE = heroes;
  VILLAINS_CACHE = villains;

  // Llenar selects y listas para el formulario de batallas (como antes)
  const heroesSelect = document.getElementById('heroes-select');
  const villainsSelect = document.getElementById('villains-select');
  const heroSelectIndividual = document.getElementById('hero-select-individual');
  const villainSelectIndividual = document.getElementById('villain-select-individual');
  if (heroesSelect) heroesSelect.innerHTML = '';
  if (villainsSelect) villainsSelect.innerHTML = '';
  if (heroSelectIndividual) heroSelectIndividual.innerHTML = '';
  if (villainSelectIndividual) villainSelectIndividual.innerHTML = '';
  heroes.forEach(hero => {
    if (heroesSelect) {
      const option = document.createElement('option');
      option.value = hero.id;
      option.textContent = hero.alias || hero.name;
      heroesSelect.appendChild(option);
    }
    if (heroSelectIndividual) {
      const optionInd = document.createElement('option');
      optionInd.value = hero.id;
      optionInd.textContent = hero.alias || hero.name;
      heroSelectIndividual.appendChild(optionInd);
    }
  });
  villains.forEach(villain => {
    if (villainsSelect) {
      const option = document.createElement('option');
      option.value = villain.id;
      option.textContent = villain.alias || villain.name;
      villainsSelect.appendChild(option);
    }
    if (villainSelectIndividual) {
      const optionInd = document.createElement('option');
      optionInd.value = villain.id;
      optionInd.textContent = villain.alias || villain.name;
      villainSelectIndividual.appendChild(optionInd);
    }
  });

  // Renderizar tabs de personajes
  renderPersonajesTabs(heroes, villains);
}

// Cambiar tipo de batalla
const battleType = document.getElementById('battle-type');
battleType.addEventListener('change', function() {
  const type = battleType.value;
  document.getElementById('battle-form-individual').style.display = (type === 'individual') ? 'block' : 'none';
  document.getElementById('battle-form-team').style.display = (type === 'equipo') ? 'block' : 'none';
});

// Crear batalla individual
async function createBattleIndividual(e) {
  e.preventDefault();
  const heroId = document.getElementById('hero-select-individual').value;
  const villainId = document.getElementById('villain-select-individual').value;
  const resultDiv = document.getElementById('duel-result');
  if (resultDiv) resultDiv.innerHTML = '';
  if (!heroId || !villainId) {
    alert('Selecciona un héroe y un villano.');
    return;
  }
  const res = await fetch(`/api/battle/duel/${heroId}/${villainId}`, {
    method: 'POST'
  });
  if (res.ok) {
    const data = await res.json();
    let msg = `<div style='margin-top:1em;padding:1em;background:#eafbe7;border-radius:8px;border:1px solid #b2e2b2;'>`;
    msg += `<strong>¡Duelo finalizado!</strong><br>`;
    if (data.winner && data.loser) {
      msg += `Ganador: <span style='color:#2a7;font-weight:bold;'>${data.winner.alias || data.winner.name || data.winner.id}</span><br>`;
      msg += `Perdedor: <span style='color:#a22;'>${data.loser.alias || data.loser.name || data.loser.id}</span><br>`;
    } else if (data.winner) {
      msg += `Ganador: <span style='color:#2a7;font-weight:bold;'>${data.winner.alias || data.winner.name || data.winner.id}</span><br>`;
    } else {
      msg += `No se pudo determinar el ganador.`;
    }
    msg += `</div>`;
    if (resultDiv) resultDiv.innerHTML = msg;
    loadBattles();
  } else {
    const error = await res.json().catch(() => ({}));
    alert('Error al crear duelo: ' + (error.error || res.statusText));
  }
}

// Función para validar configuración de personajes
function validateCharacterConfig() {
  const heroes = Array.from(document.getElementById('heroes-select').selectedOptions).map(opt => opt.value);
  const villains = Array.from(document.getElementById('villains-select').selectedOptions).map(opt => opt.value);
  
  // Validar héroes seleccionados
  for (const heroId of heroes) {
    const levelInput = document.getElementById(`hero-level-${heroId}`);
    const defenseInput = document.getElementById(`hero-defense-${heroId}`);
    
    if (levelInput && defenseInput) {
      const level = parseInt(levelInput.value);
      const defense = parseInt(defenseInput.value);
      
      if (level < 1 || level > 3) {
        alert(`Nivel del héroe debe estar entre 1 y 3`);
        return false;
      }
      
      if (defense < 0 || defense > 50) {
        alert(`Defensa del héroe debe estar entre 0 y 50`);
        return false;
      }
    }
  }
  
  // Validar villanos seleccionados
  for (const villainId of villains) {
    const levelInput = document.getElementById(`villain-level-${villainId}`);
    const defenseInput = document.getElementById(`villain-defense-${villainId}`);
    
    if (levelInput && defenseInput) {
      const level = parseInt(levelInput.value);
      const defense = parseInt(defenseInput.value);
      
      if (level < 1 || level > 3) {
        alert(`Nivel del villano debe estar entre 1 y 3`);
        return false;
      }
      
      if (defense < 0 || defense > 50) {
        alert(`Defensa del villano debe estar entre 0 y 50`);
        return false;
      }
    }
  }
  

  
  return true;
}

// Función para obtener configuración de personajes
function getCharacterConfig() {
  const heroes = Array.from(document.getElementById('heroes-select').selectedOptions).map(opt => opt.value);
  const villains = Array.from(document.getElementById('villains-select').selectedOptions).map(opt => opt.value);
  
  const heroConfig = {};
  const villainConfig = {};
  
  // Obtener configuración de héroes
  heroes.forEach(heroId => {
    const levelInput = document.getElementById(`hero-level-${heroId}`);
    const defenseInput = document.getElementById(`hero-defense-${heroId}`);
    
    if (levelInput && defenseInput) {
      heroConfig[heroId] = {
        level: parseInt(levelInput.value),
        defense: parseInt(defenseInput.value)
      };
    }
  });
  
  // Obtener configuración de villanos
  villains.forEach(villainId => {
    const levelInput = document.getElementById(`villain-level-${villainId}`);
    const defenseInput = document.getElementById(`villain-defense-${villainId}`);
    
    if (levelInput && defenseInput) {
      villainConfig[villainId] = {
        level: parseInt(levelInput.value),
        defense: parseInt(defenseInput.value)
      };
    }
  });
  
  return { heroConfig, villainConfig };
}

// Crear batalla por equipos
async function createBattleTeam(e) {
  e.preventDefault();
  const heroes = Array.from(document.getElementById('heroes-select').selectedOptions).map(opt => opt.value);
  const villains = Array.from(document.getElementById('villains-select').selectedOptions).map(opt => opt.value);
  const userSide = document.getElementById('user-side').value;
  
  if (heroes.length === 0 || villains.length === 0) {
    alert('Selecciona al menos un héroe y un villano.');
    return;
  }
  
  // Validar configuración
  if (!validateCharacterConfig()) {
    return;
  }
  
  const { heroConfig, villainConfig } = getCharacterConfig();
  
  const body = {
    heroes,
    villains,
    userSide,
    firstHero: heroes[0],
    firstVillain: villains[0],
    heroConfig,
    villainConfig
  };
  
  const res = await fetch('/api/battle/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (res.ok) {
    alert('¡Batalla por equipos creada!');
    loadBattles();
  } else {
    const error = await res.json().catch(() => ({}));
    alert('Error al crear batalla por equipos: ' + (error.error || res.statusText));
  }
}

// Mostrar detalles de una batalla
async function showBattleDetails(battleId, container) {
  // Determinar endpoint correcto
  let url = `/api/battles/${battleId}`;
  let res = await fetch(url);
  let battle = await res.json();
  if (!battle || battle.error) {
    url = `/api/battle/${battleId}`;
    res = await fetch(url);
    battle = await res.json();
  }
  // Participantes actuales
  let battleHeroes = [];
  let battleVillains = [];
  if (battle.teams && battle.teams.heroes && battle.teams.villains) {
    battleHeroes = battle.teams.heroes.map(h => {
      const full = HEROES_CACHE.find(x => x.id == h.id) || {};
      return { ...full, ...h };
    });
    battleVillains = battle.teams.villains.map(v => {
      const full = VILLAINS_CACHE.find(x => x.id == v.id) || {};
      return { ...full, ...v };
    });
  }
  // Crear detalles
  let html = '<div style="margin-top:1em;padding:1em;background:#f8fafc;border-radius:8px;">';
  html += `<strong>Turno actual:</strong> ${battle.turn || '-'}<br>`;
  if (battle.teams && battle.teams.heroes && battle.teams.villains) {
    html += '<strong>Héroes:</strong><ul>';
    battleHeroes.forEach(h => {
      if (h.hp > 0) {
        const level = h.level || 1;
        const defense = h.defense || 0;
        html += `<li>${h.alias || h.name || h.id}: ${h.hp} HP | Nivel ${level} | Defensa ${defense}</li>`;
      } else {
        html += `<li style='color:#888;text-decoration:line-through;'>${h.alias || h.name || h.id}: 0 HP (derrotado)</li>`;
      }
    });
    html += '</ul>';
    html += '<strong>Villanos:</strong><ul>';
    battleVillains.forEach(v => {
      if (v.hp > 0) {
        const level = v.level || 1;
        const defense = v.defense || 0;
        html += `<li>${v.alias || v.name || v.id}: ${v.hp} HP | Nivel ${level} | Defensa ${defense}</li>`;
      } else {
        html += `<li style='color:#888;text-decoration:line-through;'>${v.alias || v.name || v.id}: 0 HP (derrotado)</li>`;
      }
    });
    html += '</ul>';
    // Formulario de ataque solo si la batalla no ha terminado
    if (!battle.finished) {
      // Determinar lado activo y personaje activo
      const activeSide = battle.current?.side;
      const activeHero = battle.current?.hero;
      const activeVillain = battle.current?.villain;
      let attackerId, defenderId, attackerName, defenderName;
      if (activeSide === 'heroes') {
        attackerId = activeHero;
        defenderId = activeVillain;
        attackerName = getAliasById(attackerId, battleHeroes);
        defenderName = getAliasById(defenderId, battleVillains);
      } else {
        attackerId = activeVillain;
        defenderId = activeHero;
        attackerName = getAliasById(attackerId, battleVillains);
        defenderName = getAliasById(defenderId, battleHeroes);
      }
      html += `<div style='margin-bottom:0.5em;'><strong>Atacante actual:</strong> ${attackerName} <br><strong>Defensor actual:</strong> ${defenderName}</div>`;
      // Obtener información del atacante para mostrar el nivel
      const attackerInfo = battleHeroes.concat(battleVillains).find(p => p.id == attackerId);
      const attackerLevel = attackerInfo ? (attackerInfo.level || 1) : 1;
      const damageMultiplier = attackerLevel;
      
      html += `<div style="margin-top:1em;padding:1em;background:#f0f8ff;border-radius:8px;border:1px solid #4f8cff;">
        <h4 style="margin:0 0 0.5em 0;color:#2a5;">🎮 Controles de Ataque (Nivel ${attackerLevel})</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:0.5em;margin-bottom:0.5em;">
          <button class="attack-btn" data-battle-id="${battleId}" data-attacker="${attackerId}" data-defender="${defenderId}" data-attack="basico" style="background:#ff6b6b;color:white;border:none;padding:0.5em;border-radius:4px;cursor:pointer;font-size:0.9em;">
            <strong>👊 Básico</strong><br><small>A (${5 * damageMultiplier} daño)</small>
          </button>
          <button class="attack-btn" data-battle-id="${battleId}" data-attacker="${attackerId}" data-defender="${defenderId}" data-attack="especial" style="background:#4ecdc4;color:white;border:none;padding:0.5em;border-radius:4px;cursor:pointer;font-size:0.9em;">
            <strong>⚡ Especial</strong><br><small>S (${30 * damageMultiplier} daño)</small>
          </button>
          <button class="attack-btn" data-battle-id="${battleId}" data-attacker="${attackerId}" data-defender="${defenderId}" data-attack="critico" style="background:#45b7d1;color:white;border:none;padding:0.5em;border-radius:4px;cursor:pointer;font-size:0.9em;">
            <strong>💥 Crítico</strong><br><small>D (${45 * damageMultiplier} daño)</small>
          </button>
        </div>
        <div style="font-size:0.8em;color:#666;text-align:center;">
          <strong>Controles:</strong> A=Básico | S=Especial | D=Crítico | <strong>Daño multiplicado por nivel ${attackerLevel}</strong>
        </div>
      </div>`;
    } else {
      // Batalla finalizada
      let winnerText = '';
      if (battle.winner) {
        if (battle.winner === 'heroes' || battle.winner === 'villains') {
          winnerText = `<div style='margin:1em 0;color:#2a7;font-weight:bold;'>¡Ganó el equipo ${battle.winner === 'heroes' ? 'de Héroes' : 'de Villanos'}!</div>`;
        } else {
          winnerText = `<div style='margin:1em 0;color:#2a7;font-weight:bold;'>¡Ganador: ${battle.winner.alias || battle.winner.name || battle.winner}!</div>`;
        }
      } else {
        winnerText = `<div style='margin:1em 0;color:#a22;font-weight:bold;'>Batalla finalizada</div>`;
      }
      html += winnerText;
    }
  }
  if (battle.actions && battle.actions.length > 0) {
    html += '<strong>Acciones:</strong><ul>';
    battle.actions.forEach((a, i) => {
      // Mostrar acción en texto legible SOLO con participantes de la batalla
      let desc = `Turno ${a.turn || i+1}: `;
      if (a.attacker && a.defender) {
        const attackerName = getAliasById(a.attacker, battleHeroes.concat(battleVillains));
        const defenderName = getAliasById(a.defender, battleHeroes.concat(battleVillains));
        desc += `${attackerName} atacó a ${defenderName}`;
        if (a.type) desc += ` con un ataque ${a.type}`;
        if (a.attackerLevel) desc += ` (Nivel ${a.attackerLevel})`;
        if (a.damage) desc += `. Daño total: ${a.damage}`;
        if (a.damageToDefense !== undefined && a.damageToDefense > 0) desc += ` (${a.damageToDefense} a defensa)`;
        if (a.damageToHP !== undefined && a.damageToHP > 0) desc += ` (${a.damageToHP} a vida)`;
        if (a.defenderDefense !== undefined) desc += `. Defensa restante: ${a.defenderDefense}`;
        if (a.remainingHP !== undefined) desc += `. HP restante: ${a.remainingHP}`;
      } else {
        desc += JSON.stringify(a);
      }
      html += `<li>${desc}</li>`;
    });
    html += '</ul>';
  } else {
    html += '<em>No hay acciones registradas.</em>';
  }
  html += '</div>';
  // Mostrar detalles
  let detailsDiv = container.querySelector('.battle-details');
  if (!detailsDiv) {
    detailsDiv = document.createElement('div');
    detailsDiv.className = 'battle-details';
    container.appendChild(detailsDiv);
  }
  detailsDiv.innerHTML = html;

  // Agregar listener al formulario de ataque
  const attackForm = detailsDiv.querySelector('.attack-form');
  if (attackForm) {
    attackForm.onsubmit = async function(e) {
      e.preventDefault();
      const attacker = attackForm.elements['attacker'].value;
      const defender = attackForm.elements['defender'].value;
      if (!attacker || !defender) return;
      const res = await fetch(`/api/battle/${battleId}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacker, defender })
      });
      if (res.ok) {
        // Mantener el detalle abierto y actualizado
        await showBattleDetails(battleId, container);
        // Solo recargar la lista si la batalla terminó
        const battleRes = await fetch(`/api/battle/${battleId}`);
        const battleData = await battleRes.json();
        if (battleData.finished || (battleData.winner && (!battleData.teams || !battleData.teams.heroes || !battleData.teams.villains))) {
          loadBattles();
        }
      } else {
        const error = await res.json().catch(() => ({}));
        alert('Error al atacar: ' + (error.error || res.statusText));
      }
    };
  }
}

// Mostrar batallas finalizadas con tabs
function renderFinalizadasTabs(finishedIndividual, finishedTeam) {
  const tabsDiv = document.getElementById('finalizadas-tabs');
  const contentDiv = document.getElementById('finalizadas-content');
  if (!tabsDiv || !contentDiv) return;
  tabsDiv.innerHTML = '';
  contentDiv.innerHTML = '';
  // Crear botones
  const btnInd = document.createElement('button');
  btnInd.textContent = `Individuales (${finishedIndividual.length})`;
  btnInd.style.marginRight = '1em';
  btnInd.className = 'tab-btn';
  const btnTeam = document.createElement('button');
  btnTeam.textContent = `Por equipos (${finishedTeam.length})`;
  btnTeam.className = 'tab-btn';
  tabsDiv.appendChild(btnInd);
  tabsDiv.appendChild(btnTeam);
  // Renderizar lista de botones
  function renderList(type) {
    contentDiv.innerHTML = '';
    let list = type === 'individual' ? finishedIndividual : finishedTeam;
    if (list.length === 0) {
      contentDiv.innerHTML = '<div style="color:#888;">No hay batallas finalizadas de este tipo.</div>';
      return;
    }
    list.slice().reverse().forEach(battle => {
      const div = document.createElement('div');
      div.className = 'battle';
      let heroes = '-';
      let villains = '-';
      if (type === 'individual') {
        heroes = getAliasById(battle.hero.id || battle.hero, HEROES_CACHE);
        villains = getAliasById(battle.villain.id || battle.villain, VILLAINS_CACHE);
      } else {
        heroes = battle.teams.heroes.map(h => getAliasById(h.id, HEROES_CACHE)).join(', ');
        villains = battle.teams.villains.map(v => getAliasById(v.id, VILLAINS_CACHE)).join(', ');
      }
      div.innerHTML = `<strong>ID:</strong> ${battle.id || '-'}<br>
        <strong>Héroes:</strong> ${heroes}<br>
        <strong>Villanos:</strong> ${villains}<br>`;
      const btn = document.createElement('button');
      btn.textContent = 'Ver detalles';
      btn.style.marginTop = '0.7em';
      btn.onclick = () => {
        // Mostrar detalles al hacer clic
        if (div.querySelector('.battle-details')) {
          div.querySelector('.battle-details').remove();
          return;
        }
        // Ocultar otros detalles abiertos
        contentDiv.querySelectorAll('.battle-details').forEach(el => el.remove());
        // Mostrar detalles
        let detailsDiv = document.createElement('div');
        detailsDiv.className = 'battle-details';
        detailsDiv.style.marginTop = '1em';
        detailsDiv.style.background = '#f8fafc';
        detailsDiv.style.borderRadius = '8px';
        detailsDiv.style.padding = '1em';
        detailsDiv.innerHTML = `<strong>Turno:</strong> ${battle.turn || '-'}<br>
          <strong>Estado:</strong> <span style='color:#a22;'>Finalizada</span><br>
          <strong>Ganador:</strong> ${(battle.winner && battle.winner.alias) ? battle.winner.alias : (battle.winner && battle.winner.name) ? battle.winner.name : (battle.winner || '-')}`;
        div.appendChild(detailsDiv);
        // Mostrar historial de acciones si existen
        if (battle.actions && battle.actions.length > 0) {
          let actionsHtml = '<strong>Acciones:</strong><ul>';
          battle.actions.forEach((a, i) => {
            let desc = `Turno ${a.turn || i+1}: `;
            if (a.attacker && a.defender) {
              const attackerName = getAliasById(a.attacker, HEROES_CACHE.concat(VILLAINS_CACHE));
              const defenderName = getAliasById(a.defender, HEROES_CACHE.concat(VILLAINS_CACHE));
              desc += `${attackerName} atacó a ${defenderName}`;
              if (a.type) desc += ` con un ataque ${a.type}`;
              if (a.damage) desc += `. Daño: ${a.damage}`;
              if (a.remainingHP !== undefined) desc += `. HP restante del defensor: ${a.remainingHP}`;
            } else {
              desc += JSON.stringify(a);
            }
            actionsHtml += `<li>${desc}</li>`;
          });
          actionsHtml += '</ul>';
          detailsDiv.innerHTML += actionsHtml;
        }
      };
      div.appendChild(btn);
      contentDiv.appendChild(div);
    });
  }
  // Eventos
  btnInd.onclick = () => {
    btnInd.className = 'tab-btn active';
    btnTeam.className = 'tab-btn';
    renderList('individual');
  };
  btnTeam.onclick = () => {
    btnInd.className = 'tab-btn';
    btnTeam.className = 'tab-btn active';
    renderList('team');
  };
  // No mostrar ninguna lista por defecto
}

function renderEnCursoTabs(ongoingIndividual, ongoingTeam) {
  const tabsDiv = document.getElementById('en-curso-tabs');
  const contentDiv = document.getElementById('en-curso-content');
  if (!tabsDiv || !contentDiv) return;
  tabsDiv.innerHTML = '';
  contentDiv.innerHTML = '';
  // Crear botones
  const btnInd = document.createElement('button');
  btnInd.textContent = `Individuales (${ongoingIndividual.length})`;
  btnInd.style.marginRight = '1em';
  btnInd.className = 'tab-btn';
  const btnTeam = document.createElement('button');
  btnTeam.textContent = `Por equipos (${ongoingTeam.length})`;
  btnTeam.className = 'tab-btn';
  tabsDiv.appendChild(btnInd);
  tabsDiv.appendChild(btnTeam);
  // Renderizar lista de botones
  function renderList(type) {
    contentDiv.innerHTML = '';
    let list = type === 'individual' ? ongoingIndividual : ongoingTeam;
    if (list.length === 0) {
      contentDiv.innerHTML = '<div style="color:#888;">No hay batallas en curso de este tipo.</div>';
      return;
    }
    list.slice().reverse().forEach(battle => {
      const div = document.createElement('div');
      div.className = 'battle';
      let heroes = '-';
      let villains = '-';
      if (type === 'individual') {
        heroes = getAliasById(battle.hero.id || battle.hero, HEROES_CACHE);
        villains = getAliasById(battle.villain.id || battle.villain, VILLAINS_CACHE);
      } else {
        heroes = battle.teams.heroes.map(h => getAliasById(h.id, HEROES_CACHE)).join(', ');
        villains = battle.teams.villains.map(v => getAliasById(v.id, VILLAINS_CACHE)).join(', ');
      }
      div.innerHTML = `<strong>ID:</strong> ${battle.id || '-'}<br>
        <strong>Héroes:</strong> ${heroes}<br>
        <strong>Villanos:</strong> ${villains}<br>`;
      const btn = document.createElement('button');
      btn.textContent = 'Ver detalles';
      btn.style.marginTop = '0.7em';
      btn.onclick = () => {
        // Mostrar detalles interactivos al hacer clic
        if (div.querySelector('.battle-details')) {
          div.querySelector('.battle-details').remove();
          return;
        }
        // Ocultar otros detalles abiertos
        contentDiv.querySelectorAll('.battle-details').forEach(el => el.remove());
        // Usar el mismo detalle interactivo que en la vista principal
        showBattleDetails(battle.id, div);
      };
      div.appendChild(btn);
      contentDiv.appendChild(div);
    });
  }
  // Eventos
  btnInd.onclick = () => {
    btnInd.className = 'tab-btn active';
    btnTeam.className = 'tab-btn';
    renderList('individual');
  };
  btnTeam.onclick = () => {
    btnInd.className = 'tab-btn';
    btnTeam.className = 'tab-btn active';
    renderList('team');
  };
  // No mostrar ninguna lista por defecto
}

function renderPersonajesTabs(heroes, villains) {
  const tabsDiv = document.getElementById('personajes-tabs');
  const listDiv = document.getElementById('personajes-list');
  const detailDiv = document.getElementById('personaje-detail');
  if (!tabsDiv || !listDiv || !detailDiv) return;
  tabsDiv.innerHTML = '';
  listDiv.innerHTML = '';
  detailDiv.innerHTML = '';
  // Crear botones
  const btnHeroes = document.createElement('button');
  btnHeroes.textContent = `Héroes (${heroes.length})`;
  btnHeroes.style.marginRight = '1em';
  btnHeroes.className = 'tab-btn active';
  const btnVillains = document.createElement('button');
  btnVillains.textContent = `Villanos (${villains.length})`;
  btnVillains.className = 'tab-btn';
  tabsDiv.appendChild(btnHeroes);
  tabsDiv.appendChild(btnVillains);
  // Renderizar lista
  function renderList(type) {
    listDiv.innerHTML = '';
    detailDiv.innerHTML = '';
    let list = type === 'heroes' ? heroes : villains;
    if (list.length === 0) {
      listDiv.innerHTML = '<div style="color:#888;">No hay personajes de este tipo.</div>';
      return;
    }
    const ul = document.createElement('ul');
    list.forEach(personaje => {
      const li = document.createElement('li');
      li.textContent = personaje.alias || personaje.name;
      li.style.cursor = 'pointer';
      li.onclick = () => {
        // Mostrar/ocultar detalles
        if (detailDiv.innerHTML && detailDiv.dataset.id == personaje.id) {
          detailDiv.innerHTML = '';
          detailDiv.dataset.id = '';
          return;
        }
        detailDiv.innerHTML = `<div style='background:#f8fafc;padding:1em;border-radius:8px;margin-top:0.5em;box-shadow:0 1px 6px rgba(60,60,100,0.06);'>
          <strong>Alias:</strong> ${personaje.alias || '-'}<br>
          <strong>Nombre:</strong> ${personaje.name || '-'}<br>
          <strong>Ciudad:</strong> ${personaje.city || '-'}<br>
          <strong>Equipo:</strong> ${personaje.team || '-'}<br>
          <strong>Poder:</strong> ${personaje.power !== undefined ? personaje.power : '-'}<br>
          <strong>Nivel:</strong> ${personaje.level || 1}<br>
          <strong>Defensa:</strong> ${personaje.defense || 0}
        </div>`;
        detailDiv.dataset.id = personaje.id;
      };
      ul.appendChild(li);
    });
    listDiv.appendChild(ul);
  }
  // Eventos
  btnHeroes.onclick = () => {
    btnHeroes.className = 'tab-btn active';
    btnVillains.className = 'tab-btn';
    renderList('heroes');
  };
  btnVillains.onclick = () => {
    btnHeroes.className = 'tab-btn';
    btnVillains.className = 'tab-btn active';
    renderList('villains');
  };
  // Mostrar héroes por defecto
  renderList('heroes');
}

// Listar batallas
async function loadBattles() {
  const res = await fetch('/api/battles');
  const battles = await res.json();
  // Separar batallas en curso y finalizadas
  const ongoing = battles.filter(b => !b.finished && !b.winner);
  // Subdividir en curso en individuales y equipos
  const ongoingIndividual = ongoing.filter(b => b.hero && b.villain);
  const ongoingTeam = ongoing.filter(b => b.teams && b.teams.heroes && b.teams.villains);
  // Considerar finalizadas las que tienen winner aunque no tengan finished
  const finished = battles.filter(b => b.finished || (b.winner && (!b.teams || !b.teams.heroes || !b.teams.villains)));
  // Subdividir finalizadas en individuales y equipos
  const finishedIndividual = finished.filter(b => b.hero && b.villain);
  const finishedTeam = finished.filter(b => b.teams && b.teams.heroes && b.teams.villains);
  // Mostrar batallas en curso con tabs
  renderEnCursoTabs(ongoingIndividual, ongoingTeam);
  // Mostrar batallas finalizadas con tabs
  renderFinalizadasTabs(finishedIndividual, finishedTeam);
}

document.getElementById('battle-form-individual').addEventListener('submit', createBattleIndividual);
document.getElementById('battle-form-team').addEventListener('submit', createBattleTeam);

// Función para crear formularios de configuración de personajes
function createCharacterConfigForms() {
  const heroesSelect = document.getElementById('heroes-select');
  const villainsSelect = document.getElementById('villains-select');
  const heroesConfigList = document.getElementById('heroes-config-list');
  const villainsConfigList = document.getElementById('villains-config-list');
  
  if (!heroesSelect || !villainsSelect || !heroesConfigList || !villainsConfigList) return;
  
  // Función para crear formulario de configuración
  function createConfigForm(characterId, characterName, type) {
    const div = document.createElement('div');
    div.className = 'character-input';
    div.id = `${type}-config-${characterId}`;
    div.style.display = 'none';
    
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1em; width: 100%;">
        <div style="flex: 1; min-width: 120px;">
          <strong>${characterName}</strong>
        </div>
        <div style="display: flex; gap: 0.5em; align-items: center;">
          <label style="margin: 0; font-size: 0.9em;">Nivel:</label>
          <select id="${type}-level-${characterId}" style="width: 60px;">
            <option value="1">1</option>
            <option value="2" selected>2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div style="display: flex; gap: 0.5em; align-items: center;">
          <label style="margin: 0; font-size: 0.9em;">Defensa:</label>
          <input type="number" id="${type}-defense-${characterId}" min="0" max="50" value="25" 
                 style="width: 70px;" placeholder="0-50" title="Defensa máxima: 50">
        </div>
        <div style="flex: 1;">
          <div id="${type}-message-${characterId}" class="success-message" style="display:none; font-size: 0.8em;">
            ✅ Válido
          </div>
        </div>
      </div>
    `;
    
    // Agregar validación en tiempo real para defensa
    const defenseInput = div.querySelector(`#${type}-defense-${characterId}`);
    const messageDiv = div.querySelector(`#${type}-message-${characterId}`);
    
    defenseInput.addEventListener('input', function() {
      const value = parseInt(this.value);
      if (value > 50) {
        this.style.borderColor = '#dc3545';
        messageDiv.textContent = '❌ Máximo 50';
        messageDiv.className = 'error-message';
        messageDiv.style.display = 'block';
      } else if (value < 0) {
        this.style.borderColor = '#dc3545';
        messageDiv.textContent = '❌ Mínimo 0';
        messageDiv.className = 'error-message';
        messageDiv.style.display = 'block';
      } else {
        this.style.borderColor = '#ced4da';
        messageDiv.textContent = '✅ Válido';
        messageDiv.className = 'success-message';
        messageDiv.style.display = 'block';
      }
    });
    
    // Validación inicial
    defenseInput.dispatchEvent(new Event('input'));
    
    return div;
  }
  
  // Crear formularios para todos los héroes
  HEROES_CACHE.forEach(hero => {
    const form = createConfigForm(hero.id, hero.alias || hero.name, 'hero');
    heroesConfigList.appendChild(form);
  });
  
  // Crear formularios para todos los villanos
  VILLAINS_CACHE.forEach(villain => {
    const form = createConfigForm(villain.id, villain.alias || villain.name, 'villain');
    villainsConfigList.appendChild(form);
  });
  
  // Eventos para mostrar/ocultar formularios según selección
  heroesSelect.addEventListener('change', function() {
    const selectedHeroes = Array.from(this.selectedOptions).map(opt => opt.value);
    
    // Ocultar todos los formularios de héroes
    heroesConfigList.querySelectorAll('.character-input').forEach(form => {
      form.style.display = 'none';
    });
    
    // Mostrar solo los formularios de héroes seleccionados
    selectedHeroes.forEach(heroId => {
      const form = document.getElementById(`hero-config-${heroId}`);
      if (form) form.style.display = 'flex';
    });
  });
  
  villainsSelect.addEventListener('change', function() {
    const selectedVillains = Array.from(this.selectedOptions).map(opt => opt.value);
    
    // Ocultar todos los formularios de villanos
    villainsConfigList.querySelectorAll('.character-input').forEach(form => {
      form.style.display = 'none';
    });
    
    // Mostrar solo los formularios de villanos seleccionados
    selectedVillains.forEach(villainId => {
      const form = document.getElementById(`villain-config-${villainId}`);
      if (form) form.style.display = 'flex';
    });
  });
}

// --- AUTENTICACIÓN JWT ---
let AUTH_TOKEN = localStorage.getItem('jwt_token') || null;
let AUTH_USER = localStorage.getItem('jwt_user') || null;

function setAuth(token, user) {
  AUTH_TOKEN = token;
  AUTH_USER = user;
  if (token) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('jwt_user', user);
  } else {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_user');
  }
  updateAuthUI();
}

function updateAuthUI() {
  const authArea = document.getElementById('auth-area');
  const authForms = document.getElementById('auth-forms');
  const userInfo = document.getElementById('user-info');
  const userWelcome = document.getElementById('user-welcome');
  if (!AUTH_TOKEN) {
    authArea.style.display = 'block';
    authForms.style.display = 'block';
    userInfo.style.display = 'none';
    if (userWelcome) userWelcome.textContent = '';
    // Bloquear acciones
    document.querySelectorAll('.container, .list, .form, .battles').forEach(el => el.style.opacity = '0.3');
  } else {
    authArea.style.display = 'block';
    authForms.style.display = 'none';
    userInfo.style.display = 'block';
    if (userWelcome) userWelcome.textContent = `Bienvenido, ${AUTH_USER}`;
    // Desbloquear acciones
    document.querySelectorAll('.container, .list, .form, .battles').forEach(el => el.style.opacity = '1');
  }
}

document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorSpan = document.getElementById('login-error');
  errorSpan.textContent = '';
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      errorSpan.textContent = err.error || 'Error de autenticación';
      return;
    }
    const data = await res.json();
    setAuth(data.token, username);
    document.getElementById('login-form').reset();
    loadHeroesAndVillains();
    loadBattles();
  } catch (err) {
    errorSpan.textContent = 'Error de red';
  }
});

document.getElementById('register-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const errorSpan = document.getElementById('register-error');
  const successSpan = document.getElementById('register-success');
  errorSpan.textContent = '';
  successSpan.textContent = '';
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      errorSpan.textContent = err.error || 'Error de registro';
      return;
    }
    successSpan.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
    document.getElementById('register-form').reset();
  } catch (err) {
    errorSpan.textContent = 'Error de red';
  }
});

document.getElementById('logout-btn').addEventListener('click', function() {
  setAuth(null, null);
  loadHeroesAndVillains();
  loadBattles();
});

// --- Interceptar fetch para enviar el token JWT ---
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
  if (url.startsWith('/api/') && AUTH_TOKEN) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + AUTH_TOKEN;
  }
  const res = await originalFetch(url, options);
  // Si el token expiró o es inválido, forzar logout
  if (res.status === 401) {
    setAuth(null, null);
    alert('Sesión expirada o inválida. Por favor, inicia sesión de nuevo.');
  }
  return res;
};

// Inicializar UI de autenticación
updateAuthUI();

// Inicializar
loadHeroesAndVillains();
loadBattles();

  // Crear formularios de configuración después de cargar los datos
  setTimeout(createCharacterConfigForms, 1000);
  


// Agregar estilos para los botones de tabs
const style = document.createElement('style');
style.innerHTML = `.tab-btn { padding: 0.5em 1.2em; border: none; border-radius: 6px 6px 0 0; background: #e0e4ea; color: #222; font-weight: 600; cursor: pointer; margin-right: 0.5em; transition: background 0.2s; }
.tab-btn.active { background: #4f8cff; color: #fff; }
.attack-btn:hover { transform: scale(1.05); transition: transform 0.2s; }
.attack-btn:active { transform: scale(0.95); }`;
document.head.appendChild(style);

// Manejo de eventos para botones de ataque
document.addEventListener('click', async function(e) {
  if (e.target.classList.contains('attack-btn')) {
    const battleId = e.target.dataset.battleId;
    const attacker = e.target.dataset.attacker;
    const defender = e.target.dataset.defender;
    const attackType = e.target.dataset.attack;
    
    // Deshabilitar todos los botones durante el ataque
    const allButtons = document.querySelectorAll('.attack-btn');
    allButtons.forEach(btn => btn.disabled = true);
    
    try {
      const response = await fetch(`/api/battle/${battleId}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacker, defender, attackType })
      });
      
      if (response.ok) {
        // Recargar la batalla para mostrar el resultado
        const battle = await response.json();
        // Encontrar y actualizar el contenedor de la batalla
        const battleContainer = e.target.closest('.battle');
        if (battleContainer) {
          showBattleDetails(battleId, battleContainer);
        }
      } else {
        const error = await response.json();
        alert('Error al realizar ataque: ' + (error.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error de conexión: ' + error.message);
    } finally {
      // Rehabilitar botones
      allButtons.forEach(btn => btn.disabled = false);
    }
  }
});

// Controles de teclado para ataques
document.addEventListener('keydown', async function(e) {
  // Solo activar si estamos en una batalla por equipos
  const attackButtons = document.querySelectorAll('.attack-btn');
  if (attackButtons.length === 0) return;
  
  let attackType = null;
  switch(e.key.toLowerCase()) {
    case 'a':
      attackType = 'basico';
      break;
    case 's':
      attackType = 'especial';
      break;
    case 'd':
      attackType = 'critico';
      break;
    default:
      return; // No es una tecla de ataque
  }
  
  // Encontrar el botón correspondiente y simular clic
  const targetButton = document.querySelector(`[data-attack="${attackType}"]`);
  if (targetButton && !targetButton.disabled) {
    e.preventDefault(); // Prevenir comportamiento por defecto
    targetButton.click();
  }
}); 