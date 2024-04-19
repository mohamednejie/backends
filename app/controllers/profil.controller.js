const User =require('../models/user.model') 
const Joi = require('joi');
class profilController {
    static async updateprofil(req, res) {
        try {
          const { id } = req.params;
          const { username, email, password } = req.body;
    
          // Définition du schéma de validation avec Joi
          const schema = Joi.object({
            username: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required()
          });
    
          // Validation des données saisies
          const { error, value } = schema.validate({ username, email, password });
    
          if (error) {
            // Si les données saisies ne sont pas valides, renvoyer une réponse d'erreur
            return res.status(400).json({ error: error.details[0].message });
          }
    
          // Vérifier si l'email existe déjà dans la base de données
          const emailExists = await User.findOne({ email });
          if (emailExists) {
            return res.status(400).json({ error: "L'email existe déjà." });
          }
    
          // Si les données saisies sont valides et l'email n'existe pas, mettre à jour le profil de l'utilisateur
          const updateprofils = await User.findByIdAndUpdate(id, { username, email, password }, { new: true });
          res.json(updateprofils);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      }


static async deleteprofil (req, res) {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'utilisateur supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
static async getallprofils(req, res) {
    try {
       const profils = await User.find().populate({
          path: 'roles', // Utilisez 'roles' au lieu de 'role'
          select: 'name' // Sélectionnez uniquement le champ 'name' du modèle de rôle
       }).exec();
       res.json(profils);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
}
static async getoneprofils( req,res){
    try{
       const profils= await User.findById(req.params.id).populate({
        path: 'roles', // Utilisez 'roles' au lieu de 'role'
        select: 'name' // Sélectionnez uniquement le champ 'name' du modèle de rôle
     }).exec();
       res.json(profils)
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
}
module.exports = profilController;
