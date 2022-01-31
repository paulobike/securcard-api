const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profile');
const { isLoggedIn } = require('../middleware');
const router = express.Router();

router.get('/', isLoggedIn, (req, res, next) => {
    getProfile(req, res, next);
});

router.put('/', isLoggedIn, (req, res, next) => {
    updateProfile(req, res, next);
});

module.exports = router;
