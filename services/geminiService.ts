

import { GoogleGenAI, GenerateContentResponse, Type, GenerateImagesResponse } from "@google/genai";
import { type ColorPalette, type ResearchSummary, type DebugResult, type EmojiRiddle, type MathSolution, type HistoryStory, type PlagiarismResult, type FoundSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonFromMarkdown = <T,>(text: string): T | null => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error("Failed to parse JSON from markdown", e);
            return null;
        }
    }
    try {
        return JSON.parse(text);
    } catch(e) {
        // Fallback for cases where the model doesn't use markdown
        console.warn("Failed to parse plain text as JSON, but continuing.", e);
        return null;
    }
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
            const result = reader.result as string;
            // remove data:mime/type;base64, part
            resolve(result.substring(result.indexOf(',') + 1));
        };
        reader.onerror = error => reject(error);
    });
};

export const summarizeText = async (text: string, length: 'short' | 'medium' | 'long'): Promise<string> => {
    let lengthPrompt = 'in a few concise paragraphs';
    if (length === 'short') {
        lengthPrompt = 'in a single, concise paragraph';
    } else if (length === 'long') {
        lengthPrompt = 'in a detailed, multi-paragraph format';
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Summarize the following text ${lengthPrompt}:\n\n---\n\n${text}`,
            config: {
                temperature: 0.3,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing text:", error);
        throw new Error("Failed to generate summary. Please try again later.");
    }
};

export const expandOrRewriteText = async (text: string, mode: 'expand' | 'rewrite', tone: string, creativity: number, length: number): Promise<string> => {
    let prompt = '';
    const lengthMap = { 1: "slightly", 2: "moderately", 3: "significantly" };
    // @ts-ignore
    const lengthAdverb = lengthMap[length] || "moderately";

    if (mode === 'expand') {
        prompt = `Expand on the following text, ${lengthAdverb} adding more detail and context. The desired tone is ${tone}:\n\n---\n\n${text}`;
    } else { // rewrite
        prompt = `Rewrite the following text to be ${tone}. Adjust its length ${lengthAdverb} based on the original. Do not add new information, just change the style and phrasing:\n\n---\n\n${text}`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: creativity,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error processing text:", error);
        throw new Error("Failed to process text. Please try again later.");
    }
};

export const generateCodeSnippet = async (prompt: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an expert code generation assistant. You will be given a prompt in natural language and you must respond with ONLY the code snippet in a markdown block for the requested language. Do not add any explanation, conversation, or any text outside of the code block.",
                temperature: 0.1
            }
        });

        // The model should return a markdown block. We extract just the text.
        const codeBlock = response.text.match(/```(?:\w+)?\n([\s\S]+)```/);
        return codeBlock ? codeBlock[1].trim() : response.text.trim();

    } catch (error) {
        console.error("Error generating code:", error);
        throw new Error("Failed to generate code. Please try again later.");
    }
}

export const generatePaletteFromImage = async (base64Image: string, mimeType: string): Promise<ColorPalette> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "Analyze this image and generate a harmonious color palette of 5-7 colors. For each color, provide its hex code and a descriptive name (e.g., 'Midnight Blue', 'Sunset Orange')."
        };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        palette: {
                            type: Type.ARRAY,
                            description: 'An array of color objects representing the generated palette.',
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    hex: {
                                        type: Type.STRING,
                                        description: "The hex code of the color, e.g., '#RRGGBB'."
                                    },
                                    name: {
                                        type: Type.STRING,
                                        description: 'A descriptive name for the color.'
                                    }
                                },
                                required: ["hex", "name"]
                            }
                        }
                    },
                    required: ["palette"]
                },
                temperature: 0.8,
            }
        });

        const jsonStr = response.text.trim();
        const result = parseJsonFromMarkdown<ColorPalette>(jsonStr);

        if (result && result.palette) {
            return result;
        } else {
            throw new Error("API returned an invalid palette structure.");
        }
    } catch (error) {
        console.error("Error generating color palette:", error);
        throw new Error("Failed to generate a color palette from this image.");
    }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Translate the following text to ${targetLanguage}:\n\n---\n\n${text}`,
            config: {
                temperature: 0.2,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error translating text:", error);
        throw new Error("Failed to translate text. Please try again later.");
    }
};

export const generateImageFromPrompt = async (prompt: string, negativePrompt: string, aspectRatio: string, style: string): Promise<string> => {
    let fullPrompt = prompt;
    if (style) {
        fullPrompt = `${prompt}, ${style}`;
    }
    if (negativePrompt) {
        fullPrompt = `${fullPrompt} | negative prompt: ${negativePrompt}`;
    }

    try {
        const response: GenerateImagesResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("The API did not return any images.");
        }

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please try adjusting your prompt.");
    }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    try {
        const audioPart = {
            inlineData: {
                data: base64Audio,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "Transcribe the audio. If there are multiple speakers, label them as 'Speaker 1', 'Speaker 2', etc."
        };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [audioPart, textPart] },
        });

        return response.text;

    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw new Error("Failed to transcribe the audio recording.");
    }
};

