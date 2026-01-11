
import { GoogleGenerativeAI, GenerateContentResponse } from "@google/generative-ai";
import { QuizQuestion, Subject } from "./types";
import { errorTracker } from "./utils/errorTracker";

/**
 * Génère un quiz de révision.
 * Utilise gemini-1.5-flash pour les tâches STEM et de raisonnement complexe (Brevet 3ème).
 */
export const generateQuiz = async (subject: Subject, topic: string): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenerativeAI('GEMINI_API_KEY');
  
  const prompt = `Génère un quiz de 5 questions à choix multiples pour le niveau Brevet des Collèges (3ème) sur le sujet suivant : ${subject} - Chapitre : ${topic}. 
  Les questions doivent être variées et conformes au programme scolaire français. 
  
  IMPORTANT : Pour les expressions mathématiques :
  - Utilise le symbole de multiplication '×' (U+00D7) pour les multiplications.
  - Utilise la lettre minuscule 'x' uniquement pour la variable mathématique (ex: 2x + 3).
  
  Donne une explication pédagogique concise pour chaque réponse.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4 options possibles"
              },
              correctAnswer: { type: Type.INTEGER, description: "Index de la réponse correcte (0-3)" },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"],
            propertyOrdering: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    errorTracker.captureError(error instanceof Error ? error : new Error('Erreur API Gemini Quiz'), { context: 'generateQuiz', subject, topic });
    throw error;
  }
};

/**
 * Génère une fiche de révision en streaming pour un affichage ultra-rapide.
 * Utilise gemini-1.5-flash pour garantir une haute qualité pédagogique sur les sujets du Brevet.
 */
export async function* generateSummaryStream(subject: Subject, topic: string): AsyncGenerator<string> {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  let subjectSpecificInstructions = '';
  if (subject === 'Histoire-Géographie & EMC') {
    subjectSpecificInstructions = `
    - Section **"Chronologie Express"** : Liste les dates et événements pivots.
    - Section **"Vocabulaire Clé"** : Définitions indispensables.`;
  } else if (subject === 'Mathématiques') {
    subjectSpecificInstructions = `
    - Section **"L'Essentiel en Formules"** : Présente les formules vitales.
    - Section **"Méthode Type"** : Résolution étape par étape.`;
  }

  const prompt = `Agis comme le meilleur professeur de France spécialisé dans la préparation au Brevet des Collèges. 
  Rédige une fiche de révision "ULTRA-PERFORMANTE" pour le Brevet 2025.
  Sujet : ${subject} - Chapitre : ${topic}.
  Structure : Le Cœur du Sujet, Cours Détaillé, ${subjectSpecificInstructions}, Flash-Mémoire, Conseil de l'Examinateur.`;

  try {
    const result = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    for await (const chunk of result) {
      const response = chunk as GenerateContentResponse;
      if (response.text) {
        yield response.text;
      }
    }
  } catch (error) {
    errorTracker.captureError(error instanceof Error ? error : new Error('Erreur API Gemini Summary Stream'), { context: 'generateSummaryStream', subject, topic });
    throw error;
  }
}

/**
 * Clarification interactive.
 * Utilise gemini-3-flash-preview pour une assistance pédagogique réactive et simple.
 */
export const askClarification = async (subject: string, topic: string, summary: string, question: string): Promise<string> => {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  const prompt = `Tu es un professeur de 3ème bienveillant. Réponds à cette question sur le chapitre "${topic}" (${subject}).
  CONTEXTE : ${summary}
  QUESTION : "${question}"`;

  try {
    const response = await ai.models.generateContent({
      model: gemini-1.5-flash,
      contents: prompt
    });
    return response.text || "Désolé, je n'ai pas pu générer d'explication.";
  } catch (error) {
    errorTracker.captureError(error instanceof Error ? error : new Error('Erreur API Clarification'), { context: 'askClarification', subject, topic });
    throw error;
  }
};
