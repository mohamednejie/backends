const express = require('express');
const router = express.Router();

const reunioncontroller = require('../controllers/reunion.controller');


router.get('/getallreunion', reunioncontroller.getallreunion);
router.post('/creatreunion', reunioncontroller.createreunion);
router.put('/updatereunion/:id', reunioncontroller.updatereunion);
router.delete('/deletereunion/:id', reunioncontroller.deletereunion);
router.get('/getonereunion/:id',reunioncontroller.getonereunion);
router.post('/participatereunion/:reunId/:userId',reunioncontroller.participate);
router.delete('/cancelpartreun/:id', reunioncontroller.cancelParticipation);
router.get('/getparticpreun/:reunId' ,reunioncontroller.getparticipate);
module.exports=router;