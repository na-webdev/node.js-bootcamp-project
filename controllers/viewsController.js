const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get tour data from collection
  const tours = await Tour.find({});
  // 2) build template

  // 3) render that template using tour data from 1)

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get the data, for the requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // 2) build template
  // 3) render template using data from 1)
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLogInForm = (req, res) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', { title: 'Your account' });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) find all bookings
  const bookings = await Booking.find({ user: req.user._id });
  // 2) find tours with returned Ids
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError('User with this id not found', 404));
  }

  res
    .status(200)
    .render('account', { title: 'Your account', user: updatedUser });
});
