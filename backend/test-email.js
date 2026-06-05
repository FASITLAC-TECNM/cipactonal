import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function main() {
    try {
        console.log('Intentando verificar la conexión SMTP...');
        await transporter.verify();
        console.log('Conexión SMTP exitosa');
    } catch (err) {
        console.error('Error de conexión SMTP:', err);
    }
}

main();
