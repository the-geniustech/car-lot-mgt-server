import AppError from '../utils/appError.js';

// Middleware that Restricts access to certain routes based on user roles.
const restrictTo =
  (...role) =>
  (req, res, next) => {
    // Roles ['admin', 'lead', 'lead-guide']
    if (!role.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );

    next();
  };

export default restrictTo;
