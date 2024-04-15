const User =require('../models/user.model') 

class profilController {
static  async updateprofil  (req, res) {
    try {
        const { id } = req.params;
        const { username, email,password } = req.body;
        const updateprofils = await User.findByIdAndUpdate(id, { username, email , password}, { new: true });
        res.json(updateprofils);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

static async deleteprofil (req, res) {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'utilisateur supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
static async getallprofils( req,res){
    try{
       const profils= await User.find();
       res.json(profils)
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
static async getoneprofils( req,res){
    try{
       const profils= await User.findById(req.params.id);
       res.json(profils)
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
}
module.exports = profilController;
