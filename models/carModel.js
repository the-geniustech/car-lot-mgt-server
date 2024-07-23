import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    maker: {
      type: String,
      required: [true, 'Car must have a maker'],
    },
    model: {
      type: String,
      required: [true, 'Car must have a model'],
    },
    description: {
      type: String,
      required: [true, 'Car must have a description'],
    },
    year: {
      type: Number,
      required: [true, 'Car must have a production year'],
    },
    price: {
      type: Number,
      required: [true, 'Car must have a price'],
    },
    image: {
      type: Object,
      url: String,
      publicId: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Car must be created by an admin.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate
carSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'car',
  localField: '_id',
});

// Pre hook to automatically populate admin on find
carSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'admin',
    select: '-__v -passwordChangedAt',
  });

  next();
});

const Car = mongoose.model('Car', carSchema);

export default Car;
