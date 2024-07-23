import cloudinary from '../cloud/index.js';
import Car from '../models/carModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteOne, getAll, getOne } from './handlerFactory.js';

export const createCar = catchAsync(async (req, res) => {
  const carDetails = {
    maker: req.body.maker?.[0],
    model: req.body.model?.[0],
    description: req.body.description?.[0],
    year: req.body.year?.[0],
    price: req.body.price?.[0],
    admin: req.user.id,
  };

  const { image } = req.files;

  if (image) {
    // upload new photo file
    const { secure_url: url, public_id: publicId } =
      await cloudinary.uploader.upload(image[0].filepath, {
        width: 1200,
        height: 795,
        crop: 'scale',
      });

    carDetails.image = { url, publicId };
  }

  const car = await Car.create({ ...carDetails, admin: req.user.id });

  res.status(201).json({
    status: 'success',
    data: {
      car,
    },
  });
});

export const updateCar = catchAsync(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  const adminId = car.admin && car.admin._id.toString();
  const userId = req.user && req.user._id.toString();

  // Check if the logged-in user is the admin of the car
  if (adminId !== userId) {
    return next(
      new AppError('You do not have permission to update this car car', 403),
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const carDetails = {
    maker: req.body.maker?.[0],
    model: req.body.model?.[0],
    description: req.body.description?.[0],
    year: req.body.year?.[0],
    price: req.body.price?.[0],
    // admin: req.user.id,
  };

  const { image } = req.files;

  if (image) {
    // if there is already a image file, we want to remove that.
    if (car.image?.publicId) {
      await cloudinary.uploader.destroy(car.image.publicId);
    }

    // upload new Image file
    const { secure_url: url, public_id: publicId } =
      await cloudinary.uploader.upload(image[0].filepath, {
        width: 1200,
        height: 795,
        crop: 'scale',
      });

    carDetails.image = { url, publicId };
  }

  // 3) Update Car document
  const updatedCar = await Car.findByIdAndUpdate(req.params.id, carDetails, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedCar,
  });
});

export const deleteCar = deleteOne(Car, { checkAdmin: true });
export const getAllCars = getAll(Car);
export const getCar = getOne(Car, { path: 'reviews' });
