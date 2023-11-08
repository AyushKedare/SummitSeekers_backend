import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

//@desc Delete User Profile
//@route DELETE /api/users/delete
//@access Private

const deleteUser = async(req, res) =>{
  const filter = { _id: req.params.id };

  const result = await User.deleteOne(filter);

  if (result) {
      return res.status(200).send({ success: true, message: `User with id ${filter._id} deleted successfully` });
  } else {
      return res.status(400).json({ sucess: false, message: " No record found" });
  }
}


// @desc    Get latest user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


// @desc    Get all user profile
// @route   GET /api/users/getall
// @access  Private
const getAllUser = asyncHandler(async (req, res) => {
  const user = await User.find();

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const filter = { _id: req.params.id };
  const options = {
      upsert: true,
      new: true,
  };

  try {
      const result = await User.findOneAndUpdate(
          filter,
          {
              // name: req.body.name,
              // role : req.body.role,
              // organisationName : req.body.organisationName,
              // hospitalName : req.body.hospitalName,
              email : req.body.email
          },
          options
      );
      return res.status(200).send({ success: true, data: result });
  } catch (error) {
      return res.status(400).send({ success: false, message: error });
  }
};
export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUser,
};
