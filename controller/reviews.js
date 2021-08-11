const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');


// @desc   Get all reviews
//@route   Get /api/v1/reviews
//@route    Get /api/v1/bootcamps/:bootcampId/reviews
//@access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
   
    if (req.params.bootcampId) {

        const reviews = await Review.find({
            bootcamp: req.params.bootcampId
        });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
      
        res.status(200).json(res.advancedResults);
    }

});


// @desc   Get single review
//@route   Get /api/v1/review/:id
//@access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
   const review = await Review.findById(req.params.id).populate({
       path: 'bootcamp',
       select: 'name description'
   });
   if(!review){
       return next(new ErrorResponse(`No review with the id of ${req.params.id}`), 500);

   }
   res.status(200).json({
       success: true,
       data: review
   });
    
});


// @desc  Add review
//@route   Post /api/v1/bootcamps/:bootcampId/reviews
//@access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user=req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp){
      return next(new ErrorResponse(`no bootcamp with ${req.params.bootcampId}`), 404);
  }

  const review = await Review.create(req.body);
    res.status(201).json({
        success: true,
        data: review
    });
     
 });


 // @desc  update review
//@route   PUT /api/v1/reviews/:id
//@access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    
  
    let review = await Review.findById(req.params.id);
  
    if(!review){
        return next(new ErrorResponse(`no review with ${req.params.id}`), 404);
    }

    //make sure review belongs to user
    if(review.user.toString() != req.user.id && req.user.role!== 'admin'){
        return next(new ErrorResponse(`not authorizes to update review`), 401);   
    }
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators:true
    });

    res.status(200).json({
        success: true,
        data: review
    });
    
       
   });

    // @desc  delete review
//@route   DELETE /api/v1/reviews/:id
//@access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    
  
    let review = await Review.findById(req.params.id);
  
    if(!review){
        return next(new ErrorResponse(`no review with ${req.params.id}`), 404);
    }

    //make sure review belongs to user
    if(review.user.toString() != req.user.id && req.user.role!== 'admin'){
        return next(new ErrorResponse(`not authorizes to update review`), 401);   
    }
    await review.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
    
       
   });