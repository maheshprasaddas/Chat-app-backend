import { hash, compare } from 'bcryptjs';
import { User } from '../models/user.model.js';
import tokenUtils from '../utils/generateToken.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const OTP_EXPIRY_MINUTES = 5;

/**
 * Generate a 6-digit OTP (mock for development)
 * Replace with Twilio / Firebase / MSG91 in production
 */
const generateOtp = () => {
  // In production, generate a random OTP and send via SMS
  // For development, return a fixed OTP
  const otp = '123456';
  console.log(`[DEV] Generated OTP: ${otp}`);
  return otp;
};

// ─── REGISTER ────────────────────────────────────────────────
export const registerUser = async ({ mobile_number, country_code, deviceId, terms_and_condition_status, name, email, opt_marketing_mail }, file) => {
  // Check if user already exists
  const existingUser = await User.findOne({ mobile_number });
  if (existingUser && existingUser.is_verified) {
    const error = new Error('User with this mobile number already exists');
    error.statusCode = 409;
    throw error;
  }

  // Generate and hash OTP
  const otp = generateOtp();
  const hashedOtp = await hash(otp, 10);
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Handle profile photo upload
  let profilePhotoData = {};
  if (file) {
    const { url, public_id } = await uploadToCloudinary(file.buffer);
    profilePhotoData = { profile_photo: url, cloudinary_public_id: public_id };
  }

  if (existingUser && !existingUser.is_verified) {
    // Update OTP and fields for unverified user
    existingUser.otp = hashedOtp;
    existingUser.otp_expires_at = otpExpiry;
    existingUser.deviceId = deviceId;
    if (name !== undefined) existingUser.name = name;
    if (email !== undefined) existingUser.email = email;
    if (opt_marketing_mail !== undefined) existingUser.opt_marketing_mail = opt_marketing_mail;
    if (profilePhotoData.profile_photo) {
      // Delete old photo if re-uploading
      if (existingUser.cloudinary_public_id) {
        await deleteFromCloudinary(existingUser.cloudinary_public_id);
      }
      existingUser.profile_photo = profilePhotoData.profile_photo;
      existingUser.cloudinary_public_id = profilePhotoData.cloudinary_public_id;
    }
    await existingUser.save();

    return { message: 'OTP sent to your mobile number', mobile_number };
  }

  // Create new user
  await User.create({
    mobile_number,
    country_code,
    deviceId,
    terms_and_condition_status,
    name: name || null,
    email: email || null,
    opt_marketing_mail: opt_marketing_mail !== undefined ? opt_marketing_mail : true,
    otp: hashedOtp,
    otp_expires_at: otpExpiry,
    ...profilePhotoData,
  });

  return { message: 'OTP sent to your mobile number', mobile_number };
};

// ─── VERIFY OTP ──────────────────────────────────────────────
export const verifyUserOtp = async ({ mobile_number, otp }) => {
  const user = await User.findOne({ mobile_number });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check OTP expiry
  if (!user.otp || !user.otp_expires_at || user.otp_expires_at < new Date()) {
    const error = new Error('OTP has expired. Please request a new one');
    error.statusCode = 400;
    throw error;
  }

  // Compare OTP
  const isOtpValid = await compare(otp, user.otp);
  if (!isOtpValid) {
    const error = new Error('Invalid OTP');
    error.statusCode = 400;
    throw error;
  }

  // Mark as verified, clear OTP fields
  user.is_verified = true;
  user.otp = null;
  user.otp_expires_at = null;

  // Generate tokens
  const payload = { id: user._id, mobile_number: user.mobile_number };
  const accessToken = tokenUtils.generateAccessToken(payload);
  const refreshToken = tokenUtils.generateRefreshToken(payload);

  user.access_token = accessToken;
  user.refresh_token = refreshToken;
  await user.save();

  return {
    message: 'OTP verified successfully',
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

// ─── LOGIN ───────────────────────────────────────────────────
export const loginUser = async ({ mobile_number, deviceId }) => {
  const user = await User.findOne({ mobile_number });
  if (!user) {
    const error = new Error('User not found. Please register first');
    error.statusCode = 404;
    throw error;
  }

  if (!user.is_verified) {
    const error = new Error('Account not verified. Please verify OTP first');
    error.statusCode = 403;
    throw error;
  }

  if (user.account_status === 'deactivated') {
    const error = new Error('Account is deactivated. Please contact support');
    error.statusCode = 403;
    throw error;
  }

  // Update deviceId
  user.deviceId = deviceId;

  // Generate new tokens
  const payload = { id: user._id, mobile_number: user.mobile_number };
  const accessToken = tokenUtils.generateAccessToken(payload);
  const refreshToken = tokenUtils.generateRefreshToken(payload);

  user.access_token = accessToken;
  user.refresh_token = refreshToken;
  await user.save();

  return {
    message: 'Login successful',
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

// ─── GET PROFILE ─────────────────────────────────────────────
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select(
    '-otp -otp_expires_at -access_token -refresh_token -__v'
  );

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// ─── EDIT PROFILE ────────────────────────────────────────────
export const editUserProfile = async (userId, updateData, file) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Handle profile photo upload
  if (file) {
    // Delete old photo from Cloudinary if exists
    if (user.cloudinary_public_id) {
      await deleteFromCloudinary(user.cloudinary_public_id);
    }

    // Upload new photo
    const { url, public_id } = await uploadToCloudinary(file.buffer);
    user.profile_photo = url;
    user.cloudinary_public_id = public_id;
  }

  // Update allowed fields
  const allowedFields = ['name', 'email', 'isAddToGroups', 'opt_marketing_mail', 'opt_two_factor_auth'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  await user.save();

  // Return user without sensitive fields
  const updatedUser = user.toObject();
  delete updatedUser.otp;
  delete updatedUser.otp_expires_at;
  delete updatedUser.access_token;
  delete updatedUser.refresh_token;
  delete updatedUser.__v;

  return updatedUser;
};

// ─── DELETE PROFILE (Hard Delete) ────────────────────────────
export const deleteUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Delete profile photo from Cloudinary
  if (user.cloudinary_public_id) {
    await deleteFromCloudinary(user.cloudinary_public_id);
  }

  await User.findByIdAndDelete(userId);

  return { message: 'Profile deleted permanently' };
};

// ─── TEMPORARY DELETE PROFILE (Soft Delete) ──────────────────
export const temporaryDeleteProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.account_status === 'deactivated') {
    const error = new Error('Account is already deactivated');
    error.statusCode = 400;
    throw error;
  }

  user.account_status = 'deactivated';
  await user.save();

  return { message: 'Account deactivated successfully' };
};

// ─── REACTIVATE PROFILE ──────────────────────────────────────
export const reactivateProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.account_status === 'activated') {
    const error = new Error('Account is already active');
    error.statusCode = 400;
    throw error;
  }

  user.account_status = 'activated';
  await user.save();

  return { message: 'Account reactivated successfully' };
};

// ─── LOGOUT ──────────────────────────────────────────────────
export const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.access_token = null;
  user.refresh_token = null;
  await user.save();

  return { message: 'Logged out successfully' };
};

