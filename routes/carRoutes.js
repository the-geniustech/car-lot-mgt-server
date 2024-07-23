import express from 'express';
import reviewRouter from './reviewRoutes.js';
import protect from '../middleware/protect.js';
import restrictTo from '../middleware/restrictTo.js';
import {
  createCar,
  getAllCars,
  getCar,
  updateCar,
  deleteCar,
} from '../controllers/carController.js';
import fileParser from '../middleware/fileParser.js';

const router = express.Router({ mergeParams: true });

// Retrieve all reviews on a particular car
router.use('/:carId/reviews', reviewRouter);

router.use(protect);

router
  .route('/')
  .get(getAllCars)
  .post(restrictTo('admin'), fileParser, createCar);

router
  .route('/:id')
  .get(getCar)
  .patch(restrictTo('admin'), fileParser, updateCar)
  .delete(restrictTo('admin'), deleteCar);

export default router;
