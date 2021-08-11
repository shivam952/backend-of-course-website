const express = require('express');
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload,
} = require('../controller/bootcamps');

const Bootcamp = require('../models/Bootcamp');

//acquire middeleware
const advancedResults = require('../middleware/advancedResults');

//Include other resouece router
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();
//re route into other resource router

const {
    protect,
    authorize
} = require('../middleware/auth');



router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

// router.get("/", (req, res) => {
//     res.status(200).json({
//         success: true,
//         msg: 'Show all bootcamps'
//     });

// });
// router.get("/:id", (req, res) => {
//     res.status(200).json({
//         success: true,
//         msg: 'Show all bootcamps'
//     });

// });

// router.post("/", (req, res) => {
//     res.status(200).json({
//         success: true,
//         msg: 'Show all bootcamps'
//     });

// });

// router.put("/:id", (req, res) => {
//     res.status(200).json({
//         success: true,
//         msg: 'Show all bootcamps'
//     });

// });
// router.delete("/:id", (req, res) => {
//     res.status(200).json({
//         success: true,
//         msg: 'Show all bootcamps'
//     });

// });

module.exports = router;