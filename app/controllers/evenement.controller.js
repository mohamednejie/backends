const evenement = require('../models/evenement.model');
const Joi = require('joi');
const Participation = require('../models/evenement.participation.model');
const File = require('../models/file.model');
const fs = require('fs');
const nodemailer = require('nodemailer');
const mongoose =require('mongoose');
const upload = require('../config/multer')
const User = require('../models/user.model');

const evenementValidationSchema = Joi.object({
    name: Joi.string().required().min(3).max(25),
    date: Joi.date().required().min('now'), // Date should be greater than or equal to current date
    lieu: Joi.string().required(),
    description: Joi.string().required(),
    file: Joi.string().required(),// Supposons que le fichier soit un chemin de fichier pour une mise à jour, vous pouvez ajuster en fonction de vos besoins

    duree: Joi.string()
    .required()
    .pattern(new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z]).+$/)) // At least one digit and one letter in the duration
    .trim()
});

exports.createevenement = async (req, res) => {
    try {
        // Récupérez les données du formulaire
        const { name, date, lieu, description, duree } = req.body;

        // Vérifiez si un fichier a été téléchargé
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier n'a été téléchargé" });
        }
        if (!duree || !/^(?=.*[0-9])(?=.*[a-zA-Z]).+$/.test(duree.trim())) {
            return res.status(400).json({ error: "Format de durée invalide" });
        }
        // Vérifiez si la date est supérieure ou égale à la date actuelle
        const currentDate = new Date();
        if (new Date(date) < currentDate) {
            return res.status(400).json({ error: "La date de l'événement doit être supérieure ou égale à la date actuelle" });
        }

        // Récupérez les informations sur le fichier téléchargé
        const { originalname, path, mimetype } = req.file;

        // Créez une instance de modèle pour le fichier
        const file = new File({
            originalName: originalname,
            path: path,
            mimeType: mimetype
        });

        // Enregistrez d'abord le fichier dans la base de données
        const savedFile = await file.save();

        // Créez une instance de modèle pour l'événement en incluant le chemin du fichier
        const newevenement = new evenement({
            name,
            date,
            lieu,
            description,
            duree,
            fileId: savedFile._id, // Enregistrez l'ID du fichier dans l'événement
            filePath: savedFile.path // Enregistrez le chemin du fichier dans l'événement
        });

        // Enregistrez l'événement dans la base de données
        const savedevenement = await newevenement.save();

        // Envoyez une réponse avec l'événement créé, en incluant le chemin du fichier
        res.json({
            _id: savedevenement._id,
            name: savedevenement.name,
            date: savedevenement.date,
            lieu: savedevenement.lieu,
            description: savedevenement.description,
            duree: savedevenement.duree,
            filePath: savedFile.path // Retournez le chemin du fichier dans la réponse
        });
        sendEmailToAllUsers(savedevenement);

    } catch (err) {
        // En cas d'erreur, renvoyez une réponse avec le message d'erreur
        res.status(500).json({ error: err.message });
    }
};
exports.updateevenement = async (req, res) => {
    try {
        // Récupérer l'ID de l'événement à mettre à jour depuis les paramètres de requête
        const { id } = req.params;

        // Vérifier si l'événement existe dans la base de données
        const existingEvenement = await evenement.findById(id);
        if (!existingEvenement) {
            return res.status(404).json({ error: "L'événement n'existe pas" });
        }

        // Récupérer les données mises à jour de l'événement depuis le corps de la requête
        const { name, date, lieu, description, duree } = req.body;

        // Vérifier si un fichier a été téléchargé
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier n'a été téléchargé" });
        }

        // Valider la durée
        if (!duree || !/^(?=.*[0-9])(?=.*[a-zA-Z]).+$/.test(duree.trim())) {
            return res.status(400).json({ error: "Format de durée invalide" });
        }

        // Vérifier si la date est supérieure ou égale à la date actuelle
        const currentDate = new Date();
        if (new Date(date) < currentDate) {
            return res.status(400).json({ error: "La date de l'événement doit être supérieure ou égale à la date actuelle" });
        }

        // Récupérer les informations sur le fichier téléchargé
        const { originalname, path, mimetype } = req.file;

        // Créer une instance de modèle pour le fichier
        const file = new File({
            originalName: originalname,
            path: path,
            mimeType: mimetype
        });

        // Enregistrer le fichier dans la base de données
        const savedFile = await file.save();

        // Mettre à jour les champs modifiables de l'événement
        existingEvenement.name = name;
        existingEvenement.date = date;
        existingEvenement.lieu = lieu;
        existingEvenement.description = description;
        existingEvenement.duree = duree;
        existingEvenement.fileId = savedFile._id;
        existingEvenement.filePath = savedFile.path;

        // Enregistrer les modifications de l'événement dans la base de données
        await existingEvenement.save();
        sendEmailForupdateEvent(existingEvenement);
        // Retourner l'événement mis à jour
        return res.json(existingEvenement);

    } catch (err) {
        // En cas d'erreur, renvoyer une réponse avec le message d'erreur
        return res.status(500).json({ error: err.message });
    }
};



