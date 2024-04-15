const express = require('express');
const router = express.Router();

// Import des contrôleurs
const controllerRessource = require('../controllers/ressourcepedagoghique.controller');

// Routes pour les ressources pédagogiques
router.get('/getressource', controllerRessource.getAllRessources);
router.post('/createressource', controllerRessource.createRessource);
router.put('/updateressource/:id', controllerRessource.updateRessource);
router.delete('/deleteressource/:id', controllerRessource.deleteRessource);
router.get('/getoneressource/:id', controllerRessource.getOneRessource);

module.exports = router;
