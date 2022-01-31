const express = require('express');
const router = express.Router();
const { 
    login: loginController, 
    signUp: signUpController
} = require('../controllers/auth');
const {
    compareToken,
    sendConfirmation
} = require('../controllers/emailVerification');
const { 
    forgotPassword,
    verifyToken,
    resetPassword
} = require('../controllers/passwordReset');

router.post('/login', (req, res, next) => {
    loginController(req, res, next);
});

router.post('/signup', (req, res, next) => {
    signUpController(req, res, next);
});

router.get('/confirmation', (req, res, next) => {
    sendConfirmation(req, res, next);
});

router.post('/confirmation', async (req, res, next) => {
    compareToken(req, res, next);
});

router.post('/forgot-password', (req, res, next) => {
    forgotPassword(req, res, next);
});

router.get('/verify-token', (req, res, next) => {
    verifyToken(req, res, next);
});

router.post('/reset-password', (req, res, next) => {
    resetPassword(req, res, next);
});

module.exports = router;
