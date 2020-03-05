const crud = require('./crudController');
const User = require('../models/userModel');


exports.getAllUser = crud.getAll(User);

exports.getOneUser = crud.getOne(User);

// ! Adimin controller
exports.createUser = crud.createOne(User);

exports.updateUser = crud.patchOne(User);

exports.deleteUser = crud.deleteOne(User);