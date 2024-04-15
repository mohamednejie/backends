const Bibliothécaire = require('../models/Bibliothécaire.model');
const User = require('../models/Bibliothécaire.model');
exports.createBibliothécaire = async (req, res) => {
    try {
        const { idlivre, disponibilite, auteur   ,duree  } = req.body;
        const newBibliothécaire = new Bibliothécaire({ idlivre, disponibilite, auteur  , duree });
        const savedBibliothécaire = await newBibliothécaire.save();
        res.json(savedBibliothécaire);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBibliothécaire = async (_req, res) => {
    try {
        const bibliothécaires = await Bibliothécaire.find(); 
        res.json(bibliothécaires);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.getoneBibliothécaire = async (req, res) => {
    try {
        const { id } = req.params;
     const biblio=   await Bibliothécaire.findById(id);
        res.json(biblio);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateBibliothécaire = async (req, res) => {
    try {
        const { id } = req.params;
        const { idlivre, disponibilite,auteur,duree } = req.body;
        const updatedBibliothécaire = await Bibliothécaire.findByIdAndUpdate(id, { idlivre, disponibilite,auteur,duree}, { new: true });
        res.json(updatedBibliothécaire);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteBibliothécaire = async (req, res) => {
    try {
        const { id } = req.params;
        await Bibliothécaire.findByIdAndDelete(id);
        res.json({ message: "livre deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.preterLivre = async (req, res) => {
    try {
        const { userId, livreId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
          
        const livre = await Bibliothécaire.findById(livreId);
        if (!livre) {
            return res.status(404).json({ message: "Livre introuvable" });
        }

        if (!livre.disponibilite) {
            return res.status(400).json({ message: "Livre non disponible" });
        }
        const nombreLivresEmpruntes = user.livresEmpruntes.length;
        if (nombreLivresEmpruntes >= 3) {
            return res.status(400).json(
            { message: "L'utilisateur a déjà emprunté le nombre maximum de livres" });
        }
        livre.disponibilite = false;
        livre.emprunteurs = user._id; 
        await livre.save();

        res.json({ message: "Livre emprunté avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.retournerLivre = async (req, res) => {
    try {
        const { userId, livreId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const livre = await Bibliothécaire.findById(livreId);
        if (!livre) {
            return res.status(404).json({ message: "Livre introuvable" });
        }

        // Vérifier si l'utilisateur a emprunté ce livre
        if (!livre.emprunteurs.includes(user._id)) {
            return res.status(400).json({ message: "L'utilisateur n'a pas emprunté ce livre" });
        }

        // Retourner le livre
        livre.disponibilite = true;
        livre.emprunteurs = livre.emprunteurs.filter(emprunteurId => emprunteurId !== user._id);
        await livre.save();

        res.json({ message: "Livre retourné avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
