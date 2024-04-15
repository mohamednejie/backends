const express = require("express");
const router = express.Router();
const UserModel = require("../controller/index.authentification.controller");
const UserController=require('../controller/authentification.controller')



router.post("/signup", UserModel.adduser);
router.post("/login", UserModel.login);
router.get("/verify/:code", UserModel.verifyEmail);
router.get("/check-role", UserModel.authenticateTokenAndRole);
router.put('/updateprofil',UserController.updateprofil);
router.delete('/deleteprofil',UserController.deleteprofil);

module.exports = router;
