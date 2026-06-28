import {
  createDirectChat,
  createGroupChat,
  getUserChats,
  getChatById,
  addMember,
  removeMember,
  updateGroup,
  deleteGroup,
} from "../services/chat.service.js";
import { getUser } from "../services/redisUser.service.js";
import { getIO } from "../sockets/socket.js";
import logger from "../config/logger.js";

// ─── Helper: notify all online participants ─────────────────
const notifyParticipants = async (participantIds, event, data) => {
  const io = getIO();
  for (const id of participantIds) {
    const user = await getUser(id.toString());
    if (user && user.socketId) {
      io.to(user.socketId).emit(event, data);
    }
  }
};

// ─── CREATE DIRECT CHAT ─────────────────────────────────────
export const createDirect = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "receiverId is required",
      });
    }

    const chat = await createDirectChat(senderId, receiverId);

    return res.status(201).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE GROUP CHAT ──────────────────────────────────────
export const createGroup = async (req, res, next) => {
  try {
    const { name, description, profileImage, members = [] } = req.body;
    const createdBy = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    const { chat, group } = await createGroupChat({
      name,
      description,
      profileImage,
      createdBy,
      members,
    });

    // Notify all members that they've been added to a new group
    const participantIds = chat.participants.map((p) => p.toString());
    await notifyParticipants(participantIds, "group-created", {
      chat,
      group,
    });

    return res.status(201).json({ success: true, data: { chat, group } });
  } catch (error) {
    next(error);
  }
};

// ─── GET USER CHATS ─────────────────────────────────────────
export const getChats = async (req, res, next) => {
  try {
    const chats = await getUserChats(req.user.id);

    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    next(error);
  }
};

// ─── GET CHAT BY ID ─────────────────────────────────────────
export const getChat = async (req, res, next) => {
  try {
    const chat = await getChatById(req.params.chatId);

    return res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE GROUP ───────────────────────────────────────────
export const editGroup = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const requesterId = req.user.id;

    const { chat, group } = await updateGroup(chatId, requesterId, req.body);

    // Notify all participants about the group update
    const participantIds = chat.participants.map((p) => p.toString());
    await notifyParticipants(participantIds, "group-updated", {
      chatId,
      group: {
        name: group.name,
        description: group.description,
        profileImage: group.profileImage,
      },
      updatedBy: requesterId,
    });

    return res.status(200).json({ success: true, data: { chat, group } });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE GROUP ────────────────────────────────────────────
export const removeGroup = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const requesterId = req.user.id;

    const { groupId, participantIds } = await deleteGroup(chatId, requesterId);

    // Notify all previous participants that the group has been deleted
    await notifyParticipants(participantIds, "group-deleted", {
      chatId,
      groupId,
      deletedBy: requesterId,
    });

    return res.status(200).json({
      success: true,
      data: { message: "Group deleted successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADD MEMBER ─────────────────────────────────────────────
export const addGroupMember = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    const requesterId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const chat = await addMember(chatId, userId, requesterId);

    // Notify all participants (including the newly added member)
    const participantIds = chat.participants.map((p) => p.toString());
    await notifyParticipants(participantIds, "member-added", {
      chatId,
      userId,
      addedBy: requesterId,
    });

    return res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

// ─── REMOVE MEMBER ──────────────────────────────────────────
export const removeGroupMember = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    const requesterId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Capture participants before removal to notify the removed user too
    const chatBefore = await getChatById(chatId);
    const previousParticipantIds = chatBefore.participants.map((p) =>
      p._id.toString()
    );

    await removeMember(chatId, userId, requesterId);

    // Notify all previous participants (including the removed one)
    await notifyParticipants(previousParticipantIds, "member-removed", {
      chatId,
      userId,
      removedBy: requesterId,
    });

    return res.status(200).json({
      success: true,
      data: { message: "Member removed successfully" },
    });
  } catch (error) {
    next(error);
  }
};
