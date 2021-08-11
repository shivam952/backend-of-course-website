const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add name']
    },
    description: {
        type: String,
        required: [true, 'Please add description']

    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']

    },
    tuition: {
        type: Number,
        required: [true, 'Please add tuition cost']

    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimumSkill'],
        enum: ['beginner', 'intermediate', 'advanced']

    },
    scholarshipAvailable: {
        type: Boolean,
        defauly: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});
//static method to get average costs
courseSchema.statics.getAverageCost = async function (bootcampId) {
    //console.log('Calculating average cost .... '.blue);

    const obj = await this.aggregate([{
            $match: {
                bootcamp: bootcampId
            }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: {
                    $avg: '$tuition'
                }
            }
        }
    ]);
    //console.log(obj);
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        });
    } catch (error) {
        console.error(error);
    }
}

//Call get average cost after save
courseSchema.post('save', function () {
    this.constructor.getAverageCost(this.bootcamp);
});

//Call get average cost before remove
courseSchema.pre('remove', function () {
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', courseSchema);