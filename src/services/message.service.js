import Message from "../models/message.model.js";
import { updateLastMessage } from "./chat.service.js";
import logger from "../config/logger.js";

// ─── CREATE MESSAGE ──────────────────────────────────────────
export const createMessage = async ({
  chatId,
  senderId,
  content,
  messageType = "text",
  attachmentUrl = null,
}) => {
  const message = await Message.create({
    chatId,
    senderId,
    content,
    messageType,
    ...(attachmentUrl && { attachmentUrl }),
  });

  logger.debug({ messageId: message._id, chatId }, "Message created");
  return message;
};

// ─── UPDATE MESSAGE ──────────────────────────────────────────
export const updateMessage = async (messageId, senderId, newContent) => {
  const message = await Message.findById(messageId);

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  if (message.senderId.toString() !== senderId.toString()) {
    const error = new Error("You can only edit your own messages");
    error.statusCode = 403;
    throw error;
  }

  if (message.isDeleted) {
    const error = new Error("Cannot edit a deleted message");
    error.statusCode = 400;
    throw error;
  }

  message.content = newContent;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  logger.debug({ messageId }, "Message updated");
  return message;
};

// ─── DELETE MESSAGE (Soft Delete) ────────────────────────────
export const deleteMessage = async (messageId, senderId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  if (message.senderId.toString() !== senderId.toString()) {
    const error = new Error("You can only delete your own messages");
    error.statusCode = 403;
    throw error;
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = "";
  await message.save();

  logger.debug({ messageId }, "Message soft-deleted");
  return message;
};

// ─── REPLY TO MESSAGE ────────────────────────────────────────
export const replyMessage = async ({
  chatId,
  senderId,
  content,
  replyTo,
  messageType = "text",
  attachmentUrl = null,
}) => {
  // Verify the original message exists
  const originalMessage = await Message.findById(replyTo);
  if (!originalMessage) {
    const error = new Error("Original message not found");
    error.statusCode = 404;
    throw error;
  }

  const message = await Message.create({
    chatId,
    senderId,
    content,
    messageType,
    replyTo,
    ...(attachmentUrl && { attachmentUrl }),
  });

  logger.debug({ messageId: message._id, replyTo }, "Reply created");
  return message;
};

// ─── GET MESSAGES (Paginated) ────────────────────────────────
export const getMessages = async (chatId, { page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const messages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId", "name profile_photo")
    .populate("replyTo", "content senderId");

  const total = await Message.countDocuments({ chatId });

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// ─── SEND MESSAGE (Orchestrator) ─────────────────────────────
// Creates the message in DB and updates the chat's lastMessage fields
export const sendMessage = async ({
  chatId,
  senderId,
  content,
  messageType = "text",
  attachmentUrl = null,
  replyTo = null,
}) => {
  let message;

  if (replyTo) {
    message = await replyMessage({
      chatId,
      senderId,
      content,
      replyTo,
      messageType,
      attachmentUrl,
    });
  } else {
    message = await createMessage({
      chatId,
      senderId,
      content,
      messageType,
      attachmentUrl,
    });
  }

  // Update the chat's last message metadata
  await updateLastMessage(chatId, senderId, content);

  // Populate sender info before returning
  await message.populate("senderId", "name profile_photo");
  if (message.replyTo) {
    await message.populate("replyTo", "content senderId");
  }

  logger.debug({ messageId: message._id, chatId, senderId }, "Message sent");
  return message;
};

// ─── GET UNDELIVERED MESSAGES ────────────────────────────────
// Fetches all messages in the user's chats that haven't been
// delivered to them yet (used for offline → online sync)
export const getUndeliveredMessages = async (userId, chatIds) => {
  if (!chatIds || chatIds.length === 0) return [];

  const messages = await Message.find({
    chatId: { $in: chatIds },
    senderId: { $ne: userId },          // don't re-deliver own messages
    deliveredTo: { $ne: userId },       // not yet delivered to this user
    isDeleted: false,
  })
    .sort({ createdAt: 1 })
    .populate("senderId", "name profile_photo")
    .populate("replyTo", "content senderId");

  return messages;
};

// ─── MARK AS DELIVERED ──────────────────────────────────────
// Adds userId to the deliveredTo array for the given messages
export const markAsDelivered = async (messageIds, userId) => {
  if (!messageIds || messageIds.length === 0) return;

  await Message.updateMany(
    {
      _id: { $in: messageIds },
      deliveredTo: { $ne: userId },
    },
    {
      $addToSet: { deliveredTo: userId },
    }
  );

  logger.debug({ userId, count: messageIds.length }, "Messages marked as delivered");
};
