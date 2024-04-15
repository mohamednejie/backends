const mongoose = require('mongoose');

const BibliothécaireSchema = new mongoose.Schema({
    idlivre: {
        type: String,
        required: true 
    },
    disponibilite: {
        type: Boolean,
        required: true 
    
    },
  
    duree: {
        type: Number,
        required: true 
    },
  auteur:{
    type: String,
    required: true 
  },
  emprunteurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Bibliothécaire = mongoose.model('Bibliothécaire',BibliothécaireSchema);

module.exports = Bibliothécaire;
