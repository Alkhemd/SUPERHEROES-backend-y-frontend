import Villain from '../models/villainModel.js';

async function getAllVillains() {
    const villains = await Villain.find().lean();
    return villains.map(v => ({
        id: v._id,
        name: v.name,
        alias: v.alias,
        city: v.city,
        team: v.team,
        power: v.power
    }));
}

async function getAllVillainsByUser(userId) {
    const villains = await Villain.find({ userId }).lean();
    return villains.map(v => ({
        id: v._id,
        name: v.name,
        alias: v.alias,
        city: v.city,
        team: v.team,
        power: v.power
    }));
}

async function addVillain(villain) {
    if (!villain.name || !villain.alias) {
        throw new Error("El villano debe tener un nombre y un alias.");
    }
    // El id numérico es opcional, pero si quieres mantenerlo:
    const lastVillain = await Villain.findOne().sort({ id: -1 });
    const newId = lastVillain && lastVillain.id ? lastVillain.id + 1 : 1;
    const newVillain = new Villain({ ...villain, id: newId });
    await newVillain.save();
    return newVillain.toObject();
}

async function updateVillain(id, updatedVillain) {
    // Buscar por id numérico o por _id de MongoDB
    const villain = await Villain.findOneAndUpdate(
        { $or: [{ id: parseInt(id) }, { _id: id }] },
        { $set: updatedVillain },
        { new: true }
    );
    if (!villain) throw new Error('Villano no encontrado');
    return villain.toObject();
}

async function deleteVillain(id) {
    const villain = await Villain.findOneAndDelete({ $or: [{ id: parseInt(id) }, { _id: id }] });
    if (!villain) throw new Error('Villano no encontrado');
    return { message: 'Villano eliminado' };
}

async function findVillainsByCity(city) {
    return await Villain.find({ city: new RegExp(`^${city}$`, 'i') }).lean();
}

export default {
    getAllVillains,
    addVillain,
    updateVillain,
    deleteVillain,
    findVillainsByCity,
    getAllVillainsByUser
};
