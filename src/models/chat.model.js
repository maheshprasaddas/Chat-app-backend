import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["direct", "group"],
            required: true,
        },

        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null,
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        lastMessage: {
            type: String,
            default: "",
        },

        lastMessageBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        lastMessageAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

/*
 * Most common query:
 * Get all chats of a user
 */
chatSchema.index({
    participants: 1,
});

/*
 * Sort chats by recent activity
 */
chatSchema.index({
    lastMessageAt: -1,
});

export default mongoose.model(
    "Chat",
    chatSchema
);