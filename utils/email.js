const nodemailer = require('nodemailer');

/**
 * 
 * @param {object} options - Insira o destinatario, o subject e a mensagem
 */
const sendEmail = async (options) => {

    // Criando o transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const emailOptions = {
        from: 'Admin@email.com',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // Enviando o email
    await transporter.sendMail(emailOptions);

}

module.exports = sendEmail;