const pool = require('../database/db-pool');
const middleware = {};
const jwt = require('jsonwebtoken');

middleware.isLoggedIn = (req, res, next) => {
    const loginErr = new Error('You need to be logged in');
    loginErr.status = 401;
    const token = req.get('Authorization');
    if(!token) return next(loginErr);
    const metadata = jwt.verify(token, process.env.JWT_SECRET);
    const userId = metadata.id;
    const email = metadata.email;
    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            return next(new Error('Something went wrong'));
        }
        connection.query(`
            SELECT * FROM users
            WHERE id = ?
            AND email = ?
        `, [ userId, email ], (err, users, fields) => {
            if( err ) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }
            let user = users[0];
            if(user) {
                if (user['email_verified'] == true) {
                    let error = new Error('Verify email address');
                    error.status = 300;
                    next(error);
                }
                req.user = user;
                next();
            } else next(loginErr);
        });
        connection.release();
    });
};

module.exports = middleware;