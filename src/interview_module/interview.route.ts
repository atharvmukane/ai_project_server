import { verifyJwtToken } from "./../utils/middleware/verify-jwt-token";
import { addInterview, getInterviews, saveRecording } from "./interview.controller";
import { uploadAudio } from "./../middlewares/multer.middleware";

const express = require("express");
export const InterviewRouter = express.Router();


// api/interview/addInterview
InterviewRouter.post("/addInterview", addInterview);

// api/interview/getInterviews
InterviewRouter.get("/getInterviews", verifyJwtToken, getInterviews);

// api/interview/saveRecording
InterviewRouter.post("/saveRecording", uploadAudio.single('audio'), saveRecording);

InterviewRouter.post("/testUpload", uploadAudio.single('audio'), (req: Request, res: Response) => {
    console.log("Test Upload File:", req.file);
    if (!req.file) return res.status(400).json({ message: "No file received" });

    res.json({
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
    });
});