const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
router.get('/',authController.isLoggedIn, (req, res) => {
    console.log("object")
    res.sendFile("home.html", { root: './public/' })
});
router.get('/studentregister', (req, res) => {
    res.sendFile("studentregister.html", { root: './public/' })
});
router.get('/studentlogin', (req, res) => {
    res.sendFile("studentlogin.html", { root: './public/' })
});
router.get('/profile', authController.isLoggedIn, (req, res) => {
    console.log("Reached")
    console.log(req.user)
    if (req.user) {
        res.sendFile("profile.html", { root: './public/' })
    } else {
        res.sendFile("login.html", { root: './public/' });
    }
})
module.exports = router;