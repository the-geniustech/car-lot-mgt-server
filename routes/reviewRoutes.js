import express from 'express';
import protect from '../middleware/protect.js';
import restrictTo from '../middleware/restrictTo.js';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setCarUserIds,
  updateReview,
} from '../controllers/reviewController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setCarUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

export default router;
