const nodemailer = require("nodemailer");

const { GMAIL_PASSWORD } = process.env;

const sendEmail = (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sebastianmars78@gmail.com",
      pass: GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "sebastianmars78@gmail.com",
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = {
  sendEmail,
};
