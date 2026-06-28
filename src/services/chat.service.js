import Chat from "../models/chat.model.js";
import Group from "../models/group.model.js";
import logger from "../config/logger.js";

// ─── CREATE DIRECT CHAT ─────────────────────────────────────
export const createDirectChat = async (userId1, userId2) => {
  // Check if a direct chat already exists between these two users
  const existingChat = await Chat.findOne({
    type: "direct",
    participants: { $all: [userId1, userId2], $size: 2 },
  });

  if (existingChat) {
    logger.debug(
      { chatId: existingChat._id },
      "Direct chat already exists, returning existing"
    );
    return existingChat;
  }

  const chat = await Chat.create({
    type: "direct",
    participants: [userId1, userId2],
  });

  logger.debug({ chatId: chat._id }, "Direct chat created");
  return chat;
};

// ─── CREATE GROUP CHAT ──────────────────────────────────────
export const createGroupChat = async ({
  name,
  description = null,
  profileImage = null,
  createdBy,
  members = [],
}) => {
  // Create the Group document first
  const allMembers = [...new Set([createdBy, ...members])];

  const group = await Group.create({
    name,
    description,
    profileImage,
    createdBy,
    admins: [createdBy],
    members: allMembers,
  });

  // Create the Chat document linked to the group
  const chat = await Chat.create({
    type: "group",
    groupId: group._id,
    participants: allMembers,
  });

  logger.debug({ chatId: chat._id, groupId: group._id }, "Group chat created");
  return { chat, group };
};

// ─── GET USER CHATS ─────────────────────────────────────────
export const getUserChats = async (userId) => {
  const chats = await Chat.find({ participants: userId })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .populate("participants", "name profile_photo mobile_number")
    .populate("groupId", "name profileImage description admins");

  return chats;
};

// ─── GET CHAT BY ID ─────────────────────────────────────────
export const getChatById = async (chatId) => {
  const chat = await Chat.findById(chatId)
    .populate("participants", "name profile_photo mobile_number")
    .populate("groupId", "name profileImage description admins members");

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }

  return chat;
};

// ─── ADD MEMBER (Group Only) ────────────────────────────────
export const addMember = async (chatId, userId, requesterId) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }

  if (chat.type !== "group") {
    const error = new Error("Cannot add members to a direct chat");
    error.statusCode = 400;
    throw error;
  }

  // Verify requester is an admin of the group
  const group = await Group.findById(chat.groupId);
  if (!group.admins.some((id) => id.toString() === requesterId.toString())) {
    const error = new Error("Only admins can add members");
    error.statusCode = 403;
    throw error;
  }

  // Add to both Group.members and Chat.participants
  if (!group.members.some((id) => id.toString() === userId.toString())) {
    group.members.push(userId);
    await group.save();
  }

  if (!chat.participants.some((id) => id.toString() === userId.toString())) {
    chat.participants.push(userId);
    await chat.save();
  }

  logger.debug({ chatId, userId }, "Member added to group chat");
  return chat;
};

// ─── REMOVE MEMBER (Group Only) ─────────────────────────────
export const removeMember = async (chatId, userId, requesterId) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }

  if (chat.type !== "group") {
    const error = new Error("Cannot remove members from a direct chat");
    error.statusCode = 400;
    throw error;
  }

  const group = await Group.findById(chat.groupId);

  // Only admins can remove, OR a user can remove themselves
  const isAdmin = group.admins.some(
    (id) => id.toString() === requesterId.toString()
  );
  const isSelf = userId.toString() === requesterId.toString();

  if (!isAdmin && !isSelf) {
    const error = new Error("Only admins can remove members");
    error.statusCode = 403;
    throw error;
  }

  // Remove from Group.members and Chat.participants
  group.members = group.members.filter(
    (id) => id.toString() !== userId.toString()
  );
  await group.save();

  chat.participants = chat.participants.filter(
    (id) => id.toString() !== userId.toString()
  );
  await chat.save();

  logger.debug({ chatId, userId }, "Member removed from group chat");
  return chat;
};

// ─── UPDATE GROUP ───────────────────────────────────────────
export const updateGroup = async (chatId, requesterId, updateData) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }

  if (chat.type !== "group") {
    const error = new Error("This is not a group chat");
    error.statusCode = 400;
    throw error;
  }

  const group = await Group.findById(chat.groupId);

  // Only admins can update group details
  if (!group.admins.some((id) => id.toString() === requesterId.toString())) {
    const error = new Error("Only admins can update group details");
    error.statusCode = 403;
    throw error;
  }

  const allowedFields = ["name", "description", "profileImage"];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      group[field] = updateData[field];
    }
  });

  await group.save();

  logger.debug({ chatId, groupId: group._id }, "Group updated");
  return { chat, group };
};

// ─── DELETE GROUP ────────────────────────────────────────────
export const deleteGroup = async (chatId, requesterId) => {
  const chat = await Chat.findById(chatId)
    .populate("participants", "_id");

  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }

  if (chat.type !== "group") {
    const error = new Error("This is not a group chat");
    error.statusCode = 400;
    throw error;
  }

  const group = await Group.findById(chat.groupId);

  // Only the group creator can delete
  if (group.createdBy.toString() !== requesterId.toString()) {
    const error = new Error("Only the group creator can delete the group");
    error.statusCode = 403;
    throw error;
  }

  // Capture participants before deletion for notifications
  const participantIds = chat.participants.map((p) => p._id.toString());

  // Deactivate the group and remove the chat
  group.isActive = false;
  group.members = [];
  await group.save();
  await Chat.findByIdAndDelete(chatId);

  logger.debug({ chatId, groupId: group._id }, "Group deleted");
  return { groupId: group._id, participantIds };
};

// ─── UPDATE LAST MESSAGE ────────────────────────────────────
export const updateLastMessage = async (chatId, senderId, content) => {
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: content,
    lastMessageBy: senderId,
    lastMessageAt: new Date(),
  });

  logger.debug({ chatId }, "Last message updated");
};
