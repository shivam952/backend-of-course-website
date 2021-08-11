const path = require('path'); //to add file extension at the end of photo file
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc   Get all bootcamps
//@route   Get /api/v1/bootcamps
//@access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    // let query;
    // //Copy req.query
    // const reqQuery = {
    // 	...req.query,
    // };

    // //Fields to exclude
    // const removeFields = ['select', 'sort', 'page', 'limit'];

    // //loop over remove fields and delete them from reqQuery
    // removeFields.forEach((param) => delete reqQuery[param]);
    // //Create query string
    // let queryStr = JSON.stringify(reqQuery);
    // //create operators {$gt, $lte....}
    // queryStr = queryStr.replace(
    // 	/\b(gt|gte|lt|lte|in)\b/g,
    // 	(match) => `$${match}`
    // );
    // console.log(queryStr);

    // //Finding resource
    // query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    // //Select fields
    // if (req.query.select) {
    // 	const fields = req.query.select.split(',').join(' ');
    // 	query = query.select(fields);
    // }

    // //sort
    // if (req.query.sort) {
    // 	const sortBy = req.query.sort.split(',').join(' ');
    // 	query = query.sort(sortBy);
    // } else {
    // 	query = query.sort('-createdAt');
    // }

    // //pagination
    // const page = parseInt(req.query.page, 10) || 1;
    // const limit = parseInt(req.query.limit, 10) || 25;
    // const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    // const total = await Bootcamp.countDocuments();

    // query = query.skip(startIndex).limit(limit);

    // //execute
    // const bootcamps = await query;

    // //pagination result
    // const pagination = {};

    // if (endIndex < total) {
    // 	pagination.next = {
    // 		page: page + 1,
    // 		limit,
    // 	};
    // }

    // if (startIndex > 0) {
    // 	pagination.prev = {
    // 		page: page - 1,
    // 		limit,
    // 	};
    // }


    res.status(200).json(
        res.advancedResults
    );

    //console.log(err);
});

// @desc   Get single bootcamp
//@route   Get /api/v1/bootcamps/:id
//@access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    // try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not find with id of ${req.params.id}`, 404)
        );
    }
    res.status(200).json({
        success: true,
        data: bootcamp,
    });
    //} catch (err) {
    // res.status(400).json({
    //     success: false,
    // });
    //next(err);
    // next(err);
    //console.log(err);
    //}
});

// @desc   Create a bootcamp
//@route   Post /api/v1/bootcamps
//@access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    // Add user to req.body
    req.body.user = req.user.id;

    //Check for published bootcamp
    const pubishedBootcamp = await Bootcamp.findOne({
        user: req.user.id
    });
    //try {
    const bootcamp = await Bootcamp.create(req.body);

    // If the user is not an admin they can only add one bootcamp
    if (pubishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
    }

    res.status(201).json({
        success: true,
        data: bootcamp,
    });
    // } catch (err) {
    //     next(err);
    // }
});

// @desc   Update bootcamp
//@route   Put /api/v1/bootcamps/:id
//@access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    //try {
    let bootcamp = await Bootcamp.findById(req.params.id, req.body);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not find with id of ${req.params.id}`, 404)
        );
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role != 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorizes to update the bootcamp`, 401)
        );
    }

    bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: bootcamp,
    });
    // } catch {
    //     next(err);
    //     //console.log(err);
    // }
});

// @desc   Delete bootcamp
//@route   Delete /api/v1/bootcamps/:id
//@access  Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    //try {
    // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); this will not trigger the middleware
    const bootcamp = await Bootcamp.findById(req.params.id); // this will
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not find with id of ${req.params.id}`, 404)
        );
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role != 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorizes to delete the bootcamp`, 401)
        );
    }


    bootcamp.remove();
    res.status(200).json({
        success: true,
        data: {},
    });


    // } catch {
    //     next(err);
    //     //console.log(err);
    // }
});

// @desc   Get bootcamp within a radius
//@route   Delete /api/v1/bootcamps/radius/:zipcode/:distance
//@access  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {
        zipcode,
        distance
    } = req.params;

    //get lan/long from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //calc radius
    //divide distance by radius
    // earth radius = 3,963mi / 6378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ],
            },
        },
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});

// @desc   Upload photo bor bootcamp
//@route   PUT /api/v1/bootcamps/:id/photo
//@access  Public
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    //try {
    // const bootcamp = await Bootcamp.
    const bootcamp = await Bootcamp.findById(req.params.id); // this will
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not find with id of ${req.params.id}`, 404)
        );
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role != 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorizes to update the bootcamp`, 401)
        );
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    //console.log(req.files);

    const file = req.files.file;

    //Make sure that the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    //file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
                400
            )
        );
    }

    // create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/ ${file.name}`, async (err) => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: file.name
        });

        res.status(200).json({
            success: true,
            data: file.name,
        });
    });

    //console.log(file.name);

    // } catch {
    //     next(err);
    //     //console.log(err);
    // }
});