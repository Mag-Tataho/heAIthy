import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyPlan, ChatMessage } from "../types";

// Initialize the API client. 
// Note: In a real production app, you might proxy this through a backend to protect the key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MEAL_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING },
    breakfast: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        macros: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fats: { type: Type.STRING }
          }
        }
      }
    },
    lunch: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        macros: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fats: { type: Type.STRING }
          }
        }
      }
    },
    dinner: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        macros: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fats: { type: Type.STRING }
          }
        }
      }
    },
    snack: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        macros: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fats: { type: Type.STRING }
          }
        }
      }
    },
    totalMacros: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fats: { type: Type.NUMBER }
      }
    }
  }
};

export const generateMealPlan = async (user: UserProfile): Promise<DailyPlan | null> => {
  try {
    const prompt = `
      Generate a personalized 1-day meal plan for a user with the following profile:
      Age: ${user.age}
      Gender: ${user.gender}
      Height: ${user.height}cm
      Weight: ${user.weight}kg
      Goal: ${user.goal}
      Activity Level: ${user.activityLevel}
      Dietary Preference: ${user.dietaryPreference}
      Allergies: ${user.allergies || 'None'}

      The plan should include Breakfast, Lunch, Dinner, and a Snack. 
      Provide macronutrient details for each meal and totals for the day.
      Ensure the calorie count aligns with their goal.
      IMPORTANT: STRICTLY ADHERE to the dietary preference (e.g., if Vegan, NO meat, dairy, eggs, or animal products. If Vegetarian, no meat).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: MEAL_PLAN_SCHEMA,
        systemInstruction: "You are an expert dietician and nutritionist. You prioritize the user's dietary preferences above all else."
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as DailyPlan;

  } catch (error) {
    console.error("Error generating meal plan:", error);
    return null;
  }
};

export const generateNutritionAdvice = async (history: ChatMessage[], user: UserProfile): Promise<string> => {
  try {
    // Construct the chat history for the prompt context
    // We only take the last 10 messages to keep context window manageable for this demo
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const systemContext = `
      You are a friendly and knowledgeable AI Nutrition Assistant.
      User Profile:
      - Goal: ${user.goal}
      - Diet: ${user.dietaryPreference}
      - Allergies: ${user.allergies || 'None'}
      
      Provide concise, helpful, and scientifically accurate nutrition advice.
      Keep responses under 150 words unless asked for a detailed explanation.
      Always respect the user's dietary preference (${user.dietaryPreference}).
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: recentHistory,
      config: {
        systemInstruction: systemContext
      }
    });

    // The user's last message is not in history yet, so we don't send it here again if we rely on standard chat flow.
    // However, the standard way in this codebase structure is usually stateless call or stateful chat object.
    // Let's assume the component manages state and we just send the LAST message content to a new chat session with history.
    // Actually, simpler: We can just use generateContent with history if we aren't maintaining a long-running chat object instance.
    // Or correctly use the chat object.
    
    // To match the UI flow where we pass history:
    const lastUserMessage = history[history.length - 1];
    if (lastUserMessage.role !== 'user') return "I'm ready to help!";

    const response = await chat.sendMessage({
      message: lastUserMessage.text
    });

    return response.text || "I couldn't generate a response. Please try again.";

  } catch (error) {
    console.error("Error getting chat response:", error);
    return "Sorry, I'm having trouble connecting to the nutrition database right now.";
  }
};