// Servicio de lógica de negocio para héroes
import Hero from '../models/heroModel.js';

async function getAllHeroes() {
    const heroes = await Hero.find().lean();
    return heroes.map(h => ({
        id: h._id,
        name: h.name,
        alias: h.alias,
        city: h.city,
        team: h.team,
        power: h.power
    }));
}

async function getAllHeroesByUser(userId) {
    const heroes = await Hero.find({ userId }).lean();
    return heroes.map(h => ({
        id: h._id,
        name: h.name,
        alias: h.alias,
        city: h.city,
        team: h.team,
        power: h.power
    }));
}

async function addHero(hero) {
    if (!hero.name || !hero.alias) {
        throw new Error("El héroe debe tener un nombre y un alias.");
    }
    // El id numérico es opcional, pero si quieres mantenerlo:
    const lastHero = await Hero.findOne().sort({ id: -1 });
    const newId = lastHero && lastHero.id ? lastHero.id + 1 : 1;
    const newHero = new Hero({ ...hero, id: newId });
    await newHero.save();
    return newHero.toObject();
}

async function updateHero(id, updatedHero) {
    // Buscar por id numérico o por _id de MongoDB
    const hero = await Hero.findOneAndUpdate(
        { $or: [{ id: parseInt(id) }, { _id: id }] },
        { $set: updatedHero },
        { new: true }
    );
    if (!hero) throw new Error('Héroe no encontrado');
    return hero.toObject();
}

async function deleteHero(id) {
    const hero = await Hero.findOneAndDelete({ $or: [{ id: parseInt(id) }, { _id: id }] });
    if (!hero) throw new Error('Héroe no encontrado');
    return { message: 'Héroe eliminado' };
}

async function findHeroesByCity(city) {
    return await Hero.find({ city: new RegExp(`^${city}$`, 'i') }).lean();
}

// Adaptado: enfrentar varios héroes a un villano
async function faceVillain(heroIds, villain) {
    const heroes = await Hero.find({ id: { $in: heroIds.map(Number) } });
    if (heroes.length === 0) {
        throw new Error('Ningún héroe encontrado');
    }
    const nombres = heroes.map(h => h.alias).join(', ');
    return `${nombres} enfrentan a ${villain}`;
}

export default {
    getAllHeroes,
    addHero,
    updateHero,
    deleteHero,
    findHeroesByCity,
    faceVillain,
    getAllHeroesByUser
};
