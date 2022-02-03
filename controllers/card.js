const path = require('path');
const pool = require('../database/db-pool');
const fs = require('fs');
class Errorxxx extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

const getCard = (req, res, next) => {
    let id = req.params.id;
    let userId = req.user.id;

    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            return next(new Error('Something went wrong'));
        }
        connection.query(`
            SELECT * FROM cards
            WHERE id = ?
        `, [ id ], (err, cards, fields) => {
            if( err ) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }
            let card = cards[0];
            if(card['user_id'] != userId) return next(new Error('Card not found'));

            res.json({
                message: 'success',
                status: 200,
                data: card
            });
        });
        connection.release();
    });
}

const getCards = (req, res, next) => {
    let userId = req.user.id;

    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            return next(new Error('Something went wrong'));
        }
        connection.query(`
            SELECT * FROM cards
            WHERE user_id = ?
        `, [ userId ], (err, cards, fields) => {
            if( err ) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }
            res.json({
                message: 'success',
                status: 200,
                data: cards
            });
        });
        connection.release();
    });
}

const createCard = (req, res, next) => {
    let frontFile = req.files.front;
    let backFile = req.files.back;

    if(
        !frontFile || !backFile || !frontFile[0] || !backFile[0] ||
        frontFile[0].mimetype.indexOf('image') > -1 || backFile[0].mimetype.indexOf('image') > -1
    ) {
        let userId = req.user.id;
        let { name } = req.body;
        if(!name) {
            if(frontFile && frontFile[0]) fs.rmSync(frontFile[0].path);
            if(backFile && backFile[0]) fs.rmSync(backFile[0].path);
            return next(new Errorxxx('Invalid name', 400));
        }
        let card = {
            name,
            front: '/cards/front/' + frontFile[0].filename,
            back: '/cards/back/' + backFile[0].filename,
            user_id: userId
        };
        pool.getConnection((err, connection) => {
            if( err ) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }            
            connection.query(`
                INSERT INTO cards SET ?
                `, card, (err, result) => {
                if(err) {
                    console.log(err);
                    return next(new Error('Something went wrong'));
                }
                res.json({
                    status: 200,
                    message: 'Card uploaded',
                    data: result
                });
            });
                       
            connection.release();
        }); 
    } else {
        if(frontFile && frontFile[0]) fs.rmSync(frontFile[0].path);
        if(backFile && backFile[0]) fs.rmSync(backFile[0].path);
        next( new Errorxxx('Only image file types are supported', 400));
    }
}

const getCardImage = (req, res, next, side) => {
    let id = req.params.id;
    let userId = req.user.id;

    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            return next(new Error('Something went wrong'));
        }
        connection.query(`
            SELECT * FROM cards
            WHERE id = ?
        `, [ id ], (err, cards, fields) => {
            if( err ) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }
            let card = cards[0];
            if(card['user_id'] != userId) return next(new Error('Card not found'));

            res.sendFile(path.join(__dirname, '../uploads', card[side]), error => {
                if(error) {
                    console.log(error);
                    next(new Error('Something went wrong'));
                }                
            });
        });
        connection.release();
    });
}

module.exports = { getCard, createCard, getCards, getCardImage }