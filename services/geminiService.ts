
import { GoogleGenAI, Type } from "@google/genai";
import { SwingReport, ComparativeReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SWING_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    estimatedStats: {
      type: Type.OBJECT,
      properties: {
        exitVelocity: { type: Type.STRING },
        launchAngle: { type: Type.STRING },
        batSpeed: { type: Type.STRING },
      },
      required: ["exitVelocity", "launchAngle", "batSpeed"],
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        stance: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            drills: { type: Type.ARRAY, items: { type: Type.STRING } },
            timestamp: { type: Type.STRING, description: "Format '0:00'. The exact moment the stance is set." },
          },
          required: ["score", "feedback", "drills", "timestamp"],
        },
        load: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            drills: { type: Type.ARRAY, items: { type: Type.STRING } },
            timestamp: { type: Type.STRING, description: "Format '0:00'. The moment the weight shifts back." },
          },
          required: ["score", "feedback", "drills", "timestamp"],
        },
        path: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            drills: { type: Type.ARRAY, items: { type: Type.STRING } },
            timestamp: { type: Type.STRING, description: "Format '0:00'. The point of contact." },
          },
          required: ["score", "feedback", "drills", "timestamp"],
        },
        followThrough: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            drills: { type: Type.ARRAY, items: { type: Type.STRING } },
            timestamp: { type: Type.STRING, description: "Format '0:00'. The peak of the finish." },
          },
          required: ["score", "feedback", "drills", "timestamp"],
        },
      },
      required: ["stance", "load", "path", "followThrough"],
    },
    keyIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING },
  },
  required: ["overallScore", "estimatedStats", "metrics", "keyIssues", "summary"],
};

export async function analyzeSwingVideo(videoBase64: string, mimeType: string): Promise<SwingReport> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: videoBase64, mimeType } },
          { text: "Act as an MLB coach. Analyze this baseball swing video frame-by-frame. Provide specific timestamps (0:00) for the start of each phase (Stance, Load, Contact/Path, Follow-through). Be critical about mechanics and output in JSON format." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: SWING_ANALYSIS_SCHEMA,
      },
    });
    if (!response.text) throw new Error("No analysis received.");
    return JSON.parse(response.text.trim()) as SwingReport;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function compareSwings(videoABase64: string, videoBBase64: string, mimeType: string): Promise<ComparativeReport> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: videoABase64, mimeType } },
          { inlineData: { data: videoBBase64, mimeType } },
          { 
            text: `Analyze these two baseball swings side-by-side. 
            Video A is the "Before" or "Reference" swing. 
            Video B is the "Current" swing.
            Highlight improvements in mechanics, timing, and power generation.
            Identify any regressions. 
            Output a JSON comparison report.` 
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: COMPARISON_SCHEMA,
      },
    });
    if (!response.text) throw new Error("No comparison received.");
    return JSON.parse(response.text.trim()) as ComparativeReport;
  } catch (error) {
    console.error("Gemini Comparison Error:", error);
    throw error;
  }
}

const COMPARISON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    comparisonSummary: { type: Type.STRING },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    regressions: { type: Type.ARRAY, items: { type: Type.STRING } },
    metricDeltas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          change: { type: Type.STRING },
          direction: { type: Type.STRING, enum: ["better", "worse", "neutral"] },
        },
        required: ["label", "change", "direction"],
      },
    },
  },
  required: ["comparisonSummary", "improvements", "regressions", "metricDeltas"],
};
