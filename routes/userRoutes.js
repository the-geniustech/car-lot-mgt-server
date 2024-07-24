import express from 'express';
import carRouter from './carRoutes.js';
import {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
  getMe,
  updateUser,
  deleteUser,
  createUser,
} from '../controllers/userController.js';
import {
  forgotPassword,
  googleAuth,
  googleAuthCallback,
  login,
  logout,
  resetPassword,
  signup,
  updatePassword,
} from '../controllers/authController.js';
import fileParser from '../middleware/fileParser.js';
import protect from '../middleware/protect.js';
import restrictTo from '../middleware/restrictTo.js';

const router = express.Router();

router.post('/signup', fileParser, signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Google OAuth routes
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);
//https://car-lot-mgt-server.onrender.com/api/v1/users/auth/google/callback
// Retrieve all cars added by the user
router.use('/:userId/cars', carRouter);

// Protect all routes after this midleware
router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', fileParser, updateMe);
router.delete('/deleteMe', deleteMe);

// Restrict all routes after this midleware to Admin user only
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
