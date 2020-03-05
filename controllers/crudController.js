const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

// * GET all document
exports.getAll = Model => catchAsync(async (req, res, next) =>{

    const doc = await Model.find();

    if (!doc) return next(new appError('Nenhum documento encontrado', 404));

    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            doc: doc
        }
    });

});

// *Get one document
exports.getOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findById(req.params.id);

    if (!doc) return next(new appError('documento nao encontrado', 404));

    res.status(200).json({
        status: 'success',
        data: {
            doc: doc
        }
    });

});

// * Create document
exports.createOne = Model => catchAsync(async (req, res, next) => {
    
    const doc = await Model.create(req.body);

    if(!doc) return next(new appError('Confira se o Model esta correto', 400));

    res.status(201).json({
        status: 'success',
        data: {
            doc: doc
        }
    });

});

// *Update one document
exports.patchOne = Model => catchAsync(async (req, res,next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    if (!doc) return next(new appError('Documento nao encontrado', 404));

    res.status(200).json({
        status: 'success',
        data: {
            doc: doc
        }
    });

});

// *Delete one document
exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new appError('Documento nao localizado', 404));

    res.status(200).json({
        status: 'success',
        data: null
    });

});
