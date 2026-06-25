import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            trim: true,
        },

        messageType: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "audio",
                "file",
                "location",
                "system",
            ],
            default: "text",
        },

        attachmentUrl: {
            type: String,
        },

        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },

        deliveredTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],

        seenBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],

        isEdited: {
            type: Boolean,
            default: false,
        },

        editedAt: {
            type: Date,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({
    chatId: 1,
    createdAt: -1,
});

export default mongoose.model(
    "Message",
    messageSchema
);