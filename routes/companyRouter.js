const express = require('express');
const companyController = require('../controllers/companyController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/')
    .get(companyController.getAllCompany)
    .post(authController.isLogged, authController.restrictTo('administrador', 'gerenciador'), companyController.createCompany);

router.route('/:id')
    .get(companyController.getOneCompany)
    .patch(authController.isLogged, authController.restrictTo('administrador', 'gerenciador'), companyController.updateCompany)
    .delete(authController.isLogged, authController.restrictTo('administrador', 'gerenciador'), companyController.deleteCompany);

module.exports = router;