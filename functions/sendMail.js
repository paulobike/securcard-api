const mailer      = require('nodemailer');

const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendMail = (mail) => {
    return new Promise((resolve,reject)=>{
        transporter.sendMail(mail, function(error, response){
            if(error){
                console.log(error);
                reject(error);
            }else{
                console.log("Message sent: " + JSON.stringify(response));
                resolve(response);
            }

            transporter.close();
        });
    });
}

module.exports = sendMail;