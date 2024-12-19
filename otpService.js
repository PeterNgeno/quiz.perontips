const nodemailer = require('nodemailer');

async function sendOTP(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Your email
            pass: process.env.EMAIL_PASSWORD, // Your email password
        },
    });

    const mailOptions = {
        from: 'Peron Tips Limited <your_email@gmail.com>',
        to: email,
        subject: 'Your OTP for Peron Tips Limited',
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendOTP;