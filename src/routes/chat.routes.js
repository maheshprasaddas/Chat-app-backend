import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createGroup,
  getChats,
  getChat,
  editGroup,
  removeGroup,
  addGroupMember,
  removeGroupMember,
} from "../controller/chat.controller.js";

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);



// ─── GROUP CRUD ─────────────────────────────────────────────
router.post("/chat/v1/group", createGroup);
router.put("/chat/v1/group/:chatId", editGroup);
router.delete("/chat/v1/group/:chatId", removeGroup);

// ─── MEMBERS ────────────────────────────────────────────────
router.post("/chat/v1/group/:chatId/members", addGroupMember);
router.delete("/chat/v1/group/:chatId/members", removeGroupMember);

// ─── CHAT LIST & DETAIL ─────────────────────────────────────
router.get("/chat/v1/chats", getChats);
router.get("/chat/v1/chats/:chatId", getChat);

export default router;
