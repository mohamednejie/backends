const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const evenementSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    lieu: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duree: {
        type: String,
        required: true
    },
    fileId: {
        type: Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const evenement = mongoose.model('evenement', evenementSchema);

module.exports = evenement;
