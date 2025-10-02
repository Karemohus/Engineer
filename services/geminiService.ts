
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { DesignAnalysis } from '../types';
import { Language } from "../localization";

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        imageAnalysis: {
            type: Type.OBJECT,
            properties: {
                roomType: { type: Type.STRING, description: "Type of room (e.g., Living Room, Bedroom, Office)." },
                features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key architectural features (e.g., 'Large window', 'Hardwood floors')."},
                lighting: { type: Type.STRING, description: "Description of the lighting conditions (e.g., 'Bright natural light')." },
                detectedFurniture: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of existing furniture items detected in the image."}
            },
        },
        designStyles: {
            type: Type.ARRAY,
            description: "Suggest 3 distinct interior design styles suitable for the space. If the user specified a style, it MUST be one of the three.",
            items: {
                type: Type.OBJECT,
                properties: {
                    styleName: { type: Type.STRING },
                    description: { type: Type.STRING, description: "Brief description of the style, followed by an explanation of why it is a good fit for the analyzed room." },
                    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyFurniture: { type: Type.ARRAY, items: { type: Type.STRING } },
                    lighting: { type: Type.ARRAY, items: { type: Type.STRING } },
                    decor: { type: Type.ARRAY, items: { type: Type.STRING } },
                    materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
            },
        },
        redesignConcept: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A catchy title for the redesign concept." },
                summaryOfChanges: { type: Type.STRING, description: "A brief, one-paragraph summary of the main changes made from the original room, based on the user's request." },
                layout: { type: Type.STRING, description: "Suggestions for spatial layout and furniture placement, incorporating the requested changes." },
                details: { type: Type.STRING, description: "Detailed description of how to furnish and decorate the space according to the new concept." },
                suggestedFurniture: {
                    type: Type.ARRAY,
                    description: "A list of key new or replacement furniture and decor items mentioned in the redesign concept.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "The name of the furniture or decor item (e.g., 'Velvet Sofa')." },
                            description: { type: Type.STRING, description: "A brief one-sentence description of the item." },
                        },
                        required: ["name", "description"]
                    }
                }
            },
        },
        dimensions: {
            type: Type.OBJECT,
            properties: {
                userProvidedDimensions: {
                    type: Type.OBJECT,
                    description: "The dimensions provided by the user, echoed back for display. If no dimensions were provided, this object can be omitted.",
                    properties: {
                        length: { type: Type.STRING },
                        width: { type: Type.STRING },
                        height: { type: Type.STRING },
                    }
                },
                estimatedArea: { type: Type.STRING, description: "Approximation of the room's area in sqm and sqft." },
                estimatedVolume: { type: Type.STRING, description: "Approximation of the room's volume in cbm and cft, if possible." },
            },
        },
        aiImagePrompts: {
            type: Type.OBJECT,
            description: "Generate three distinct, highly detailed prompts in English for AI image models to visualize the redesign concept.",
            properties: {
                photorealistic: { type: Type.STRING, description: "A prompt for an AI image EDITING model. This prompt will transform the user's original room photo into the redesigned space. It must describe REMOVING, REPLACING, or MODIFYING specific items from the original photo and adding new ones to match the redesign concept. For example: 'Remove the old brown sofa and replace it with a modern grey sectional. Change the wall color to a light sage green.' It should start with 'AI Image Editing Prompt: '." },
                threeD: { type: Type.STRING, description: "A prompt for an AI image GENERATION model. This should create a photorealistic 3D render of the fully furnished redesigned room from a beautiful, slightly angled perspective. Do not mention the original image." },
                twoD: { type: Type.STRING, description: "A prompt for an AI image GENERATION model. This should create a clean, 2D top-down architectural floor plan of the redesigned room, clearly showing the furniture layout and spacing. Use a simple, clear style." }
            },
            required: ["photorealistic", "threeD", "twoD"],
        },
        arabicSummary: {
            type: Type.OBJECT,
            description: "If the main language is English, provide a brief summary in Arabic. If the main language is Arabic, provide a brief summary in English.",
            properties: {
                title: { type: Type.STRING, description: "The redesign concept title in the secondary language." },
                concept: { type: Type.STRING, description: "A one-paragraph summary of the design concept in the secondary language." },
            },
        },
    },
};

const dimensionSchema = {
    type: Type.OBJECT,
    properties: {
        length: { type: Type.STRING, description: "Estimated length in meters, e.g., '5m'" },
        width: { type: Type.STRING, description: "Estimated width in meters, e.g., '4m'" },
        height: { type: Type.STRING, description: "Estimated height in meters, e.g., '2.5m'" },
    },
    required: ["length", "width", "height"],
};

export const estimateDimensions = async (imageFile: File): Promise<{ length: string; width: string; height: string; }> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze the provided image of a room and estimate its dimensions. Provide the length, width, and height in meters (e.g., '5m'). Your response must be only a JSON object matching the schema. Be as accurate as possible based on common objects in the photo for scale.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                imagePart
            ],
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: dimensionSchema,
        },
    });

    const text = response.text.trim();
    try {
        return JSON.parse(text) as { length: string; width: string; height: string; };
    } catch (e) {
        console.error("Failed to parse dimension estimation response as JSON:", text);
        throw new Error("Received an invalid response from the AI for dimensions.");
    }
};

