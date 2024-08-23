const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


const sendOTP = (email, otp, otpExpires) => {
    const expiryDate = otpExpires;
    // console.log(expiryDate);
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire on.${otpExpires}`
    };

    return transporter.sendMail(mailOptions);
};


module.exports = {sendOTP};