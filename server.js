  const express = require("express");
  const cors = require("cors");
  const dbConfig = require("./app/config/db.config");
  const routebibliotécaire = require('./app/routes/bibliotécaire.router');
   const routeevenement = require('./app/routes/evenement.router');
const routeformation = require('./app/routes/formation.router');
const routerreunion= require('./app/routes/reunion.router');
const routerressource=require('./app/routes/ressourcepedagoghique.router')
  const session = require('express-session');

  const app = express();
  app.use(cors());

  app.use(express.json());


  app.use(express.urlencoded({ extended: true }));
     
  

  
  
  
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to cei application." });
  });
  app.use('/api', routebibliotécaire);
  app.use('/api', routeevenement);
  app.use('/api', routeformation);
  app.use('/api',routerreunion);
  app.use('/api',routerressource)



  app.use(session({
    secret: 'votre_clé_secrète', // Clé secrète pour signer la session
    resave: false,
    saveUninitialized: false
  }));
  app.post('/logout', (req, res) => {
    if (req.session) {
      // Détruire la session de l'utilisateur
      req.session.destroy((err) => {
        if (err) {
          console.error('Erreur lors de la déconnexion :', err);
          res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        } else {
          // Effacer le cookie contenant le token
          res.clearCookie('token');
          // La session est détruite avec succès
          res.status(200).json({ message: 'Déconnexion réussie' });
        }
      });
    } else {
      // Si aucune session n'est disponible, renvoyer une erreur
      res.status(400).json({ error: 'Aucune session à déconnecter' });
    }
  });
  
  

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });


  require('./app/routes/auth.routes')(app);
  require('./app/routes/user.routes')(app);

  const db = require("./app/models");
  const Role = db.role;

  db.mongoose
    .connect(`mongodb://localhost:27017/merncoursedb`)
    .then(() => {
      console.log("Successfully connect to MongoDB.");
      initial();
    })
    .catch(err => {
      console.error("Connection error", err);
      process.exit();
    });






  //   function initial() {
  //     Role.estimatedDocumentCount((err, count) => {
  //       if (!err && count === 0) {
  //         new Role({
  //           name: "etudiant"
  //         }).save(err => {
  //           if (err) {
  //             console.log("error", err);
  //           }
    
  //           console.log("added 'etudiant' to roles collection");
  //         });
    
  //         new Role({
  //           name: "modScolarite"
  //         }).save(err => {
  //           if (err) {
  //             console.log("error", err);
  //           }
    
  //           console.log("added 'scolarite' to roles collection");
  //         });

  //         new Role({
  //             name: "prof"
  //           }).save(err => {
  //             if (err) {
  //               console.log("error", err);
  //             }
      
  //             console.log("added 'prof' to roles collection");
  //           });
    
  //         new Role({
  //           name: "admin"
  //         }).save(err => {
  //           if (err) {
  //             console.log("error", err);
  //           }
    
  //           console.log("added 'admin' to roles collection");
  //         });
  //       }
  //     });
  //   }


    ///roles

  async function initial() {
      try {
          let count = await Role.estimatedDocumentCount();
          if (count === 0) {
              await addRole("etudiant");
              await addRole("modScolarite");
              await addRole("prof");
              await addRole("admin");
          }
      } catch (err) {
          console.error("Initial role setup error: ", err);
      }
  }

  async function addRole(roleName) {
      try {
          const role = new Role({ name: roleName });
          await role.save();
          console.log(`added '${roleName}' to roles collection`);
      } catch (err) {
          console.error(`Error adding role ${roleName}: `, err);
      }
  }
