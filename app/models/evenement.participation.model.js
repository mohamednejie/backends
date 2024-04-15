const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const participationSchema = new Schema({
    
    
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'evenement',
        required: true
    },
    name: {
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

const Participation = mongoose.model('Participation', participationSchema);

module.exports = Participation;