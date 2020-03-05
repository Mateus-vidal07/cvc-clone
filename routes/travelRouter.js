const express = require('express');
const travelController = require('../controllers/travelController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/')
    .get(travelController.getAllTravel)
    .post(authController.isLogged, authController.restrictTo('administrador', 'gerenciador'), travelController.postTravel);

router.get('/mais-votados', travelController.topRatings);

router.route('/:id')
    .get(travelController.getOneTravel)
    .patch(authController.isLogged, authController.restrictTo('administrador', 'gerenciador'), travelController.patchTravel)
    .delete(authController.isLogged, authController.restrictTo('administrador', 'gerenciador'), travelController.deleteTravel);

module.exports = router;