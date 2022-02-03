const bcrypt = require('bcrypt');
const pool = require('../database/db-pool');
const emailValidator = require('../functions/emailValidator');
const sendMail = require('../functions/sendMail');
const generateNumbers = require('../functions/generateNumbers');

const forgotPassword = (req, res, next) => {
    const email = req.body.email;
    if(!email || !emailValidator(email)) return next(new Error('Invalid email'));

    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            return next(new Error('Something went wrong'));
        }
        connection.query(`
            SELECT * FROM users
            WHERE email = ?
        `, [ email.trim().toLowerCase() ], (err, users, fields) => {
            if( err ) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }
            let user = users[0];
            if(user) {
                let user_id = user.id;
                
                const token = generateNumbers(6);
                let otp = {
                    code: token,
                    type: 'password_reset',
                    user_id
                }
                connection.query(`
                    INSERT INTO otps SET ?
                    `, otp, (err, result) => {
                    if(err) {
                        console.log(err);
                        return (next(new Error('Something went wrong')));
                    }
                    const body = `Your password reset token is ${token}
                    Do not share this token with anyone.
                    Please ignore if you did not make this request.`;
                    const subject = 'Password reset';
                    try {
                        sendMail({
                            from: `Support <no_reply@${process.env.DOMAIN}>`,
                            to: email,
                            subject,
                            text: body
                        });
                    } catch(e) {
                        console.log(e);
                    }
                    console.log(token)            
                    res.json({
                        data: null,
                        status: 200,
                        message: 'An email has been sent to '+ email
                    });
                });                                       
                             
            } else {
                next(new Error('Email doesn\'t match any account'));
            }   
        });
        connection.release();
    });
}

const verifyToken = (req, res, next) => {
    const token = req.query.token;
    const email = req.query.email;
    if(!token) next(new Error('Invalid token'));
    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            return next(new Error('Something went wrong'));
        }
        connection.query(`
            SELECT * FROM otps
            WHERE code = ?
        `, [ token ], (err, otps, fields) => {
            if( err ) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }
            let otp = otps[0];
            if(otp) {
                let userId = otp['user_id']
                pool.getConnection((err, connection) => {
                    if( err ) {
                        console.log(err);
                        return next(new Error('Something went wrong'));
                    }
                    connection.query(`
                        SELECT * FROM users
                        WHERE id = ?
                    `, [ userId ], (err, users, fields) => {
                        if( err ) {
                            console.log(err);
                            return next(new Error('Something went wrong'));
                        }
                        let user = users[0];
                        if(user && user.email == email.trim().toLowerCase()) {
                            return res.json({
                                message: 'success',
                                status: 200,
                                data: {
                                    email: user.email,
                                    name: user.name
                                }
                            });
                        }
                        next(new Error('Invalid token'));
                    });
                    connection.release();
                });
            } else {
                next(new Error('Invalid token'));
            }
        });
    });
}

const resetPassword = (req, res, next) => {
    let token = req.body.token;
    const email = req.query.email;
    let password = req.body.password;
    if(!token) next(new Error('Invalid token'));
    if(!password) next(new Error('Password cannot be empty'));

    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            return next(new Error('Something went wrong'));
        }
        connection.query(`
            SELECT * FROM otps
            WHERE code = ?
        `, [ token ], (err, otps, fields) => {
            if( err ) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }
            let otp = otps[0];
            if(otp) {
                pool.getConnection((err, connection) => {
                    if( err ) {
                        console.log(err);
                        return next(new Error('Something went wrong'));
                    }
                    password = bcrypt.hashSync(password, 10);
                    connection.query(`
                        UPDATE users
                        SET ?
                        WHERE id = ?
                        AND email = ?
                    `, [ { password }, otp['user_id'], email.trim().toLowerCase() ], (err, users, fields) => {
                        if( err ) {
                            console.log(err);
                            return next(new Error('Something went wrong'));
                        }
                        let user = users[0];
                        if(user) {
                            return res.json({
                                message: 'success',
                                status: 200,
                                data: {
                                    email: user.email,
                                    name: user.name
                                }
                            });
                        }
                        next(new Error('Invalid token'));
                    });
                    connection.release();
                });
            } else {
                next(new Error('Invalid token'));
            }
        });
    });
}

module.exports = {
    forgotPassword,
    verifyToken,
    resetPassword
}