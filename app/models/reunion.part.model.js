const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReunionparticipationSchema = new Schema({
    
    
    reunId: {
        type: Schema.Types.ObjectId,
        ref: 'reunion',
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

const ReunParticipation = mongoose.model('ReunParticipation', ReunionparticipationSchema);

module.exports = ReunParticipation;