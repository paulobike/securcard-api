const pool = require('../database/db-pool');

const updateProfile = (req, res, next) => {
    let userId = req.user.id;
    let { phone, name, password } = req.body;
    email = email.trim().toLowerCase();
    let user = { }
    if(phone) user.phone = phone;
    if(name) user.name = name;
    if(password) {
        password = password.trim();
        password = bcrypt.hashSync(password, 10);
        user.password = password;
    }
    pool.getConnection((err, connection) => {
        if( err ) {
            console.log(err);
            return next(new Error('Something went wrong'));
        }
        connection.query(`
            UPDATE users
            SET ?
            WHERE id = ?
            `, [user, userId], (err, result) => {
            if(err) {
                console.log(err);
                return next(new Error('Something went wrong'));
            }
            if(result.changedRows === 0) {
                return next(new Error('No changes were made'));
            }
            res.json({
                status: 200,
                message: 'Successful',
                data: user
            });
        });

        connection.release();
    });
}

const getProfile = (req, res, next) => {
    let userId = req.user.id;
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
            if(user) {
                res.json({
                    status: 200,
                    message: 'Successful',
                    data: user
                });          
            } else {
                next(new Error('Invalid user'));
            }
            
        });
        connection.release();
    });
}

module.exports = { updateProfile, getProfile };