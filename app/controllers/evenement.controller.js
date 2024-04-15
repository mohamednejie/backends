const evenement = require('../models/evenement.model');
const Joi = require('joi');
const Participation = require('../models/evenement.participation.model');
const File = require('../models/file.model'); // Importez le modèle de fichier
const fs = require('fs');
const nodemailer = require('nodemailer');


const User = require('../models/user.model');

// Schéma de validation avec Joi
const evenementValidationSchema = Joi.object({
    name: Joi.string().required().min(3).max(25),
    date: Joi.date().required(),
    lieu: Joi.string().required(),
    description: Joi.string().required(),
    duree: Joi.string().trim().required(),
  });
  
  

exports.createevenement = async (req, res) => {
    try {
        const { name, date, lieu, description, duree } = req.body;

        let fileId = null;
        if (req.file) {
            // Appeler la fonction pour sauvegarder le fichier dans la base de données et sur le disque
            const savedFile = await saveFileToDatabase(req.file.originalname, req.file.path, req.file.mimetype);
            fileId = savedFile._id;
        }

        const newevenement = new evenement({ name, date, lieu, description, duree, fileId });
        const savedevenement = await newevenement.save();

        // Envoyer un e-mail à tous les utilisateurs après la création de l'événement
        const evenementDetails = { name, date, lieu, description, duree };
        sendEmailToAllUsers(evenementDetails);

        res.json(savedevenement);
    } catch (err) {
        res.status(500).json({ error: err.message });
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

exports.updateevenement = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, lieu, description, duree, file } = req.body;
        const updatedevenement = await evenement.findByIdAndUpdate(id, { name, date, lieu, description, duree, file }, { new: true });
        
        // Envoyer un e-mail à tous les utilisateurs pour informer de la modification de l'événement
        sendEmailForupdateEvent(updatedevenement);

        res.json(updatedevenement);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        });        await participation.save();
        
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
const saveFileToDatabase = async (filename, path, contentType) => {
    try {
        // Enregistrer le fichier sur le disque
        const destinationPath = 'C:\\Users\\lenovo\\OneDrive\\Bureau\\backend\\uploads\\' + filename;
        fs.writeFileSync(destinationPath, fs.readFileSync(path));

        // Enregistrer les informations du fichier dans la base de données
        const newFile = new File({
            filename: filename,
            path: path,
            contentType: contentType
        });
        const savedFile = await newFile.save();
        console.log('File saved to database:', savedFile);
        return savedFile; 
    } catch (error) {
        console.error('Error saving file to database:', error);
        throw error;
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
