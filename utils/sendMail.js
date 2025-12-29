const nodeMailer = require('nodemailer');


const transporter = nodeMailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.MAIL_USER,
        pass : process.env.MAIL_PASS
    }
})

const sendMail = async ({to , subject , html})=>{
    return transporter.sendMail({
        from : `"Farmerkaka" < ${process.env.EMAIL_USER}>` ,
        to,
        subject,
        html
    });

};

module.exports = sendMail;