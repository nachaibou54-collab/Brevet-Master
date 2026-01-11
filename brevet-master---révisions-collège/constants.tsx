import React from 'react';
import { Subject, SubjectInfo } from './types';

export const SUBJECTS: SubjectInfo[] = [
  {
    id: Subject.MATHS,
    icon: '📐',
    color: 'bg-blue-500',
    topics: [
      'Automatismes et Calcul mental',
      'Arithmétique', 
      'Calcul littéral', 
      'Théorème de Thalès', 
      'Théorème de Pythagore', 
      'Fonctions (Linéaires et Affines)', 
      'Statistiques et Probabilités', 
      'Géométrie dans l\'espace'
    ]
  },
  {
    id: Subject.FRENCH,
    icon: '📚',
    color: 'bg-red-500',
    topics: [
      'Dictée et Orthographe', 
      'Grammaire et Analyse', 
      'Compréhension de texte', 
      'Figures de style', 
      'Genres littéraires', 
      'Rédaction et Argumentation'
    ]
  },
  {
    id: Subject.HISTORY_GEO,
    icon: '🌍',
    color: 'bg-amber-500',
    topics: [
      'Un monde en guerre (1914-1945)', 
      'La Guerre Froide (1947-1991)', 
      'Indépendances et nouveaux États (Décolonisation)', 
      'Construction Européenne', 
      'La Vème République (depuis 1958)', 
      'Aménagement du territoire français', 
      'La France dans l\'UE et dans le monde', 
      'Citoyenneté, Démocratie et Engagement (EMC)'
    ]
  },
  {
    id: Subject.SCIENCES,
    icon: '🧪',
    color: 'bg-emerald-500',
    topics: [
      'Physique-Chimie : Organisation de la matière', 
      'Physique-Chimie : Énergie et Circuits', 
      'SVT : Le corps humain et la santé', 
      'SVT : La Terre, le vivant et l\'évolution', 
      'Technologie : Analyse et conception d\'objets', 
      'Technologie : Informatique et Programmation'
    ]
  }
];