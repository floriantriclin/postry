"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Sparkles, PenTool } from "lucide-react";
import "flag-icons/css/flag-icons.min.css"; // <--- 1. IMPORT DES DRAPEAUX

// --- TYPES DE DONNÉES ---
type FormData = {
  topic: string;
  type: string;
  goal: string;
  speaker: string;
  audience: string;
  gender: string;
  language: string;
  tone: string;
  length: string;
};

// --- 2. LISTE DES LANGUES MISE À JOUR (flag = code pays ISO) ---
const LANGUAGES = [
  { code: 'fr', flag: 'fr', label: 'Français' },
  { code: 'en', flag: 'gb', label: 'English' }, // gb pour Great Britain
  { code: 'es', flag: 'es', label: 'Español' },
  { code: 'de', flag: 'de', label: 'Deutsch' },
  { code: 'it', flag: 'it', label: 'Italiano' },
  { code: 'pt', flag: 'pt', label: 'Português' },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState("");

  const [formData, setFormData] = useState<FormData>({
    topic: "",
    language: "fr",
    type: "analyse",
    goal: "visibilité",
    speaker: "je",
    gender: "homme",
    audience: "vous",
    tone: "pédagogue",
    length: "moyen",
  });

  const nextStep = () => {
    if (step === 4 && !formData.topic.trim()) return alert("Il faut écrire un sujet pour continuer !");
    if (step < totalSteps) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedPost("");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setGeneratedPost(data.output);
    } catch (e) {
      alert("Erreur de génération");
    } finally {
      setIsLoading(false);
    }
  };

  const ProgressBar = () => (
    <div className="w-full bg-gray-200 h-2.5 rounded-full mb-8 overflow-hidden border border-gray-300">
      <div 
        className="bg-blue-900 h-full transition-all duration-500 ease-out"
        style={{ width: `${(step / totalSteps) * 100}%` }}
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Postry.ai</h1>
        <p className="text-gray-600 text-sm font-medium">L'Assistant LinkedIn Pro</p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-300 min-h-[500px] flex flex-col relative">
        
        {!generatedPost ? (
          <>
            <ProgressBar />

            <div className="flex-grow">
              
              {/* ÉTAPE 1 : CONTEXTE */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Commençons par les bases 🌍</h2>
                  
                  <label className="block text-sm font-bold text-gray-800 mb-2">Langue de rédaction</label>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => update("language", l.code)}
                        className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-3
                          ${formData.language === l.code 
                            ? 'bg-blue-900 text-white border-blue-900 shadow-md' 
                            : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                      >
                        {/* 3. AFFICHAGE DU DRAPEAU VIA CLASS CSS */}
                        <span className={`fi fi-${l.flag} text-lg`}></span>
                        {l.label}
                      </button>
                    ))}
                  </div>

                  <label className="block text-sm font-bold text-gray-800 mb-2">Quel est l'objectif ?</label>
                  <select 
                    value={formData.goal}
                    onChange={(e) => update("goal", e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 font-medium focus:border-blue-500 outline-none"
                  >
                    <option value="visibilité">👁️ Visibilité (Maximiser les vues)</option>
                    <option value="engagement">💬 Engagement (Générer des débats)</option>
                    <option value="vente">💰 Conversion (Vendre / Leads)</option>
                    <option value="autorité">🏆 Autorité (Preuve d'expertise)</option>
                  </select>
                </div>
              )}

              {/* ÉTAPE 2 : IDENTITÉ */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Qui parle à qui ? 🗣️</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Je parle en tant que...</label>
                    <div className="flex gap-2">
                      {['je', 'nous', 'neutre'].map((s) => (
                         <button 
                           key={s}
                           onClick={() => update("speaker", s)} 
                           className={`flex-1 py-3 border-2 rounded-xl font-bold capitalize
                             ${formData.speaker === s ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-900 border-gray-300'}`}
                         >
                           {s}
                         </button>
                      ))}
                    </div>
                  </div>

                  {formData.speaker === "je" && (
                     <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                     <label className="block text-sm font-bold text-gray-800 mb-2">Mon genre (pour les accords)</label>
                     <div className="flex gap-2">
                       <button onClick={() => update("gender", "homme")} className={`flex-1 py-2 border-2 rounded-xl font-bold ${formData.gender === 'homme' ? 'bg-blue-100 text-blue-900 border-blue-400' : 'text-gray-700 border-gray-300'}`}>Homme</button>
                       <button onClick={() => update("gender", "femme")} className={`flex-1 py-2 border-2 rounded-xl font-bold ${formData.gender === 'femme' ? 'bg-pink-100 text-pink-900 border-pink-400' : 'text-gray-700 border-gray-300'}`}>Femme</button>
                     </div>
                   </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Je m'adresse au lecteur via...</label>
                    <div className="flex gap-2">
                      <button onClick={() => update("audience", "tu")} className={`flex-1 py-3 border-2 rounded-xl font-bold ${formData.audience === 'tu' ? 'bg-blue-900 text-white border-blue-900' : 'text-gray-900 border-gray-300'}`}>Tu</button>
                      <button onClick={() => update("audience", "vous")} className={`flex-1 py-3 border-2 rounded-xl font-bold ${formData.audience === 'vous' ? 'bg-blue-900 text-white border-blue-900' : 'text-gray-900 border-gray-300'}`}>Vous</button>
                      <button onClick={() => update("audience", "none")} className={`flex-1 py-3 border-2 rounded-xl font-bold ${formData.audience === 'none' ? 'bg-blue-900 text-white border-blue-900' : 'text-gray-900 border-gray-300'}`}>Ø</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : STYLE */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Le style de rédaction 🎨</h2>
                  
                  <label className="block text-sm font-bold text-gray-800 mb-2">Ton du post</label>
                  <select 
                    value={formData.tone}
                    onChange={(e) => update("tone", e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 font-medium mb-6 outline-none focus:border-blue-500"
                  >
                    <option value="pédagogue">🎓 Pédagogue & Expert</option>
                    <option value="storytelling">✨ Émotionnel & Personnel</option>
                    <option value="clivant">🔥 Clivant & Direct</option>
                    <option value="professionnel">💼 Formel & Corporate</option>
                    <option value="humoristique">😂 Léger & Drôle</option>
                  </select>

                  <label className="block text-sm font-bold text-gray-800 mb-2">Longueur souhaitée</label>
                  <div className="space-y-3">
                    {['Court (Flash)', 'Moyen (Classique)', 'Long (Détaillé)'].map((l) => (
                      <button
                        key={l}
                        onClick={() => update("length", l)}
                        className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all font-bold
                          ${formData.length === l 
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm' 
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'}`}
                      >
                        <span>{l}</span>
                        {formData.length === l && <Check className="w-5 h-5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : SUJET */}
              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">De quoi parle-t-on ? 🖊️</h2>
                  <p className="text-gray-600 mb-6">C'est le moment de donner de la matière à l'IA.</p>
                  
                  <div className="relative">
                    <PenTool className="absolute top-4 left-4 w-5 h-5 text-gray-400" />
                    <textarea
                      className="w-full p-4 pl-12 rounded-2xl border-2 border-gray-300 focus:border-blue-600 outline-none text-lg text-gray-900 font-medium resize-none shadow-inner h-48"
                      placeholder="Ex: Les défis de la logistique en Afrique, et pourquoi il faut investir dans les drones..."
                      value={formData.topic}
                      onChange={(e) => update("topic", e.target.value)}
                      autoFocus
                    />
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-2">Plus tu es précis, meilleur sera le post.</p>
                </div>
              )}

               {/* ÉTAPE 5 : RÉCAP */}
               {step === 5 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center flex flex-col items-center justify-center h-full">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <Sparkles className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-gray-900">Prêt à décoller ?</h2>
                  <p className="text-gray-600 mb-8 max-w-sm">
                    Nous allons rédiger un post en <strong>{LANGUAGES.find(l => l.code === formData.language)?.label}</strong> sur le sujet : <br/>
                    <span className="text-blue-700 font-bold">"{formData.topic}"</span>
                  </p>
                  
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-5 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl font-bold text-xl shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isLoading ? "L'IA réfléchit..." : "Générer mon Post 🚀"}
                  </button>
                </div>
              )}
            </div>

            {/* NAV */}
            <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={prevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition ${step === 1 ? 'opacity-0 cursor-default' : ''}`}
              >
                <ArrowLeft className="w-5 h-5" /> Retour
              </button>

              {step < totalSteps && (
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg"
                >
                  Suivant <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* RESULTAT */
          <div className="animate-in zoom-in-95 duration-500 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-extrabold text-blue-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Ton Post Postry
              </h2>
              <button 
                onClick={() => setGeneratedPost("")} 
                className="text-sm font-bold text-gray-500 hover:text-blue-700 transition"
              >
                ↺ Nouveau
              </button>
            </div>
            
            <div className="flex-grow bg-white rounded-xl p-0 md:pr-2 overflow-y-auto">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {generatedPost}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                onClick={() => navigator.clipboard.writeText(generatedPost)}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 active:scale-95"
                >
                <Check className="w-6 h-6" /> Copier le texte
                </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}