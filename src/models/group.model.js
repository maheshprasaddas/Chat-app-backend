import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        profileImage: {
            type: String,
            default: null,
        },

        description: {
            type: String,
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Group",
    groupSchema
);