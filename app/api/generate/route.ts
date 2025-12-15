import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Initialisation de Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: Request) {
  try {
    // 2. On récupère ce que l'utilisateur a envoyé depuis le Frontend
    const { topic, tone } = await request.json();

    // 3. Choix du modèle (On utilise le plus puissant disponible : Gemini 1.5 Pro)
    // Note : Si Gemini 3 sort via API, il suffira de changer le nom ici.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Construction du Prompt (Ta recette secrète validée)
    // On injecte dynamiquement le sujet et le ton choisis.
    const prompt = `
      Ton rôle est celui d'un expert LinkedIn.
      Tu dois rédiger un post optimisé pour la viralité.
      
      CONTEXTE :
      - Sujet : "${topic}"
      - Ton souhaité : "${tone}"
      
      CONTRAINTES DE RÉDACTION :
      - Accroche (Hook) : Moins de 15 mots, percutante, doit interpeller.
      - Longueur : Moins de 300 mots.
      - Structure : Paragraphes courts, aérés.
      - Style : 1ère personne du singulier ("Je").
      - Ne t'adresse pas au lecteur directement (pas de "vous", ni de "tu") sauf si le ton est "Promotionnel".
      - Inclus 1 à 4 émojis pertinents.
      - Termine par 3 à 5 hashtags pertinents.
      - Base-toi sur des connaissances générales solides et actuelles.
    `;

    // 5. Envoi à l'IA
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. On renvoie le texte généré au Frontend
    return NextResponse.json({ output: text });

  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}