import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import {
  register,
  verifyOtp,
  login,
  getProfile,
  editProfile,
  deleteProfile,
  tempDeleteProfile,
  reactivate,
  logout,
} from '../controller/user.controller.js';

const router = Router();

// Public routes (no auth required)
router.post('/user/v1/register', uploadSingle, register);
router.post('/user/v1/verify-otp', verifyOtp);
router.post('/user/v1/login', login);

// Protected routes (auth required)
router.use(authMiddleware);

router.get('/user/v1/get-profile', getProfile);
router.put('/user/v1/edite-profile', uploadSingle, editProfile);
router.delete('/user/v1/delete-profile', deleteProfile);
router.patch('/user/v1/temporary-delete-profile', tempDeleteProfile);
router.patch('/user/v1/reactivate-profile', reactivate);
router.post('/user/v1/logout', logout);

export default router;
