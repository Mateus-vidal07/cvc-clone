const crud = require('./crudController');
const Company = require('../models/companyModel');

exports.getAllCompany = crud.getAll(Company);

exports.getOneCompany = crud.getOne(Company);

exports.createCompany = crud.createOne(Company);

exports.updateCompany = crud.patchOne(Company);

exports.deleteCompany = crud.deleteOne(Company);