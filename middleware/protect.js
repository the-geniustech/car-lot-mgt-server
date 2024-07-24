import { configDotenv } from 'dotenv';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import User from '../models/userModel.js';

configDotenv();

const protect = catchAsync(async (req, res, next) => {
  // Check if user is logged in from session cookie (Passport - Google oAuth)
  console.log('protect', req.user);
  if (req.user) {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    req.user = await User.findById(req.user.id).select('-password');
    req.user.token = token;
    return next();
  }

  // Check if token is provided in the request header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];

  // If token is not provided, return error message
  if (!token)
    return next(
      new AppError('You are not logged in! Please login to get access', 401),
    );

  // If token is provided but invalid, return error message
  // Verification token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  // Check if token has expired
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token is no longer exist', 401),
    );

  // If token is valid but user has changed password, return error message
  if (currentUser.changedPasswordAfter(decodedToken.iat))
    return next(
      new AppError('User recently changed password! Please login again', 401),
    );

  // If all checks pass, set user and token in the request
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export default protect;
