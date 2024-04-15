// formation.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formationSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 25
  },
  description: {
    type: String,
    required: true
  },
  date_debut: {
    type: Date,
    required: true
  },
  date_fin: {
    type: Date,
    required: true
  },
 formationparticipants: [{ type: Schema.Types.ObjectId, ref: 'User' }]

});

const Formation = mongoose.model('Formation', formationSchema);

module.exports = Formation;
