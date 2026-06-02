import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    mobile_number: {
      type: Number,
      required: [true, 'Mobile number is required'],
      unique: true,
    },

    country_code: {
      type: Number,
      required: [true, 'Country code is required'],
      trim: true,
    },

    name: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      default: null,
    },

    profile_photo: {
      type: String,
      default: null,
    },

    isAddToGroups: {
      type: Boolean,
      default: true,
    },

    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
    },

    refresh_token: {
      type: String,
      default: null,
    },

    access_token: {
      type: String,
      default: null,
    },

    account_status: {
      type: String,
      enum: ['activated', 'deactivated'],
      default: 'activated',
    },

    terms_and_condition_status: {
      type: String,
      enum: ['accept', 'decline'],
      required: [true, 'Terms & condition status is required'],
    },

    opt_marketing_mail: {
      type: Boolean,
      default: true,
    },

    opt_two_factor_auth: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
    },

    otp_expires_at: {
      type: Date,
      default: null,
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    cloudinary_public_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const User = mongoose.model('User', userSchema);

export { User };
