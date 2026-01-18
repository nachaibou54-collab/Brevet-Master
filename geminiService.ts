import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialisation du client Gemini
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- FONCTION 1 : GÉNÉRATION DU QUIZ ---
export const generateQuiz = async (subject: any, topic: string) => {
  // 1. On définit le modèle (Flash est rapide et économique)
  const model = ai.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json" // Force la réponse en JSON pur
    }
  });

  // 2. Le prompt précis pour avoir du JSON
  const prompt = `Génère un quiz de 5 questions QCM sur le sujet "${subject}" et le thème "${topic}".
  Le format de réponse DOIT être un tableau JSON strict comme ceci :
  [
    {
      "question": "La question ?",
      "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
      "answer": 0,
      "explanation": "Pourquoi c'est la bonne réponse."
    }
  ]
  Ne mets pas de balises markdown, juste le JSON.`;

  try {
    // 3. Appel à l'IA
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const text = response.text();
    
    // 4. On nettoie et on renvoie l'objet
    return JSON.parse(text);

  } catch (error) {
    console.error("Erreur génération Quiz:", error);
    // En cas d'erreur, on renvoie un tableau vide pour ne pas faire planter le site
    return [];
  }
};

// --- FONCTION 2 : RÉSUMÉ EN STREAMING ---
export const generateSummaryStream = async (prompt: string) => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    return result.stream;
  } catch (error) {
    console.error("Erreur stream résumé:", error);
    throw error;
  }
};

// --- FONCTION 3 : CLARIFICATION / QUESTION ---
export const askClarification = async (prompt: string) => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = await result.response;
    return response.text() || "Désolé, je n'ai pas pu générer d'explication.";
  } catch (error) {
    console.error("Erreur clarification:", error);
    return "Une erreur est survenue lors de l'explication.";
  }
};