export const analyzeImage = async (imageFile: File, furnitureFiles: File[], style: string, customItems: string, redesignInstructions: string, length: string, width: string, height: string, lang: Language): Promise<DesignAnalysis> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imageParts = [await fileToGenerativePart(imageFile)];
    for (const file of furnitureFiles) {
        imageParts.push(await fileToGenerativePart(file));
    }

    let dimensionsPromptSection = "The user did not provide dimensions. Estimate them from the image.";
    if (length || width || height) {
        dimensionsPromptSection = `The user has provided the following dimensions: Length: "${length || 'Not provided'}", Width: "${width || 'Not provided'}", Height: "${height || 'Not provided'}".`;
    }

    const languageInstructions = lang === 'ar' 
        ? "The user has selected Arabic. The entire JSON response, including all descriptions, titles, and suggestions, MUST be in Arabic. The ONLY exception is the 'aiImagePrompts' field, which MUST remain in English. The 'arabicSummary' field should be used to provide a brief summary in ENGLISH."
        : "The user has selected English. The entire JSON response MUST be in English, except for the 'arabicSummary' field which must contain a brief summary in ARABIC.";

    let furniturePromptSection = "The user has not provided their own furniture images to add.";
    if (furnitureFiles.length > 0) {
        furniturePromptSection = `CRITICAL: The user has provided ${furnitureFiles.length} images of their own furniture to incorporate. Your redesign concept must include placing these new items into the room. The first image provided is the room to be redesigned, all subsequent images are the new furniture items.`;
    }
    
    let prompt = `You are a professional interior design AI. Your task is to analyze an image of a furnished room and create a redesign concept based on the user's instructions.

    **Language Instructions:**
    ${languageInstructions}
    
    **Furniture Instructions:**
    ${furniturePromptSection}

    **User Preferences & Instructions:**
    - **Chosen Style:** "${style}"
    - **Specific New Items to Add:** "${customItems || 'None'}"
    - **Redesign Instructions:** "${redesignInstructions || 'The user did not provide specific instructions. Propose a general improvement to the space based on design principles.'}"
    - **Provided Dimensions:** ${dimensionsPromptSection}

    **Instructions:**
    1.  **Analyze Image:** In detail, identify the room type, architectural elements, lighting, AND any existing furniture in the main room image (the first image). List the detected furniture in the 'detectedFurniture' field.
    2.  **Redesign Concept:** Create a detailed redesign concept based on the user's redesign instructions.
        - If the user provided furniture images, you MUST incorporate them.
        - If the user chose a style other than 'AI Suggests', you MUST base the concept on the "${style}" style.
        - If the user provided custom text items, incorporate them.
        - Create a list of suggested new or replacement furniture/decor in the 'suggestedFurniture' field.
        - Summarize the key changes you made from the original in the 'summaryOfChanges' field.
    3.  **Propose 3 Styles:** Suggest three distinct interior design styles suitable for the space. The style used for the main redesign concept must be one of these three.
    4.  **Dimensions:**
        - If the user provided dimensions, echo them back in the 'userProvidedDimensions' object.
        - Calculate and provide the 'estimatedArea' and 'estimatedVolume'.
    5.  **AI Image Prompts:** Generate three distinct, highly detailed AI image prompts (photorealistic, 3D, 2D) as described in the schema. The photorealistic prompt is crucial for editing the original image based on your redesign. All prompts MUST be in English.
    6.  **Secondary Language Summary:** Provide a summary as per the language instructions.

    Your entire response MUST conform to the provided JSON schema. Do not output anything other than the JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                ...imageParts
            ],
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        },
    });
    
    const text = response.text.trim();
    try {
        const parsedJson = JSON.parse(text);
        if (parsedJson.aiImagePrompts?.photorealistic) {
            parsedJson.aiImagePrompts.photorealistic = parsedJson.aiImagePrompts.photorealistic.replace(/^AI Image (Editing )?Prompt: /i, '');
        }
        return parsedJson as DesignAnalysis;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", text);
        throw new Error("Received an invalid response from the AI. Please try again.");
    }
};

export const visualizeDesign = async (imageFile: File, furnitureFiles: File[], prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imageParts = [await fileToGenerativePart(imageFile)];
    for (const file of furnitureFiles) {
        imageParts.push(await fileToGenerativePart(file));
    }

    const fullPrompt = `IMPORTANT: This is an in-painting and image editing task. You MUST modify the first image (the room) according to the instructions. This may involve removing existing furniture, changing colors of walls or objects, and adding new items. The original room's architecture (windows, doors, floor plan) should remain the same unless specified. The subsequent images are new furniture items to be placed, if any were provided. Instructions: ${prompt}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                ...imageParts,
                { text: fullPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    
    throw new Error("Image editing failed to produce an image.");
};


export const generateImageView = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '4:3',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }

    throw new Error("Image generation failed to produce an image.");
};
