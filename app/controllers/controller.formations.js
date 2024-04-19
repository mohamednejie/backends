// controllers/formationsController.js
const Formation = require('../models/formation.model');
const Joi=require('joi');
const nodemailer = require('nodemailer');
const Role = require('../models/role.model');
const User=require('../models/user.model')
const Participation=require('../models/formation.particpation.model')
const formationValidationSchema = Joi.object({
    titre: Joi.string().required().min(3).max(25),
    description: Joi.string().required(),
    date_debut: Joi.date().required(),
    date_fin: Joi.date().required(),
}).custom((value, helpers) => {
    // Vérifie si la date de début est inférieure à la date de fin
    if (new Date(value.date_debut) >= new Date(value.date_fin)) {
        return helpers.error('La date de début doit être antérieure à la date de fin');
    }
    // Vérifie si la date de début et la date de fin sont supérieures à la date actuelle
    const currentDate = new Date();
    if (new Date(value.date_debut) <= currentDate || new Date(value.date_fin) <= currentDate) {
        return helpers.error('Les dates doivent être postérieures à la date actuelle');
    }
    return value;
});

const creatformation = async (req, res) => {
    try {
        const { error } = formationValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { titre, description, date_debut, date_fin } = req.body;
        
        const formation = await Formation.create({ titre, description, date_debut, date_fin });
        sendEmailForCreatedFormation(formation);

        res.status(201).json(formation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateFormation = async (req, res) => {
    try {
        // Récupérer l'ID de la formation à mettre à jour depuis les paramètres de requête
        const { id } = req.params;

        // Vérifier si la formation existe dans la base de données
        const existingFormation = await Formation.findById(id);
        if (!existingFormation) {
            return res.status(404).json({ error: "La formation n'existe pas" });
        }

        // Valider les données de la formation à mettre à jour
        const { titre, description, date_debut, date_fin } = req.body;

        // Valider le titre
        if (!titre || titre.trim() === '') {
            return res.status(400).json({ error: "Le titre de la formation est requis" });
        }

        // Valider la description
        if (!description || description.trim() === '') {
            return res.status(400).json({ error: "La description de la formation est requise" });
        }

        // Valider les dates de début et de fin
        const currentDate = new Date();
        const startDate = new Date(date_debut);
        const endDate = new Date(date_fin);

        if (startDate <= currentDate || endDate <= currentDate) {
            return res.status(400).json({ error: "Les dates doivent être postérieures à la date actuelle" });
        }

        if (startDate >= endDate) {
            return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin" });
        }

        // Mettre à jour les champs modifiables de la formation
        existingFormation.titre = titre;
        existingFormation.description = description;
        existingFormation.date_debut = startDate;
        existingFormation.date_fin = endDate;

        // Enregistrer les modifications de la formation dans la base de données
        await existingFormation.save();

        // Envoyer un email pour notifier la mise à jour de la formation
        await sendEmailForUpdatedFormation(existingFormation);

        // Retourner la formation mise à jour
        return res.json(existingFormation);

    } catch (err) {
        // En cas d'erreur, renvoyer une réponse avec le message d'erreur
        return res.status(500).json({ error: err.message });
    }
};


const getAllFormations = async (req, res) => {
    try {
        const formations = await Formation.find();
        res.json(formations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const deleteFormation = async (req, res) => {
    try {
        // Recherche de la formation à supprimer pour obtenir ses détails avant la suppression
        const formationToDelete = await Formation.findById(req.params.id);

        // Suppression de la formation de la base de données
        await Formation.findByIdAndDelete(req.params.id);

        // Envoi d'un e-mail pour informer les utilisateurs concernés de la suppression de la formation
        sendEmailForDeletedFormation(formationToDelete);

        // Réponse JSON indiquant que la formation a été supprimée avec succès
        res.json({ message: 'Formation supprimée avec succès.' });
    } catch (err) {
        // En cas d'erreur, renvoyer une réponse avec le message d'erreur
        res.status(500).json({ message: err.message });
    }
};
const getoneformation=async(req,res)=>{
    try{
        const formation = await Formation.findById(req.params.id);
        res.json(formation);
    }catch(error){
        console.log("error")
    }
}

const sendEmailForCreatedFormation = async (formationDetails) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com', // Remplacez par votre adresse e-mail Gmail
                pass: 'kgpyponmairtmebs', // Remplacez par le mot de passe ou le mot de passe d'application de votre adresse e-mail Gmail
            },
        });

        // Récupérer l'ObjectId du rôle "prof" depuis la base de données
        const roleProf = await Role.findOne({ name: 'prof' });

        // Récupérer tous les utilisateurs ayant le rôle "prof" en utilisant l'ObjectId du rôle
        const profUsers = await User.find({ roles: roleProf._id });

        // Envoyer un e-mail à chaque utilisateur ayant le rôle "prof"
        profUsers.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com',
                to: user.email,
                subject: 'Nouvelle Formation',
                text: `Une nouvelle formation a été créée : ${formationDetails.titre}. Date début : ${formationDetails.date_debut}. Date fin : ${formationDetails.date_fin}. Description : ${formationDetails.description}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('E-mail envoyé à tous les utilisateurs ayant le rôle "prof" pour informer de la création de la formation');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail aux utilisateurs ayant le rôle "prof" pour informer de la création de la formation :', error);
    }
};
const sendEmailForDeletedFormation = async (formationDetails) => {
    try {
        // Récupérer l'ObjectId du rôle "prof" depuis la base de données
        const roleProf = await Role.findOne({ name: 'prof' });

        // Récupérer tous les utilisateurs ayant le rôle "prof" en utilisant l'ObjectId du rôle
        const profUsers = await User.find({ roles: roleProf._id });

        // Configuration du transporteur d'e-mails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com', // Remplacez par votre adresse e-mail
                pass: 'kgpyponmairtmebs', // Remplacez par votre mot de passe
            },
        });

        // Envoyer un e-mail à chaque utilisateur ayant le rôle "prof"
        profUsers.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com', // Remplacez par votre adresse e-mail
                to: user.email,
                subject: 'Suppression de Formation',
                text: `La formation "${formationDetails.titre}" a été annulée. Date début : ${formationDetails.date_debut}. Date fin : ${formationDetails.date_fin}. Description : ${formationDetails.description}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('E-mail envoyé à tous les utilisateurs ayant le rôle "prof" pour informer de la suppression de la formation');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail aux utilisateurs ayant le rôle "prof" pour informer de la suppression de la formation :', error);
    }
};
const sendEmailForUpdatedFormation = async (updatedFormation) => {
    try {
        // Récupérer l'ObjectId du rôle "prof" depuis la base de données
        const roleProf = await Role.findOne({ name: 'prof' });

        // Récupérer tous les utilisateurs ayant le rôle "prof" en utilisant l'ObjectId du rôle
        const profUsers = await User.find({ roles: roleProf._id });

        // Configuration du transporteur d'e-mails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com', // Remplacez par votre adresse e-mail
                pass: 'kgpyponmairtmebs', // Remplacez par votre mot de passe
            },
        });

        // Envoyer un e-mail à chaque utilisateur ayant le rôle "prof"
        profUsers.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com', // Remplacez par votre adresse e-mail
                to: user.email,
                subject: 'Formation mise à jour',
                text: `La formation ${updatedFormation.titre} a été mise à jour. Nouvelle date de début : ${updatedFormation.date_debut}. Nouvelle date de fin : ${updatedFormation.date_fin}. Nouvelle description : ${updatedFormation.description}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('E-mail envoyé à tous les utilisateurs ayant le rôle "prof" pour informer de la mise à jour de la formation');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail aux utilisateurs ayant le rôle "prof" pour informer de la mise à jour de la formation :', error);
    }
};
const participate = async (req, res) => {
    const formId = req.params.formId;
    const userId = req.params.userId;
    try {
        // Vérifier si l'événement existe
        const formationFound = await Formation.findById(formId);
        if (!formationFound) {
            return res.status(404).json({ message: 'formation non trouvé' });
        }

        // Vérifier si l'utilisateur existe
        const userFound = await User.findById(userId);
        if (!userFound) {
            return res.status(400).json({ error: 'Utilisateur non trouvé.' });
        }
       
         
        // Créer une nouvelle participation
        const formationparticipants = new Participation({
            formId: formationFound._id,
            titre: formationFound.titre,
            userId: userFound._id,
            username: userFound.username,
            email: userFound.email
        });       await formationparticipants.save();
        
        res.json(formationparticipants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
 const getparticipate = async (req, res) => {
    try {  
        const formId = req.params.formId;

        const formationparticipants = await Participation.find({ formId: formId } );

        res.json(formationparticipants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const cancelParticipation = async (req, res) => {
    try {
        const { id } = req.params;

        // Utilisez findByIdAndDelete pour supprimer la participation en fonction de son ID
        const deletedParticipation = await Participation.findByIdAndDelete(id);

        // Vérifiez si la participation a été trouvée et supprimée
        if (!deletedParticipation) {
            return res.status(404).json({ message: "Participation not found" });
        }

        res.json({ message: "Participation canceled successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = {
    creatformation,
    getAllFormations,
    updateFormation,
    deleteFormation,
    getoneformation,
    participate,
    getparticipate,
    cancelParticipation

};
