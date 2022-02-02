const generateNumbers = require('../functions/generateNumbers');
const pool = require('../database/db-pool');
const sendMail = require('../functions/sendMail');

class Errorxxx extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

const sendConfirmation = (req, res, next) => {
    const email = req.query.email;
    if(!email) return next(new Error('Invalid email'));

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
                    type: 'email_confirmation',
                    user_id
                }
                connection.query(`
                    INSERT INTO otps SET ?
                    `, otp, (err, result) => {
                    if(err) {
                        console.log(err);
                        return (next(new Error('Something went wrong')));
                    }
                    const body = `Your email confirmation token is ${token}
                    Proceed to the application to verify your email address.`;
                    const subject = 'Email confirmation';
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

const compareToken = async (req, res, next) => {
    const token = req.body.token;
    const email = req.body.email;
    if(!token) return next(new Errorxxx('Invalid token', 400));
    if(!email) return next(new Errorxxx('Invalid email', 400));
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
                        UPDATE users
                        SET ?
                        WHERE id = ?
                        AND email = ?
                    `, [ { email_verified: true}, userId, email ], (err, users, fields) => {
                        if( err ) {
                            console.log(err);
                            return next(new Error('Something went wrong'));
                        }
                        return res.json({
                            message: 'Email verified',
                            status: 200,
                            data: {
                                email: email,
                            }
                        });
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
    sendConfirmation,
    compareToken
}