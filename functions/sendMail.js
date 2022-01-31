const mailer      = require('nodemailer');

const transportOptions = {
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
}
if(process.env.MAIL_AUTH == 'service')
    transportOptions.service = process.env.MAIL_SERVICE
else
    transportOptions.host = process.env.MAIL_HOST;

const transporter = mailer.createTransport(transportOptions);

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