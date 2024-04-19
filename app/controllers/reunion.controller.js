
const reunion = require('../models/reunion.model');
const User = require('../models/user.model'); 
const Reunion = require('../models/reunion.model');
const Participation=require('../models/reunion.part.model');
const nodemailer = require('nodemailer');
const Role = require('../models/role.model');
const Joi=require('joi')

const  reunionValidationSchema=Joi.object({
    titre: Joi.string().required().min(3).max(25),
    description: Joi.string().required(),
    date_debut: Joi.date().required(),
    date_fin: Joi.date().required(),
    lieu: Joi.string().required(),

});



const createreunion = async (req, res) => {
    try {
        // Validation des données de réunion
        const { error } = reunionValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { titre, description, date_debut, date_fin, lieu } = req.body;

        // Vérification si la date de début est antérieure à la date de fin
        if (new Date(date_debut) >= new Date(date_fin)) {
            return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin" });
        }

        // Vérification si la date de début et la date de fin sont supérieures ou égales à la date actuelle
        const currentDate = new Date();
        if (new Date(date_debut) <= currentDate || new Date(date_fin) <= currentDate) {
            return res.status(400).json({ error: "Les dates doivent être postérieures à la date actuelle" });
        }

        // Création de la réunion
        const newReunion = await Reunion.create({ titre, description, date_debut, date_fin, lieu });

        // Envoi d'e-mails aux utilisateurs ayant le rôle "prof"
        sendEmailForCreatedMeeting(newReunion);

        // Réponse avec la nouvelle réunion
        res.status(201).json(newReunion);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la création de la réunion' });
    }
};



