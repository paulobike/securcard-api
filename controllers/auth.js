const pool = require('../database/db-pool');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const emailValidator = require('../functions/emailValidator');

const login = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    if(!email || !password) return next(new Error('Fields cannot be empty'));
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
            if(!user) return next(new Error('Invalid credentials'));
            let passwordMatch = bcrypt.compareSync(password, user.password);
            if(passwordMatch) {
                // create hash
                const metadata = {
                    id: user.id,
                    email: user.email
                }
                const token = jwt.sign(metadata, process.env.JWT_SECRET, {expiresIn: '1d'});
                res.json({
                    data: {
                        auth_token: token,
                        username: user.username
                    },
                    message: user['email_verified'] == true ? 'Success' : 'Verify email address',
                    code: user['email_verified'] == true ? 200 : 300
                });                       
            } else {
                next(new Error('Invalid credentials'));
            }     
        });
        connection.release();
    });
}

const signUp = async (req, res, next) => {
    let { email, name, password } = req.body;
    if(!password) return next(new Error('Password cannot be empty'));
    if(!email || !emailValidator(email)) return next(new Error('Invalid email'));
    email = email.trim().toLowerCase();
    password = password.trim();

    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            next(new Error('Something went wrong'));
        }
        connection.query(`
            SELECT count(id) AS count FROM users
            WHERE email = ?
        `, [ email ], (err, userCount, fields) => {
            if( err ) {
                console.log(err);
                next(new Error('Something went wrong'));
            }
            let count = userCount[0].count;
            if(count > 0) return(next(new Error('Email is already in use')));
            password = bcrypt.hashSync(password, 10);
            let user = { email, name, password, registered_at: new Date() }
            connection.query(`
                INSERT INTO users SET ?
                `, user, (err, result) => {
                if(err) {
                    console.log(err);
                    return (next(new Error('Something went wrong')));
                }
                res.json({
                    message: 'User registered successfully',
                    status: 200,
                    data: result
                });
            });
        });           
        connection.release();
    });
}

module.exports.login = login;
module.exports.signUp = signUp;