const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formationparticipationSchema = new Schema({
    
    
    formId: {
        type: Schema.Types.ObjectId,
        ref: 'evenement',
        required: true
    },
    titre: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const formationParticipation = mongoose.model('formationParticipation', formationparticipationSchema);

module.exports = formationParticipation;