const getallreunion = async (req, res) => {
    try {
        const reunions = await reunion.find();
        res.json(reunions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getonereunion = async (req, res) => {
    const reunionId = req.params.id; 
    try {
        const reunions = await reunion.findById(reunionId); 
        if (!reunions) {
            return res.status(404).json({ message: 'reunion non trouvé' });
        }
        res.json(reunions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur lors de la récupération de la reunions' });
    }
};
const updatereunion = async (req, res) => {
    try {
        // Récupérer l'ID de la réunion à mettre à jour depuis les paramètres de requête
        const { id } = req.params;

        // Vérifier si la réunion existe dans la base de données
        const existingReunion = await Reunion.findById(id);
        if (!existingReunion) {
            return res.status(404).json({ error: "La réunion n'existe pas" });
        }

        // Valider les données de la réunion à mettre à jour
        const { titre, description, date_debut, date_fin, lieu } = req.body;

        // Valider le titre
        if (!titre || titre.trim() === '') {
            return res.status(400).json({ error: "Le titre de la réunion est requis" });
        }

        // Valider la description
        if (!description || description.trim() === '') {
            return res.status(400).json({ error: "La description de la réunion est requise" });
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

        // Mettre à jour les champs modifiables de la réunion
        existingReunion.titre = titre;
        existingReunion.description = description;
        existingReunion.date_debut = startDate;
        existingReunion.date_fin = endDate;
        existingReunion.lieu = lieu;

        // Enregistrer les modifications de la réunion dans la base de données
        await existingReunion.save();

        // Envoyer un email pour notifier la mise à jour de la réunion
        await sendEmailForUpdatedMeeting(existingReunion);

        // Retourner la réunion mise à jour
        return res.json(existingReunion);

    } catch (err) {
        // En cas d'erreur, renvoyer une réponse avec le message d'erreur
        return res.status(500).json({ error: err.message });
    }
};


const sendEmailForUpdatedMeeting = async (meetingDetails) => {
    try {
        // Récupérer l'ObjectId du rôle "prof" depuis la base de données
        const roleProf = await Role.findOne({ name: 'prof' });

        // Récupérer tous les utilisateurs ayant le rôle "prof" en utilisant l'ObjectId du rôle
        const profUsers = await User.find({ roles: roleProf._id });

        // Configuration du transporteur d'e-mails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com',
                pass: 'kgpyponmairtmebs',
            },
        });

        // Envoyer un e-mail à chaque utilisateur ayant le rôle "prof"
        profUsers.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com',
                to: user.email,
                subject: 'Réunion Modifiée',
                text: `La réunion suivante a été modifiée : ${meetingDetails.titre}. Date début : ${meetingDetails.date_debut}. Date fin : ${meetingDetails.date_fin}. Lieu : ${meetingDetails.lieu}. Description : ${meetingDetails.description}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('E-mail envoyé à tous les utilisateurs ayant le rôle "prof" pour informer de la modification de la réunion');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail aux utilisateurs ayant le rôle "prof" pour informer de la modification de la réunion :', error);
    }
};

const sendEmailForCreatedMeeting = async (meetingDetails) => {
    try {
        // Récupérer l'ObjectId du rôle "prof" depuis la base de données
        const roleProf = await Role.findOne({ name: 'prof' });

        // Récupérer tous les utilisateurs ayant le rôle "prof" en utilisant l'ObjectId du rôle
        const profUsers = await User.find({ roles: roleProf._id });

        // Configuration du transporteur d'e-mails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com',
                pass: 'kgpyponmairtmebs',
            },
        });

        // Envoyer un e-mail à chaque utilisateur ayant le rôle "prof"
        profUsers.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com',
                to: user.email,
                subject: 'Nouvelle Réunion',
                text: `Une nouvelle réunion a été créée : ${meetingDetails.titre}. Date début : ${meetingDetails.date_debut}. Date fin : ${meetingDetails.date_fin}. Lieu : ${meetingDetails.lieu}. Description : ${meetingDetails.description}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('E-mail envoyé à tous les utilisateurs ayant le rôle "prof"');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail aux utilisateurs ayant le rôle "prof" :', error);
    }
};
const deletereunion = async (req, res) => {
    try {
        // Suppression de la réunion
        const deletedReunion = await Reunion.findByIdAndDelete(req.params.id);

        // Envoi d'e-mails aux utilisateurs ayant le rôle "prof" pour informer de l'annulation de la réunion
        sendEmailForDeletedMeeting(deletedReunion);

        // Réponse avec un message de succès
        res.json({ message: 'Réunion supprimée avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const sendEmailForDeletedMeeting = async (meetingDetails) => {
    try {
        // Récupérer l'ObjectId du rôle "prof" depuis la base de données
        const roleProf = await Role.findOne({ name: 'prof' });

        // Récupérer tous les utilisateurs ayant le rôle "prof" en utilisant l'ObjectId du rôle
        const profUsers = await User.find({ roles: roleProf._id });

        // Configuration du transporteur d'e-mails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com',
                pass: 'kgpyponmairtmebs',
            },
        });

        // Envoyer un e-mail à chaque utilisateur ayant le rôle "prof"
        profUsers.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com',
                to: user.email,
                subject: 'Réunion Annulée',
                text: `La réunion suivante a été annulée : ${meetingDetails.titre}. Date début : ${meetingDetails.date_debut}. Date fin : ${meetingDetails.date_fin}. Lieu : ${meetingDetails.lieu}. Description : ${meetingDetails.description}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('E-mail envoyé à tous les utilisateurs ayant le rôle "prof" pour informer de l\'annulation de la réunion');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail aux utilisateurs ayant le rôle "prof" pour informer de l\'annulation de la réunion :', error);
    }
};
const participate = async (req, res) => {
    const reunId = req.params.reunId;
    const userId = req.params.userId;
    try {
        // Vérifier si la réunion existe
        const reunionFound = await Reunion.findById(reunId);
        if (!reunionFound) {
            return res.status(404).json({ message: 'Réunion non trouvée' });
        }

        // Vérifier si l'utilisateur existe
        const userFound = await User.findById(userId);
        if (!userFound) {
            return res.status(400).json({ error: 'Utilisateur non trouvé.' });
        }
       
        // Créer une nouvelle participation
        const reunionparticipants = new Participation({
            reunId: reunionFound._id,
            titre: reunionFound.titre,
            userId: userFound._id,
            username: userFound.username,
            email: userFound.email
        });
        await reunionparticipants.save();
        
        res.json(reunionparticipants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const getparticipate = async (req, res) => {
    try {  
        const reunId = req.params.reunId;

        const reunionparticipants = await Participation.find({ reunId: reunId } );

        res.json(reunionparticipants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const cancelParticipation = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedParticipation = await Participation.findByIdAndDelete(id);

        if (!deletedParticipation) {
            return res.status(404).json({ message: "Participation not found" });
        }

        res.json({ message: "Participation canceled successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createreunion,
    getallreunion,
    updatereunion,
    deletereunion,
    getonereunion,
    participate,
    getparticipate,
    cancelParticipation
};
