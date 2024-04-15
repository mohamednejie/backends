const mongoose = require('mongoose');

const ressourcepedagogiqueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        
    },
    description: {
        type: String,
        required: true,
        trim: true // Supprime les espaces vides avant et après le texte
    },
    file: {
        type: String, // Ou Buffer si vous stockez le contenu du fichier
        required: false
    },
    category: {
        type: String,
        required: true,
        trim: true
    } 
});

const RessourcePedagogique = mongoose.model('RessourcePedagogique', ressourcepedagogiqueSchema);

module.exports = RessourcePedagogique;
