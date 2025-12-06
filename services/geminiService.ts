
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult, VerificationThreshold } from "../types";

// Clean base64 string (remove data:image/png;base64, prefix if present)
const cleanBase64 = (data: string) => {
  return data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const urlToBase64 = async (url: string): Promise<string> => {
    if (!url.startsWith('http')) return url; // Already base64 or local path
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Failed to convert image", e);
        return "";
    }
};

export const verifyFace = async (
  referenceImages: string[], // Array of reference images
  liveCaptureBase64: string,
  threshold: VerificationThreshold = 'medium'
): Promise<VerificationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Prepare Reference Images (limit to 5 to avoid token limits, taking the newest ones)
  const refsToUse = referenceImages.slice(0, 5);
  const processedRefs = await Promise.all(refsToUse.map(async (img) => cleanBase64(await urlToBase64(img))));
  const cleanLive = cleanBase64(liveCaptureBase64);

  // 2. Build Content Parts
  const parts: any[] = [];
  
  // Add reference images
  processedRefs.forEach((refData) => {
      if(refData) {
        parts.push({
            inlineData: { mimeType: 'image/jpeg', data: refData }
        });
      }
  });

  // Add live image (The LAST image in the sequence)
  parts.push({
    inlineData: { mimeType: 'image/jpeg', data: cleanLive }
  });

  // 3. Define Prompt based on Threshold
  let strictnessInstruction = "";
  switch(threshold) {
      case 'strict':
          strictnessInstruction = "BE EXTREMELY STRICT. The person must match perfectly. Do not tolerate significant differences in facial structure. Reject if the match is ambiguous.";
          break;
      case 'lenient':
          strictnessInstruction = "BE LENIENT. Focus on general bone structure. Ignore differences in glasses, facial hair, makeup, or slight aging. Accept if it's reasonably the same person.";
          break;
      default: // medium
          strictnessInstruction = "Be balanced. Focus on underlying facial bone structure (eyes, nose, jawline). Be lenient with lighting changes but ensure it is the same individual.";
  }

  // Add text prompt
  parts.push({
    text: `You are an automated attendance security officer. 
    I have provided ${processedRefs.length} reference photos of a student, followed by 1 live capture photo at the very end.
    
    Compare the LAST photo (Live Capture) against the group of REFERENCE photos provided before it.
    Determine if the person in the live capture is the same person as in the reference photos.
    
    ${strictnessInstruction}
    
    Return a JSON object with:
    - match: boolean (true if same person)
    - confidence: number (0.0 to 1.0)
    - reason: string (short explanation)`
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["match", "confidence", "reason"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini");

    const result = JSON.parse(resultText) as VerificationResult;
    return result;

  } catch (error) {
    console.error("Gemini verification failed:", error);
    return {
      match: false,
      confidence: 0,
      reason: "API Error or processing failure."
    };
  }
};
