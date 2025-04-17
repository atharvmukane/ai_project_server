import { Response, Request, NextFunction } from "express";
import { OpenAI } from "openai";
import { FlowUserModel } from "../userModule/user.model";
import fs from "fs";
import pdfParse from "pdf-parse";
import { InterviewModel } from "./interview.model";
import path from 'path';
import FormData from 'form-data';

// const axios = require("axios").default;

import axios from 'axios';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export function parseNumberedQuestions(rawText: string): string[] {
    // Step 1: Normalize newlines and trim spaces
    const cleaned = rawText
        .replace(/\r/g, "")        // remove carriage returns
        .replace(/\n\s*\n/g, "\n") // remove extra blank lines
        .trim();

    // Step 2: Use regex to split based on "1. ", "2. ", etc.
    const questionList = cleaned
        .split(/\n?\d+\.\s+/)      // split at numbers like 1. 2. 3.
        .filter(q => q.trim().length > 0) // remove empty entries
        .map(q => q.trim());       // trim each question

    return questionList;
}


export const addInterview = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {

        console.log("BODY:", req.body);       // ✅ Should now be present
        console.log("FILES:", req.files);     // ✅ Should now be present

        const resumeFile = req.files['resume'];

        if (!resumeFile) {
            return res.status(400).json({
                message: "Resume file missing",
                success: false,
            });
        }


        let {
            date,
            user,
            jobTitle,
            company,
            jobDescription,
            industry,
            skills,
            sessionId = "",
        } = req.body;

        skills = JSON.parse(skills);
        date = new Date(date);

        // ✅ Get resume text
        // const buffer = fs.readFileSync(resumeFile.path);
        const parsed = await pdfParse(resumeFile.data);
        const resumeText = parsed.text
            .replace(/\u0000/g, "")                      // Remove NULL chars
            .replace(/\n{2,}/g, "\n")                    // Collapse multiple line breaks
            .replace(/[^\x00-\x7F]/g, "")                // (Optional) Remove non-ASCII characters
            .trim();


        // Compose prompt
        const prompt = `
Based on the following information, generate 5 personalized interview questions:

Resume: ${resumeText}
Job Title: ${jobTitle}
Company: ${company}
Industry: ${industry}
Job Description: ${jobDescription}
Skills: ${skills}

The questions should be relevant to the job title and challenge the candidate's experience.
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an expert technical interviewer." },
                { role: "user", content: prompt },
            ],
        });

        const responseText = completion.choices[0].message?.content;

        const questionsList = parseNumberedQuestions(responseText!);
        let interviewData: any = [];
        questionsList.forEach((question, index) => {
            interviewData.push({
                index: index,
                question: question,
                answer: '',
                analaysis: {},
            });
        });

        if (!responseText) {
            return res.status(200).json({
                message: "failedToGetResponse",
                success: false,
            });
        }

        console.log(responseText);

        const interview = await InterviewModel.create({
            date: date,
            jobTitle,
            company,
            jobDescription,
            industry,
            skills,
            user,
            interviewQAA: interviewData,
        });

        return res.status(200).json({
            message: "responseReceived",
            success: interview != null,
            result: interview,
        });


    } catch (e) {
        console.log(e);
        return res.status(400).json({
            message: "failedToGetResponse",
            success: false,
            error: e,
        });
    }
};


export const getInterviews = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {

        let { user } = req.body;


        const interviews = await InterviewModel.find({
            user: user,
            date: { $gte: new Date() },
        })
            .sort({ date: 1 });

        return res.status(200).json({
            message: "responseReceived",
            success: interviews != null,
            result: interviews,
        });

    } catch (e) {
        console.log(e);
        return res.status(400).json({
            message: "Failed to get scheduled interviews",
            success: false,
            error: e,
        });
    }
};



export const saveRecording = async (req: Request, res: Response) => {
    try {

        console.log("DEBUG: req.file", req.file);
        let files: any = req.files;

        // const imageType = files["audio"].mimetype.replace('application/', '.');
        // const imagePath = files["audio"].tempFilePath + imageType;
        // fs.renameSync(files["audio"].tempFilePath, imagePath);

        let audioFile = req.file;
        // let audioFile = files.audio;
        if (!audioFile) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const audioPath = path.resolve(audioFile.path);
        const formData = new FormData();
        formData.append('file', fs.createReadStream(`${audioPath}`));
        formData.append('model', 'whisper-1'); // OpenAI Whisper model

        const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            formData,
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    ...formData.getHeaders(),
                },
            }
        );

        return res.status(200).json({
            transcription: response.data.text,
        });

    } catch (error: any) {
        console.error('Transcription Error:', error?.response?.data || error.message);
        return res.status(500).json({
            message: 'Failed to transcribe audio',
            error: error?.response?.data || error.message,
        });
    }
};