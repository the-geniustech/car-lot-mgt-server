import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return this.googleId || value; // Only required if not signing in with Google
      },
      message: 'Please tell us your name',
    },
    minlength: [2, 'A name must be at least 2 characters long'],
    pattern: {
      value: /^[a-zA-Z\s]+$/,
      message: 'Name should only contain alphabetic characters',
    },
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    url: String,
    publicId: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // This allows multiple null values for unique fields
  },
  password: {
    type: String,
    validate: {
      validator: function (value) {
        return this.googleId || value; // Only required if not signing in with Google
      },
      message: 'Please provide a password',
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (value) {
        return this.googleId || value === this.password; // Only required if not signing in with Google
      },
      message: 'Password and confirm password do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Virtual populate
userSchema.virtual('cars', {
  ref: 'Car',
  foreignField: 'user',
  localField: '_id',
});

userSchema.pre('save', async function (next) {
  // Run this code only if the password was modified
  if (!this.isModified('password') || this.googleId) return next();

  // Hash the password with the cost factor value of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTIMEstamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTIMEstamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
