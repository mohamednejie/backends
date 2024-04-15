
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
const createreunion = async (req, res) => {
    try {
        // Validation des données de réunion
        const { error } = reunionValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { titre, description, date_debut, date_fin, lieu } = req.body;

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
        const updatedReunion = await Reunion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Envoyer un e-mail aux utilisateurs ayant le rôle "prof" pour informer de la modification de la réunion
        sendEmailForUpdatedMeeting(updatedReunion);

        res.json(updatedReunion);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
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
