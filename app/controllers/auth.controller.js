const config = require("../config/auth.config");
const db = require("../models");
const qr = require('qrcode');
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

  exports.signup = (req, res) => {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    });
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).send({ message: "Username, email, and password are required!" });
    }
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(req.body.email)) {
      return res.status(400).send({ message: "Invalid email format!" });
    }  
    user.save()
      .then(async (savedUser) => {
        if (req.body.roles) {
          const roles = await Role.find({ name: { $in: req.body.roles } });
          savedUser.roles = roles.map(role => role._id);
        } else {
          const role = await Role.findOne({ name: "user" });
          savedUser.roles = [role._id];
        }
        // Génération du QR code pour l'utilisateur
        const qrCode = await genererQRCode(savedUser._id.toString());
        savedUser.qrCode = qrCode;
        await savedUser.save();
        res.send({ message: "User was registered successfully! " });
      })
      .catch(err => {
        res.status(500).send({ message: err });
      });
  };
exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .populate("roles", "-__v")
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      if ( !req.body.email || !req.body.password) {
        return res.status(400).send({ message: " email, and password are required!" });
      }
      

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: err });
    });

};
const genererQRCode = async (data) => {
  try {
    const qrCode = await qr.toDataURL(data);
    return qrCode;
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw error;
  }
};

