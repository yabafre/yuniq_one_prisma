const crypto = require("crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const MailService = require("../../service/MailService");
const JWT = require("jsonwebtoken");
const UserService = require("../../service/UserService");
const DateTime = require("luxon").DateTime;
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()



module.exports = {
    // récupération des champs du nouvel utilisateur
    async userAuth(req, res, next) {
        try {
            const { firstname, lastname, email, phone, location, city, zip } = req.body;
            let { avatar } = req.body;

            let { password } = req.body;
            console.log(req.file)
            if (req.file) {
                avatar = await UserService.uploadImage(req.file);
            }

            // vérification des champs
            const firstnameError = !firstname ? "firstname," : "";
            const lastnameError = !lastname ? "lastname," : "";
            const emailError = !email ? "email," : "";
            const passwordError = !password ? "password," : "";
            const phoneError = !phone ? "phone," : "";
            const locationError = !location ? "location," : "";
            const cityError = !city ? "city," : "";
            const zipError = !zip ? "zip," : "";

            if (
                !firstname ||
                !lastname ||
                !email ||
                !password ||
                !phone ||
                !location ||
                !city ||
                !zip
            ) {
                throw new Error("Veuillez remplir les champs obligatoires ");
            }
            // regex pour l'email et le mot de passe
            const regexEmail = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;
            const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

            if (!regexEmail.test(email)) {
                throw new Error("L'email n'est pas valide");
            }
            if (!regexPassword.test(password)) {
                throw new Error("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial");
            }

            // vérification email déjà utilisé
            const uniqEmail = await UserService.checkEmail(email);
            if (!uniqEmail) {
                throw new Error("L'email est déjà utilisé");
            }


            // cryptage du mot de passe
            const salt = bcrypt.genSaltSync(10);
            password = bcrypt.hashSync(password, salt);

            res.firstname = firstname;
            res.lastname = lastname;
            res.email = email;
            res.password = password;
            res.phone = phone;
            res.location = location;
            res.city = city;
            res.zip = zip;
            res.avatar = avatar ? avatar : null;
            next();
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },
    // création du Token
    createToken(req, res, next) {
        res.token = crypto.randomUUID();
        next();
    },
    // enregistrement du nouvel utilisateur
    async register(req, res) {
        const { firstname, lastname, email, password, phone, avatar, location, city, zip } = res;
        const { token } = res;
        console.log(firstname, lastname, email, password, phone, avatar, location, city, zip)
        try {
            const user = await prisma.user.create({
                data: {
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: password,
                    phone: phone,
                    avatar: avatar,
                    location: location,
                    city: city,
                    zip: zip,
                    token: token,
                }
            });
            if (!user) {
                throw new Error ('Utilisateur n\'a  pas être créé');
            } else {
                // envoi du mail de remerciement pour l'inscription
                const title = "Cher nouveau Yuser,...";
                const htmlBody = `<div style="text-align: center; margin: 0 auto; width: 50%; padding: 20px; border: 1px solid #000; border-radius: 10px;">
                <h1 style="color: #000;">Bienvenue chez Yuniq</h1>  
                <p style="color: #000;">Bonjour ${firstname} ${lastname},</p>
                <p style="color: #000;">Nous sommes ravis de vous compter parmi nos Yusers.</p>
                <p style="color: #000;">Vous pouvez dès à présent vous connecter à votre compte et profiter de nos services.</p>
                <p style="color: #000;">A très vite sur Yuniq !</p>
                <p style="color: #000;">L'équipe Yuniq</p>
                </div>`;
                const htmlContent = MailService.createHtmlContent(title, htmlBody);
                await MailService.sendMail(email, title, htmlContent);
                res.status(201).json({ message: "Utilisateur créé" });
            }
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    },
    // login session
    async login(req, res) {
        console.log(req.body)
        const { email, password } = req.body;
        try {
            const userFind = await prisma.user.findUnique({
                where: {
                    email: email,
                }
            });
            if (!userFind) {
                throw new Error ('Utilisateur non trouvé')
            }
            const isMatch = await bcrypt.compare(password, userFind.password);
            if (!isMatch) {
                throw new Error('Mot de passe incorrect')
            }
            const payload = {
                user: {
                    id: userFind.id,
                },
            };
           const token = JWT.sign(payload, SECRET_KEY, { expiresIn: '30d' });
            console.log(token)
            if (!token) {
                throw new Error ('Token non généré')
            }
            res.status(200).json({
                token,
                user: userFind,
            });
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    },
    // logout session by deleting token jwt in localstorage
    // Since JWT tokens cannot be revoked, the logout is handled on the client-side by deleting the stored JWT token in local storage.
    // forgot password
    async forgotPassword(req, res) {
        const { email } = req.body;
        console.log(req.body)
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                }
            });

            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            // Générer un token de réinitialisation de mot de passe
            const resetToken = crypto.randomBytes(32).toString("hex");
             // Le token expire dans 1 heure
            const resetTokenExpires = DateTime.now().plus({ hours: 1 }).toISO();

            // Enregistrez le token et la date d'expiration dans l'utilisateur
            const update = await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: resetTokenExpires,
                }
            });

            // Envoyer un e-mail de réinitialisation de mot de passe
            const title = "Réinitialisation de votre mot de passe";
            const htmlBody = `<div style="text-align: center; margin: 0 auto; width: 50%; padding: 20px; border: 1px solid #000; border-radius: 10px;">
            <h1 style="color: #000;">Réinitialisation de votre mot de passe</h1>
            <p style="color: #000;">Bonjour ${user.firstname} ${user.lastname},</p>
            <p style="color: #000;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p style="color: #000;">Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe.</p>
            <a href="${process.env.CLIENT_URL}/reset-password?resetToken=${resetToken}" style="color: #000;">Réinitialiser mon mot de passe</a>
            <p style="color: #000;">Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet e-mail.</p>
            <p style="color: #000;">A très vite sur Yuniq !</p>
            <p style="color: #000;">L'équipe Yuniq</p>
            </div>`;
            const htmlContent = MailService.createHtmlContent(title, htmlBody);
            await MailService.sendMail(email, title, htmlContent);
            res.status(200).json({ message: "Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail" });
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la réinitialisation du mot de passe", error });
        }
    },
    // reset password
    async resetPassword(req, res) {
        const { resetToken }  = req.query;
        const { newPassword } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: {
                    resetPasswordToken: resetToken,
                }
            });

            if (!user) {
                throw new Error("Token invalide ou expiré");
            }
            // Valider le nouveau mot de passe
            const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
            if (!regexPassword.test(newPassword)) {
                throw new Error("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial");
            }
            // Hacher le nouveau mot de passe et le mettre à jour dans la base de données
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(newPassword, salt);
            await prisma.user.update({
                where: {
                    id: parseInt(user.id)
                },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                }
            });

            // Envoyer un e-mail de confirmation de réinitialisation de mot de passe
            const title = "Confirmation de réinitialisation de votre mot de passe";
            const htmlBody = `<div style="text-align: center; margin: 0 auto; width: 50%; padding: 20px; border: 1px solid #000; border-radius: 10px;">
            <h1 style="color: #000;">Confirmation de réinitialisation de votre mot de passe</h1>
            <p style="color: #000;">Bonjour ${user.firstname} ${user.lastname},</p>
            <p style="color: #000;">Votre mot de passe a été réinitialisé avec succès.</p>
            <p style="color: #000;">A très vite sur Yuniq !</p>
            <p style="color: #000;">L'équipe Yuniq</p>
            </div>`;
            const htmlContent = MailService.createHtmlContent(title, htmlBody);
            await MailService.sendMail(user.email, title, htmlContent);

            res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la réinitialisation du mot de passe", error });
        }
    },
    // contact save in database and send email
    async contact(req, res) {
        const { firstname, lastname, email, subject ,message } = req.body;
        console.log(req.body)
        try {
            const contact = await prisma.contact.create({
                data: {
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    subject: subject,
                    message: message,
                }
            });
            if (!contact) {
                throw new Error ('Contact n\'a  pas être créé');
            } else {
                // send email
                const htmlContent = MailService.contactHtmlEmail(firstname,subject,message);
                const send = await MailService.sendMail(email,subject,htmlContent);
                console.log(send)
                res.status(200).json({message: 'Email envoyé avec succès'});
            }

        } catch (error) {
            console.log(error);
            res.status(400).json({message: error.message});
        }
    }
};

