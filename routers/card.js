const path = require('path');
const express = require('express');
const router  = express.Router();
const { getCard, createCard, getCards, getCardImage, deleteCard } = require('../controllers/card');
const middleware = require('../middleware');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/cards/' + file.fieldname));
    },
    filename: (req, file, cb) => {
        let filename = 'user-' + req.user.id + '-' + Date.now() + '.' + file.mimetype.split('/')[1];
        cb(null, filename);
    }
});
const upload = multer({storage});
let uploadMiddleware = upload.fields([
    {name: 'front', maxCount: 1},
    {name: 'back', maxCount: 1}
]);

router.get('/', middleware.isLoggedIn, (req, res, next) => {
    getCards(req, res, next);
});

router.get('/:id', middleware.isLoggedIn, (req, res, next) => {
    getCard(req, res, next);
});

router.delete('/:id', middleware.isLoggedIn, (req, res, next) => {
    deleteCard(req, res, next);
});

router.get('/:id/front', middleware.isLoggedIn, (req, res, next) => {
    getCardImage(req, res, next, 'front');
});

router.get('/:id/back', middleware.isLoggedIn, (req, res, next) => {
    getCardImage(req, res, next, 'back');
});

router.post('/', middleware.isLoggedIn, uploadMiddleware, (req, res, next) => {
    console.log('file', req.files)
    console.log('body', req.body)
    createCard(req, res, next);
});

module.exports = router;