export const generateSubjectSvgPath = async (base64Image: string, mimeType: string, refine: boolean = false): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: `Analyze the main subject of the image. Provide only the SVG path data (the 'd' attribute content) that creates a closed shape outlining the subject. ${refine ? 'The path should have smoother, more refined edges.' : ''}`
        };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: "You are a precise image analysis tool that outputs only raw SVG path data. The path should be scaled to a 100x100 viewBox. Do not output anything else, including markdown code blocks or any explanations.",
                temperature: 0.1,
            }
        });

        let pathData = response.text.trim();
        const markdownMatch = pathData.match(/```(?:\w+)?\n([\s\S]+)```/);
        if (markdownMatch) {
            pathData = markdownMatch[1].trim();
        }
        
        // A simple check to see if the response looks like path data
        if (!pathData.toLowerCase().startsWith('m')) {
             throw new Error("Could not isolate the subject in the image.");
        }
        return pathData;

    } catch (error) {
        console.error("Error generating SVG path:", error);
        throw new Error("Failed to create a mask for this image.");
    }
};

export const summarizeResearchPaper = async (text: string): Promise<ResearchSummary> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following academic text and extract its core components.
            Text:
            ---
            ${text}
            ---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        researchQuestion: {
                            type: Type.STRING,
                            description: "The main question or hypothesis the research paper is addressing."
                        },
                        methodology: {
                            type: Type.STRING,
                            description: "A brief summary of the methods used in the research."
                        },
                        keyFindings: {
                            type: Type.STRING,
                            description: "A summary of the most important findings and conclusions of the paper."
                        }
                    },
                    required: ["researchQuestion", "methodology", "keyFindings"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const result = parseJsonFromMarkdown<ResearchSummary>(jsonStr);

        if (result) {
            return result;
        } else {
            throw new Error("API returned an invalid summary structure.");
        }
    } catch (error) {
        console.error("Error summarizing research:", error);
        throw new Error("Failed to summarize the research paper.");
    }
};

export const debugCode = async (code: string, errorMessage: string): Promise<DebugResult> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following code snippet and its error message. Provide an explanation of the error and a corrected version of the code.
            
            Code:
            \`\`\`
            ${code}
            \`\`\`

            Error Message:
            \`\`\`
            ${errorMessage}
            \`\`\`
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        explanation: {
                            type: Type.STRING,
                            description: "A clear and concise explanation of what the error is and why it's happening."
                        },
                        fixedCode: {
                            type: Type.STRING,
                            description: "The corrected version of the code snippet."
                        }
                    },
                    required: ["explanation", "fixedCode"]
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const result = parseJsonFromMarkdown<DebugResult>(jsonStr);
        
        if (result) {
            return result;
        } else {
            throw new Error("API returned an invalid debug result structure.");
        }

    } catch (error) {
        console.error("Error debugging code:", error);
        throw new Error("Failed to debug the code.");
    }
};

export const generateMarketingCopy = async (productName: string, description: string, copyType: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a compelling "${copyType}" for a product named "${productName}". The product description is: "${description}". The copy should be engaging and persuasive.`,
            config: {
                temperature: 0.8
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating marketing copy:", error);
        throw new Error("Failed to generate marketing copy. Please try again.");
    }
};

export const generateAvatarFromImage = async (base64Image: string, mimeType: string, style: string): Promise<string> => {
    // Step 1: Analyze the image to get a description of the person.
    let description = '';
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "Describe the person in this photo in detail, focusing on features like hair style and color, eye color, face shape, gender, ethnicity, and any prominent accessories like glasses or facial hair. Be objective and descriptive."
        };

        const descriptionResponse: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
        });
        description = descriptionResponse.text;
    } catch (error) {
        console.error("Error describing avatar image:", error);
        throw new Error("Failed to process the uploaded image.");
    }
    
    // Step 2: Generate a new image based on the description and style.
    const fullPrompt = `A close-up portrait of a person. ${description}. The style should be ${style}. Centered, high quality, detailed.`;

    try {
        const response: GenerateImagesResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("The API did not return any images for the avatar.");
        }

    } catch (error) {
        console.error("Error generating avatar image:", error);
        throw new Error("Failed to generate the avatar from the image description.");
    }
};

