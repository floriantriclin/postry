"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown'; // Optionnel pour le futur, mais on prépare

export default function Home() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("storytelling");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(""); // Pour stocker le résultat

  const handleGenerate = async () => {
    if (!topic) return alert("Hé, il faut me donner un sujet ! 😉");
    
    setIsLoading(true);
    setGeneratedPost(""); // On vide l'ancien post

    try {
      // Appel à notre API (route.ts)
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setGeneratedPost(data.output); // On affiche le résultat !

    } catch (error) {
      console.error(error);
      alert("Oups, une erreur est survenue lors de la génération.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans text-gray-900">
      
      <div className="w-full max-w-2xl flex justify-between items-center py-6">
        <h1 className="text-2xl font-bold tracking-tighter text-blue-700">
          Postry.ai
        </h1>
        <div className="text-sm text-gray-500">v0.1 MVP • Gemini Inside</div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mt-6 border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          De quoi on parle aujourd'hui ?
        </h2>
        
        <div className="space-y-6 mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
            <textarea
              rows={3}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all resize-none text-lg"
              placeholder="Ex: L'importance de l'IA en Afrique..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ton</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['pédagogue', 'storytelling', 'opinion', 'promotionnel'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-3 px-4 rounded-lg text-sm font-medium capitalize border transition-all
                    ${tone === t 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? "L'IA rédige..." : "Générer avec Gemini ✨"}
          </button>
        </div>
      </div>

      {/* --- ZONE D'AFFICHAGE DU RÉSULTAT --- */}
      {generatedPost && (
        <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
            <h3 className="font-bold text-blue-800">🎉 Ton Post est prêt</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(generatedPost)}
              className="text-xs bg-white text-blue-600 px-3 py-1 rounded border border-blue-200 hover:bg-blue-100 transition"
            >
              Copier
            </button>
          </div>
          <div className="p-8 whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
            {generatedPost}
          </div>
        </div>
      )}

    </main>
  );
}