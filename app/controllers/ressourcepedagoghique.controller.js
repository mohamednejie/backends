const RessourcePedagogique = require('../models/ressourcepedagoghique.model');
const Joi = require('joi');

// Schéma de validation avec Joi
const ressourceValidationSchema = Joi.object({
    name: Joi.string().trim().required().min(3).max(25),
    file: Joi.string(),
    description: Joi.string().trim().required(),
    category: Joi.string().trim().required()
});

// Fonction pour créer une ressource pédagogique
exports.createRessource = async (req, res) => {
    try {
        // Validation des données d'entrée avec Joi
        const { error } = ressourceValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Création d'une nouvelle ressource pédagogique avec les données validées
        const { name, file, description, category } = req.body;
        const newRessource = new RessourcePedagogique({ name, file, description, category });

        // Sauvegarde de la nouvelle ressource dans la base de données
        const savedRessource = await newRessource.save();

        // Réponse avec la ressource sauvegardée
        res.json(savedRessource);
    } catch (err) {
        // Gestion des erreurs
        res.status(500).json({ error: err.message });
    }
};

// Fonction pour récupérer toutes les ressources pédagogiques
exports.getAllRessources = async (req, res) => {
    try {
        const ressources = await RessourcePedagogique.find();
        res.json(ressources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Fonction pour récupérer une ressource pédagogique par son ID
exports.getOneRessource = async (req, res) => {
    const resourceId = req.params.id;
    try {
        const ressource = await RessourcePedagogique.findById(resourceId);
        if (!ressource) {
            return res.status(404).json({ message: 'Ressource pédagogique non trouvée' });
        }
        res.json(ressource);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur lors de la récupération de la ressource pédagogique' });
    }
};

// Fonction pour mettre à jour une ressource pédagogique
exports.updateRessource = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, file, description, category } = req.body;
        const updatedRessource = await RessourcePedagogique.findByIdAndUpdate(id, { name, file, description, category }, { new: true });
        res.json(updatedRessource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Fonction pour supprimer une ressource pédagogique
exports.deleteRessource = async (req, res) => {
    try {
        const { id } = req.params;
        await RessourcePedagogique.findByIdAndDelete(id);
        res.json({ message: "Ressource pédagogique supprimée avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