export const getEmojiRiddle = async (): Promise<EmojiRiddle> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Create a fun and clever emoji riddle. Provide the emoji sequence and the answer.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        riddle: {
                            type: Type.STRING,
                            description: "A string of emojis that form a riddle."
                        },
                        answer: {
                            type: Type.STRING,
                            description: "The answer to the riddle (a word or phrase)."
                        }
                    },
                    required: ["riddle", "answer"]
                },
                temperature: 1,
            }
        });

        const jsonStr = response.text.trim();
        const result = parseJsonFromMarkdown<EmojiRiddle>(jsonStr);

        if (result) {
            return result;
        } else {
            throw new Error("API returned an invalid riddle structure.");
        }
    } catch (error) {
        console.error("Error getting emoji riddle:", error);
        throw new Error("Failed to generate a new riddle.");
    }
};

export const continueStory = async (genre: string, storyHistory: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a collaborative storyteller. The current story genre is "${genre}". The story so far is provided below. Continue the story with one or two interesting paragraphs that build on the last entry.
            
            Story so far:
            ---
            ${storyHistory}
            ---
            
            Your turn:`,
            config: {
                temperature: 0.8
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error continuing story:", error);
        throw new Error("Failed to continue the story.");
    }
};

export const generateArticle = async (topic: string, keywords: string, tone: string, audience: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a well-structured article on the following topic: "${topic}". 
            Incorporate these keywords: ${keywords}. 
            The tone should be ${tone}.
            The target audience is: ${audience}.
            The article should have a clear introduction, body, and conclusion. Use markdown for formatting (e.g., # for title, ## for subheadings).`,
            config: {
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating article:", error);
        throw new Error("Failed to generate the article. Please try again.");
    }
};

export const rewriteForPlagiarism = async (text: string, strictness: number): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Rewrite the following text to improve its originality and avoid plagiarism. Preserve the core meaning, but use different sentence structures and vocabulary.
            
            Original Text:
            ---
            ${text}
            ---
            
            Rewritten Text:`,
            config: {
                temperature: strictness,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error rewriting text:", error);
        throw new Error("Failed to rewrite text for originality.");
    }
};

export const solveMathProblem = async (problem: string): Promise<MathSolution> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Solve the following math problem. Provide a step-by-step explanation. For any mathematical formulas in your response, wrap them in LaTeX delimiters, using $$...$$ for block equations and \\(...\\) for inline equations. Problem: ${problem}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        solution: {
                            type: Type.STRING,
                            description: "The final answer to the math problem. Wrap any math expressions in LaTeX delimiters."
                        },
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: "An array of strings, where each string is a step in solving the problem. Wrap any math expressions in LaTeX delimiters."
                        }
                    },
                    required: ["solution", "steps"]
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const result = parseJsonFromMarkdown<MathSolution>(jsonStr);
        
        if (result) {
            return result;
        } else {
            throw new Error("API returned an invalid math solution structure.");
        }
    } catch (error) {
        console.error("Error solving math problem:", error);
        throw new Error("Failed to solve the math problem. It may be too complex or malformed.");
    }
};

export const generateHistoryStory = async (topic: string): Promise<HistoryStory> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a captivating historian. Generate a factually accurate, narrative-style story about the following historical topic: "${topic}". The story should be engaging and easy to read.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "A compelling title for the historical story."
                        },
                        narrative: {
                            type: Type.STRING,
                            description: "The full story, written in an engaging, narrative style. Use paragraphs for structure."
                        }
                    },
                    required: ["title", "narrative"]
                },
                temperature: 0.7
            }
        });

        const jsonStr = response.text.trim();
        const result = parseJsonFromMarkdown<HistoryStory>(jsonStr);

        if (result) {
            return result;
        } else {
            throw new Error("API returned an invalid story structure.");
        }
    } catch (error) {
        console.error("Error generating history story:", error);
        throw new Error("Failed to generate the history story.");
    }
};

export const checkPlagiarism = async (text: string): Promise<PlagiarismResult> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following text for potential plagiarism by searching online. Provide a brief summary of your findings and list any potential sources you discover. Text: --- ${text} ---`,
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const foundSources: FoundSource[] = groundingMetadata?.groundingChunks?.map(chunk => ({
            url: chunk.web?.uri || '',
            title: chunk.web?.title || 'Unknown Source'
        })).filter(source => source.url) || [];

        // Deduplicate sources based on URL
        const uniqueSources = Array.from(new Map(foundSources.map(item => [item['url'], item])).values());
        
        return {
            summary: response.text,
            sources: uniqueSources,
        };

    } catch(error) {
        console.error("Error checking plagiarism:", error);
        throw new Error("Failed to check for plagiarism. The service may be temporarily unavailable.");
    }
}