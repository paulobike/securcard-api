const pool = require('./db-pool');

module.exports = () => {
    pool.getConnection(function(err, connection) {
        if(err) throw err;
        
        connection.query(`
            CREATE TABLE IF NOT EXISTS users(
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                password VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(255),
                email_verified Boolean DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(id)
            )`, (err, result) => {
            if(err) console.log(err);
            else console.log('Users table created');
        });

        connection.query(`
            CREATE TABLE IF NOT EXISTS cards(
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(255),
                front VARCHAR(255),
                back VARCHAR(255),
                user_id INT NOT NULL,
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(id),
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`, (err, result) => {
            if(err) console.log(err);
            else console.log('Cards table created');
        });

        connection.query(`
            CREATE TABLE IF NOT EXISTS otps(
                id INT NOT NULL AUTO_INCREMENT,
                type VARCHAR(255),
                code VARCHAR(10),
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(id),
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`, (err, result) => {
            if(err) console.log(err);
            else console.log('Otps table created');
        });

        connection.release();
    });
}