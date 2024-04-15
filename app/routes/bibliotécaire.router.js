const express = require('express');
const router = express.Router();


const controllerbibliothécaire = require('../controllers/Bibliothécaire.controller');


router.get('/getbiblio', controllerbibliothécaire.getBibliothécaire);
router.post('/createbiblio', controllerbibliothécaire.createBibliothécaire);
router.put('/updatebiblio/:id', controllerbibliothécaire.updateBibliothécaire);
router.delete('/deletebiblio/:id', controllerbibliothécaire.deleteBibliothécaire);
router.post('/preter', controllerbibliothécaire.preterLivre);
router.get('/getonebiblio/:id',controllerbibliothécaire.getoneBibliothécaire)

module.exports = router;