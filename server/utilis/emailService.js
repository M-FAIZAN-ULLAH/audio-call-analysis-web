// utilities/emailService.js
const nodemailer = require("nodemailer");

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mfaizanullah336@gmail.com",
    pass: "poco hdyc ggmt uazw",
  },
});

async function sendAccountUpdateEmail(receiverEmail, title, password) {
  const mailOptions = {
    from: "mfaizanullah336@gmail.com",
    to: receiverEmail,
    subject: "ACAS Account Update",
    html: `
            <h1>Welcome!</h1>
            <p>Your account has been updated.</p>
            <div style="border: 1px solid #ccc; padding: 20px;">
                <h2>${title}</h2>
                <p>Password: ${password}</p>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

module.exports = { sendAccountUpdateEmail };
