/**
* yuniq-one
*
* 🎉 Introduction
* ===============
*
* Le but de ce projet est de fournir un point de départ pour les développeurs qui cherchent à construire leur propre boutique en ligne ou à explorer ces technologies.
*
* ## 🔧 Features

| ![Vue](https://img.shields.io/badge/-Vue-4FC08D?style=flat-square&logo=vue.js&logoColor=white) |  ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white) | ![Prisma](https://img.shields.io/badge/-Prisma-0C344B?style=flat-square&logo=prisma&logoColor=white) | ![Multer](https://img.shields.io/badge/-Multer-1F8CEA?style=flat-square&logo=multer&logoColor=white) | ![Pina](https://img.shields.io/badge/-Pina-FFC107?style=flat-square&logo=pina&logoColor=white) | ![Stripe](https://img.shields.io/badge/-Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white) |
| --- | --- | --- | --- | --- | --- | --- | --- | 

* ### 🎨 Icons
* 🎉 💻 🔧 🔍 🔑 💳 📦 📷 💾 💬 🚀 📈 🌐
*
*
*
* 📦 Project setup
* ===================
*
* `npm install`
*
* Local Tunnel Https testing
*
* `npm install -g localtunnel`
*
* Compile and Hot-Reload for Development
*
* `npm run dev`
*
* Run your local tunnel https (in a separate terminal)
*
* `lt --port 5173 --subdomain store-yuniq`
*
* Compile and Minify for Production
*
* `npm run build`
*
* 🔑 Authentication
* ======================
*
* The API does not require authentication to access public data, but it requires authentication to access private data.
*
* The API uses JSON Web Tokens (JWT) for authentication.
*
* - POST /api/auth/register: Register a new user.
* - POST /api/auth/login: Login to the API to get a JWT.
* - POST /api/auth/logout: Logout and revoke the JWT.
*
* The following routes require a valid JWT:
*
* - PUT /api/auth/change-password: Change a user's password.
* - PUT /api/auth/reset-password: Reset a user's password.
* - GET /api/auth/verify-token: Verify the validity of an authentication token.
*
* 💳 Payment
* ==============
*
* The API uses Stripe for payment processing.
*
* - POST /api/store/subscriptions/:id/subscribe: Create a new subscription with Stripe.
* - GET /api/confirm_payment/:subscriptionId: Confirmed the payment of a subscription with Stripe.
*
* ### Stripe Configuration
*
* To use Stripe with this project, you need to create a Stripe account and add your API keys to your .env file:
*
* STRIPE_SECRET_KEY=sk_test_************
* STRIPE_PUBLIC_KEY=pk_test_************
*
* ### To test payment
*
* Stripe provides test cards that you can use to test the payment process:
*
* - Card number: 4242 4242 4242 4242
* - Expiration date: any future date
* - Security code: 123
* - Postal code: 12345
*
* 📷 Images
* ============
* - Multer is used to handle image files.
* - The image files are stored in the `server/uploads` directory.
* - The image files are accessible through the `server/uploads` directory.
*
* The goal of this project is to provide a starting point for developers looking to build their own e-commerce store or explore these technologies.
*
* 💾 Database
* ====================
* - Prisma is used as the ORM for the MySQL database.
* - The database migration file is stored in the `prisma/migrations` directory.
* - The database schema file is stored in the `prisma/schema.prisma` directory.
*
* 💻 Requirements
* ==========================
*
* - Node.js v14.x or higher
* - npm or yarn
* - MySQL v8.x or higher
*
* 🔧 Installation
* ===================
*
* To install dependencies, run the following command:
*
* `npm install`
*
* ### Environment Configuration
*
* Copy the `.env.example` file to `.env` and fill in the variables according to your environment.
*
* 🔍 API Overview
* ====================
*
* The API is built with Node.js and Express, and uses a MySQL database with Prisma as the ORM.
*
* - The API files are stored in the `server` directory.
* - Routes are defined in the `server/router` directory.
* - Controllers are stored in the `server/controller` directory.
* - Services are stored in the `server/service` directory.
* - Database models are stored in the `prisma/schema.prisma` directory.
*
* 🌐 Routes
* =============
*
* Les routes de l'application sont :
*
* ### Home
*
* - /: La page d'accueil de l'application avec la liste des dernières chaussures ajoutées.
*
* ### Sneakers
*
* - /sneakers: La liste de toutes les chaussures disponibles.
* - /sneakers/:id: Détails d'une chaussure avec un formulaire pour l'ajouter au panier.
*
* ### Subscriptions
*
* - /subscriptions: La liste de toutes les abonnements disponibles.
* - /subscriptions/:id: Détails d'un abonnement avec un formulaire pour souscrire.
*
* ### User
*
* - /user/register: Formulaire d'enregistrement pour un nouvel utilisateur.
* - /user/login: Formulaire de connexion pour l'utilisateur existant.
* - /user/account: Page de compte de l'utilisateur avec les détails de l'utilisateur et son historique d'achat.
* - /user/account/edit: Formulaire de modification des informations de l'utilisateur.
* - /user/account/change-password: Formulaire de modification du mot de passe de l'utilisateur.
* - /user/account/purchases: Historique des achats de l'utilisateur.
*
* ### Cart
*
* - /cart: Le panier de l'utilisateur avec les chaussures ajoutées et le formulaire de paiement.
*
* ### Checkout
*
* - /checkout: Formulaire de paiement avec Stripe pour finaliser l'achat.
*
* ### Endpoints
*
* - GET /api/sneakers: Obtenez toutes les chaussures.
* - GET /api/sneakers/:id: Obtenez une chaussure par ID.
* - POST /api/sneakers: Créer une nouvelle chaussure.
* - PUT /api/sneakers/:id: Mettre à jour une chaussure par ID.
* - DELETE /api/sneakers/:id: Supprimer une chaussure par ID.
* - GET /api/subscriptions: Obtenez toutes les abonnements.
* - GET /api/subscriptions/:id: Obtenez un abonnement par ID.
* - POST /api/subscriptions: Créer un nouvel abonnement.
* - PUT /api/subscriptions/:id: Mettre à jour un abonnement par ID.
* - DELETE /api/subscriptions/:id: Supprimer un abonnement par ID.
* - GET /api/users/:id/purchases: Obtenez les achats d'un utilisateur par ID.
*
* 🚀 Utilisation
* ==================
*
* Pour utiliser l'application, vous pouvez suivre ces étapes :
*
* 1. Clonez le repository et installez les dépendances avec la commande npm install.
* 2. Créez une base de données MySQL et ajoutez vos informations de connexion dans le fichier .env.
* 3. Exécutez les migrations de la base de données avec la commande npx prisma migrate dev.
* 4. Ajoutez les variables Stripe à votre fichier .env.
* 5. Exécutez la commande npm run dev pour démarrer l'application en mode développement.
* 6. Visitez http://localhost:5173 coté front et http://localhost:3000 coté API pour voir l'application en action.
*
* Pour le mode production, vous pouvez exécuter les commandes npm run build et npm start.
*
* 📈 Améliorations possibles
* =============================
*
* Ce projet pourrait être amélioré de plusieurs façons, notamment :
*
* - Ajouter des fonctionnalités de recherche et de tri pour les chaussures et les abonnements.
* - Implémenter la pagination pour les listes de chaussures et d'abonnements.
* - Ajouter des commentaires et des avis sur les chaussures.
* - Implémenter la gestion des stocks pour les chaussures.
* - Ajouter des tests automatisés pour l'API et l'application.
* - Ajouter la fonctionnalité d'annulation de l'achat.
* - Implémenter la gestion des adresses de livraison pour les achats.
* - Ajouter la fonctionnalité de paiement en plusieurs fois.
* - Ajouter la fonctionnalité de paiement avec PayPal.
*
* Si vous avez des suggestions ou des contributions à apporter, n'hésitez pas à créer une issue ou une pull request sur le repository GitHub du projet.
*
* ## Licence
*
* Ce projet est sous licence MIT.
* Pour plus d'informations, veuillez consulter le fichier LICENSE.
**/