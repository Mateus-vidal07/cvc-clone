const Travel = require('../models/travelModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const crud = require('./crudController');


// Get all travels
exports.getAllTravel = catchAsync(async(req, res, next) => {

    // * Filter query
    const objQuery = {...req.query};
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(field => delete objQuery[field]);

    let queryStr = JSON.stringify(objQuery);
    queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`));

    let query = Travel.find(queryStr);

    //* Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 9;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    travels = await query
    res.status(200).json({
        status: 'success',
        results: travels.length,
        data: {
            travels: travels
        }
    });
});

// GET one post
exports.getOneTravel = crud.getOne(Travel);

// POST travels
exports.postTravel = crud.createOne(Travel);

// PATCH travels
exports.patchTravel = crud.patchOne(Travel);

// DELETE travels
exports.deleteTravel = crud.deleteOne(Travel);

// * Top 5 mais votados
exports.topRatings = catchAsync(async(req, res, next) => {

    let query = Travel.find({ratings: {$gte: 4.0}});
    query.sort('-ratings').limit(5);

    travel = await query;

    res.status(200).json({
        status: 'success',
        results: travel.length,
        data: {
            travels: travel
        }
    });

});
