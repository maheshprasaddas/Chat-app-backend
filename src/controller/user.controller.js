import {
  registerUser,
  verifyUserOtp,
  loginUser,
  getUserProfile,
  editUserProfile,
  deleteUserProfile,
  temporaryDeleteProfile,
  reactivateProfile,
  logoutUser,
} from '../services/user.service.js';

// ─── REGISTER ────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { mobile_number, country_code, deviceId, terms_and_condition_status, name, email, opt_marketing_mail } = req.body;

    if (!mobile_number || !country_code || !deviceId || !terms_and_condition_status) {
      return res.status(400).json({
        success: false,
        message: 'mobile_number, country_code, deviceId, and terms_and_condition_status are required',
      });
    }

    const result = await registerUser(
      { mobile_number, country_code, deviceId, terms_and_condition_status, name, email, opt_marketing_mail },
      req.file
    );

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY OTP ──────────────────────────────────────────────
export const verifyOtp = async (req, res, next) => {
  try {
    const { mobile_number, otp } = req.body;

    if (!mobile_number || !otp) {
      return res.status(400).json({
        success: false,
        message: 'mobile_number and otp are required',
      });
    }

    const result = await verifyUserOtp({ mobile_number, otp });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { mobile_number, deviceId } = req.body;

    if (!mobile_number || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'mobile_number and deviceId are required',
      });
    }

    const result = await loginUser({ mobile_number, deviceId });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── GET PROFILE ─────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user.id);

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── EDIT PROFILE ────────────────────────────────────────────
export const editProfile = async (req, res, next) => {
  try {
    const updatedUser = await editUserProfile(req.user.id, req.body, req.file);

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE PROFILE ──────────────────────────────────────────
export const deleteProfile = async (req, res, next) => {
  try {
    const result = await deleteUserProfile(req.user.id);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── TEMPORARY DELETE PROFILE ────────────────────────────────
export const tempDeleteProfile = async (req, res, next) => {
  try {
    const result = await temporaryDeleteProfile(req.user.id);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── REACTIVATE PROFILE ──────────────────────────────────────
export const reactivate = async (req, res, next) => {
  try {
    const result = await reactivateProfile(req.user.id);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const result = await logoutUser(req.user.id);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

