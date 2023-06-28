const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

    }

    async sendMail(to, subject, htmlContent) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent,
        };
        try {
            const send = await this.transporter.sendMail(mailOptions);
            console.log(send);
            if (send) return send;
        } catch (error) {
            console.error(error);
            throw error;  // throw the error instead of returning
        }
    }

    createHtmlContent(title, body) {
        return `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; border-radius: 15px; overflow: hidden; background-color: #ffffff; font-family: Arial, sans-serif; color: black;">
            <thead>
                <tr>
                    <th style="text-align: center; padding: 20px; background-color: #2A8983; color: white;">
                        <a href="https://www.yuniq.fr"><img src="https://res.cloudinary.com/dehidcnt9/image/upload/v1687910399/logo_yuniq_vcm7ns.png" alt="Logo" style="height: 60px; width: 60px; border-radius: 50%;"></a>
                        <h2>${title}</h2>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 20px; text-align: justify;">
                        <img src="https://res.cloudinary.com/dehidcnt9/image/upload/v1687911764/Yuniq_unique_sneaker_vous_I_m_sorry_I_m_not_quite_sure_what_you_re_asking_for._Could_you_please_provide_more_context_or_clarify_your_request_e0p97r.gif" alt="Some description" style="width: 100%; height: auto;">
                        <p>${body}</p>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td style="text-align: center; padding: 20px;">
                        <small>Cet e-mail a été généré automatiquement, veuillez ne pas y répondre.</small>
                    </td>
                </tr>
            </tfoot>
        </table>`;
    }

    contactHtmlEmail(name, email, message) {
        return `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; border-radius: 15px; overflow: hidden; background-color: #000000; font-family: Arial, sans-serif; color: white;">
            <thead>
                <tr>
                    <th style="text-align: center; padding: 20px; background-color: #2A8983;">
                        <a href="https://www.yuniq.fr"><img src="https://res.cloudinary.com/dehidcnt9/image/upload/v1687910399/logo_yuniq_vcm7ns.png" alt="Logo Icon" style="width: 60px; height: 60px; border-radius: 50%;"></a>
                        <h2 style="margin: 20px 0;">Contact de ${name}</h2>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 20px; text-align: justify;">
                        <p><b>Email: </b>${email}</p>
                        <p><b>Message: </b>${message}</p>
                        <img src="https://res.cloudinary.com/dehidcnt9/image/upload/v1687911764/Yuniq_unique_sneaker_vous_I_m_sorry_I_m_not_quite_sure_what_you_re_asking_for._Could_you_please_provide_more_context_or_clarify_your_request_e0p97r.gif" alt="Contact GIF" style="width: 100%; height: auto;">
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td style="text-align: center; padding: 20px; background-color: #2A8983; color: white;">
                        <small>Cet e-mail a été généré automatiquement, veuillez ne pas y répondre.</small>
                    </td>
                </tr>
            </tfoot>
        </table>`;
    }
}

module.exports = new MailService();
