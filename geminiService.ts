import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Connexion à l'IA
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// --- FONCTION DU QUIZ ---
export const generateQuiz = async (subject: string, topic: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Génère un quiz de 5 questions QCM sur : ${subject} (${topic}).
    Format JSON strict : [{"question": "...", "options": ["...", "...", "...", "..."], "answer": 0, "explanation": "..."}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // On nettoie le texte pour être sûr qu'il n'y a que du JSON
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Erreur Quiz:", error);
    return []; // Renvoie une liste vide pour éviter de faire planter l'écran
  }
};

// --- FONCTION DU RÉSUMÉ ---
export const generateSummaryStream = async (subject: string, topic: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Rédige une fiche de révision pour le Brevet sur : ${subject} - ${topic}`;
  
  const result = await model.generateContentStream(prompt);
  return result.stream;
};

// --- FONCTION CLARIFICATION ---
export const askClarification = async (question: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(question);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Désolé, je ne peux pas répondre pour le moment.";
  }
};
