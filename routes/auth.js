const express = require("express");
const authController = require("../controllers/auth.js");

const router = express.Router();

router.post('/studentregister', authController.register);

router.post('/studentlogin', authController.login);
router.get('/logout', authController.logout);

module.exports = router;