const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reunionSchema = new mongoose.Schema({
    titre: { type: String,
         required: true 
        },
    description: {
        required: true ,
         type: String 
        },
    date_debut: {
        required: true ,
     type: Date 
         },
    date_fin: {
         required: true ,
         type: Date
         },
     lieu: {
            required: true ,
            type: String
         },
         reunionparticipants: [{ type: Schema.Types.ObjectId, ref: 'User' }]

});

module.exports = mongoose.model('reunion', reunionSchema);
