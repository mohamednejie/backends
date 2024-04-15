const express = require('express');
const router = express.Router();
const upload = require('../middlewares/telechargement');

// Import des contrôleurs

const controllerevenement = require('../controllers/evenement.controller');

// Routes pour les événements
router.get('/getevent', controllerevenement.getAllevenement);
router.put('/updateevent/:id', controllerevenement.updateevenement);
router.delete('/deleteevent/:id', controllerevenement.deleteevenement);
router.get('/getoneevenent/:id',controllerevenement.getOneEvenement);
router.post('/participatevent/:eventId/:userId', controllerevenement.participate);
router.delete('/cancelparticipation/:id', controllerevenement.cancelParticipation);
router.get('/getparticpevent/:eventId' ,controllerevenement.getparticipate);
router.post('/createevent', upload.single('file'), controllerevenement.createevenement);

module.exports = router;