exports.getAllevenement = async (req, res) => {
    try {
        const evenements = await evenement.find();
        res.json(evenements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneEvenement = async (req, res) => {
    const eventId = req.params.id;
    try {
        const evenements = await evenement.findById(eventId);
        if (!evenements) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        res.json(evenements);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement' });
    }
};




exports.deleteevenement = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await evenement.findByIdAndDelete(id);

        // Envoyer un e-mail à tous les utilisateurs pour informer de la suppression de l'événement
        sendEmailForDeletedEvent(deletedEvent);

        // Envoyer la réponse au client
        res.json({ message: "evenement deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.participate = async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    try {
        const evenementFound = await evenement.findById(eventId);
        if (!evenementFound) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        const userFound = await User.findById(userId);
        if (!userFound) {
            return res.status(400).json({ error: 'Utilisateur non trouvé.' });
        }
       
         
        const participation = new Participation({
            eventId: evenementFound._id,
            name: evenementFound.name,
            userId: userFound._id,
            username: userFound.username,
            email: userFound.email
        });     await participation.save();
        
        res.json(participation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getparticipate = async (req, res) => {
    try {  
        const eventId = req.params.eventId;

        const participations = await Participation.find({ eventId: eventId } );

        res.json(participations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.cancelParticipation = async (req, res) => {
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

const sendEmailForDeletedEvent = async (evenementDetails) => {
    try {
        const users = await User.find();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com',
                pass: 'kgpyponmairtmebs',
            },
        });

        users.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com',
                to: user.email,
                subject: 'Événement supprimé',
                text: `L'événement suivant a été annulé : ${evenementDetails.name}. Date : ${evenementDetails.date}. Lieu : ${evenementDetails.lieu}. Description : ${evenementDetails.description}. Durée : ${evenementDetails.duree}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('Email sent for deleted event');
    } catch (error) {
        console.error('Error sending email for deleted event:', error);
    }
};
const sendEmailForupdateEvent = async (updatedevenement) => {
    try {
        // Récupérer tous les utilisateurs depuis la base de données
        const users = await User.find();

        // Configuration du transporteur d'e-mails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com',
                pass: 'kgpyponmairtmebs',
            },
        });

        // Envoyer un e-mail à chaque utilisateur
        users.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com',
                to: user.email,
                subject: 'Événement modifié',
                text: `L'événement suivant a été modifié : ${updatedevenement.name}. Date : ${updatedevenement.date}. Lieu : ${updatedevenement.lieu}. Description : ${updatedevenement.description}. Durée : ${updatedevenement.duree}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('Email sent for updated event');
    } catch (error) {
        console.error('Error sending email for updated event:', error);
    }
};
const sendEmailToAllUsers = async (evenementDetails) => {
    try {
        // Récupérer tous les utilisateurs depuis la base de données
        const users = await User.find();

        // Configuration du transporteur d'e-mails (à adapter en fonction de votre fournisseur de messagerie)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohamedneji7050@gmail.com',
                pass: 'kgpyponmairtmebs',
            },
        });

        // Envoyer un e-mail à chaque utilisateur
        users.forEach(async (user) => {
            const mailOptions = {
                from: 'mohamedneji7050@gmail.com',
                to: user.email,
                subject: 'Nouvel événement créé',
                text: `Un nouvel événement a été créé : ${evenementDetails.name}. Date : ${evenementDetails.date}. Lieu : ${evenementDetails.lieu}. Description : ${evenementDetails.description}. Durée : ${evenementDetails.duree}.`,
            };

            await transporter.sendMail(mailOptions);
        });

        console.log('Email sent to all users');
    } catch (error) {
        console.error('Error sending email to all users:', error);
    }
};
