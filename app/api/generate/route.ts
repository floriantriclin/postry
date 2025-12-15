import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; // 1. Import Supabase

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// 2. Init Supabase (Côté Serveur)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // On récupère tout le corps de la requête dans une variable 'body'
    const body = await request.json();
    
    const { 
      topic, 
      type,       
      goal,       
      speaker,    
      audience,   
      gender,     
      language,   
      tone,       
      length,
      userId // <--- 3. On récupère l'ID utilisateur
    } = body;

    // Utilisation de 2.5-flash (le plus stable et rapide actuellement)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- CONSTRUCTION DES INSTRUCTIONS GRAMMATICALES (Ton code d'origine) ---
    
    // 1. Qui parle ? (Speaker + Genre)
    let speakerInstruction = "";
    if (speaker === "je") {
      speakerInstruction = "Rédige à la 1ère personne du singulier ('Je').";
      if (gender === "femme") speakerInstruction += " ATTENTION : Le narrateur est une FEMME. Accorde tous les adjectifs et participes passés au féminin.";
      if (gender === "homme") speakerInstruction += " Le narrateur est un homme.";
    } else if (speaker === "nous") {
      speakerInstruction = "Rédige à la 1ère personne du pluriel ('Nous').";
    } else {
      speakerInstruction = "Ne pas utiliser de pronoms personnels (style impersonnel/journalistique).";
    }

    // 2. À qui on parle ? (Audience)
    let audienceInstruction = "";
    if (audience === "tu") audienceInstruction = "Tutoye le lecteur. Crée de la proximité.";
    if (audience === "vous") audienceInstruction = "Vouvoie le lecteur. Reste respectueux et professionnel.";
    if (audience === "none") audienceInstruction = "Ne t'adresse jamais directement au lecteur (pas de 'vous' ni de 'tu').";

    // 3. Objectif & Type
    const contextInstruction = `Type de post : ${type}. Objectif principal : ${goal}.`;

    // 4. Langue
    const langMap: any = { 
      "fr": "Français", "en": "Anglais", "es": "Espagnol", 
      "de": "Allemand", "it": "Italien", "pt": "Portugais" 
    };
    const targetLang = langMap[language] || "Français";

    // --- LE PROMPT FINAL ---
    const prompt = `
      Tu es un Expert Copywriter LinkedIn multilingue.
      
      TA MISSION :
      Rédiger un post LinkedIn en ${targetLang} sur le sujet : "${topic}".
      
      PARAMÈTRES STRUCTURELS :
      - Longueur : ${length}
      - Ton : ${tone}
      
      PARAMÈTRES D'IDENTITÉ (CRUCIAL) :
      - ${speakerInstruction}
      - ${audienceInstruction}
      - ${contextInstruction}
      
      RÈGLES D'OR DE RÉDACTION :
      1. Commence par une accroche (Hook) percutante de moins de 20 mots.
      2. Saute une ligne après l'accroche.
      3. Utilise des paragraphes courts et aérés.
      4. Inclus des émojis pertinents (mais pas trop).
      5. Termine par une question engageante (si pertinent avec l'objectif).
      6. Ajoute 3 à 5 hashtags à la fin.
      
      Génère uniquement le contenu du post.
    `;

    // --- GÉNÉRATION ---
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // --- 4. SAUVEGARDE DANS SUPABASE ---
    if (userId) {
      const { error } = await supabase.from('posts').insert({
        user_id: userId,
        topic: topic,
        content: text,
        parameters: body // On sauvegarde tous tes réglages (ton, langue, etc.) en JSON
      });
      
      if (error) {
        console.error("Erreur sauvegarde Supabase:", error);
        // On ne bloque pas l'utilisateur si la sauvegarde échoue, on loggue juste l'erreur
      }
    }

    return NextResponse.json({ output: text });

  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}