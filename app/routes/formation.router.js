const express = require('express');
const router = express.Router();


const formationcontroller = require('../controllers/controller.formations');


// Routes pour les formations
router.get('/getallformation', formationcontroller.getAllFormations);
router.post('/creatformation', formationcontroller.creatformation);
router.put('/updateformation/:id', formationcontroller.updateFormation);
router.delete('/deleteformation/:id', formationcontroller.deleteFormation);
router.get('/getoneformation/:id',formationcontroller.getoneformation);
router.post('/participateformation/:formId/:userId',formationcontroller.participate);
router.get('/getparticpateformation/:formId',formationcontroller.getparticipate);
router.delete('/annulerparticipationforms/:id',formationcontroller.cancelParticipation);
module.exports = router;