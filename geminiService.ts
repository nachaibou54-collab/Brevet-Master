
import { GoogleGenerativeAI } from "@google/generative-ai";

// On force l'utilisation de la clé Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateQuiz = async (subject: string, topic: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Génère un quiz de 5 questions QCM pour le niveau Brevet des Collèges sur le sujet suivant : ${subject} - Chapitre : ${topic}. 
    Réponds uniquement au format JSON avec cette structure : [{"question": "...", "options": ["...", "..."], "answer": 0, "explanation": "..."}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // On transforme le texte reçu en vrai objet utilisable par ton site
    return JSON.parse(text);
  } catch (error) {
    console.error("Erreur Gemini détaillée:", error);
    throw error;
  }
};
