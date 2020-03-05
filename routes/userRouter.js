const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/')
    .get(authController.isLogged, authController.restrictTo('administrador', 'gerenciador'), userController.getAllUser)
    .post(userController.createUser);

router.post('/sign-up', authController.signUp);
router.post('/login', authController.login);

router.patch('/update-me', authController.isLogged, authController.updateMe);
router.patch('/delete-me', authController.isLogged, authController.deleteMe);

router.patch('/update-password', authController.isLogged, authController.changePassword);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

//* Controle administrativo
router.route('/:id')
    .get(authController.isLogged, authController.restrictTo('administrador', 'gerenciador'), userController.getOneUser)
    .patch(authController.isLogged, authController.restrictTo('administrador'), userController.updateUser)
    .delete(authController.isLogged, authController.restrictTo('administrador'), userController.deleteUser);

module.exports = router;