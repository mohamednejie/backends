const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3, maxlength: 25 },
  email: { type: String, required: true }, // Ajout de la validation pour l'e-mail
  password: { type: String, required: true },
  roles:   [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
  qrCode: String,
});

// Ajout de la validation pour l'e-mail
UserSchema.path('email').validate((email) => {
  // Utilisez une expression régulière ou toute autre méthode de validation pour vérifier l'e-mail
  return /\S+@\S+\.\S+/.test(email);
}, 'Email address is not valid');

const User = mongoose.model("User", UserSchema);

module.exports = User;
