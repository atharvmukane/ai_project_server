import { uploadMiddleware } from "./../utils/middleware/multer.upload";
import { createMessage, generateQuestions } from "./chatgpt.controller";

const express = require("express");
export const ChatGPTRouter = express.Router();

// api/chatgpt/createMessage
ChatGPTRouter.post("/createMessage", createMessage);


// api/chatgpt/generateQuestions
ChatGPTRouter.post("/generateQuestions", generateQuestions);
