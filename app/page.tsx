"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Check, Sparkles, PenTool, Lock, Eye, EyeOff } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";
import { supabase } from "@/lib/supabase";
import { LANGUAGES, GOALS, TONES, SPEAKERS, GENDERS, AUDIENCES } from "@/lib/config";

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

// --- LISTE DES LONGUEURS (CONSTANTE LOCALE POUR LE CURSEUR) ---
const LENGTH_OPTIONS = [
  'Court (Flash)', 
  'Moyen (Classique)', 
  'Long (Détaillé)'
];

export default function Home() {
  // --- ÉTATS DU WORKFLOW ---
  const [step, setStep] = useState(1);
  const totalSteps = 4; // Réduit à 4 étapes
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState("");

  // --- ÉTATS D'AUTHENTIFICATION ---
  const [session, setSession] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    topic: "",
    language: "fr",
    type: "analyse",
    goal: "visibilité",
    speaker: "je",
    gender: "homme",
    audience: "vous",
    tone: "pédagogue",
    length: LENGTH_OPTIONS[1], // Valeur par défaut : Moyen
  });

  // --- GESTION DE SESSION ET PROFIL (FAST-TRACK) ---
  useEffect(() => {
    const checkUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setFormData(prev => ({
            ...prev,
            language: profileData.default_language || 'fr',
            goal: profileData.default_goal || 'visibilité',
            speaker: profileData.default_speaker || 'je',
            gender: profileData.default_gender || 'homme',
            audience: profileData.default_audience || 'vous',
            tone: profileData.default_tone || 'pédagogue',
          }));
          
          // Si le profil est configuré, on saute directement à l'étape 3 (Sujet)
          if (profileData.default_tone) {
            setStep(3);
          }
        }
      }
    };

    checkUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setStep(1);
      } else {
        checkUserAndProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- LOGIQUE AUTHENTIFICATION ---
  const handleAuth = async () => {
    if (!email || !password) return setAuthError("Veuillez remplir tous les champs.");
    if (password.length < 6) return setAuthError("Le mot de passe doit faire 6 caractères min.");
    
    setAuthLoading(true);
    setAuthError("");

    try {
      let response;
      if (authMode === 'signup') {
        response = await supabase.auth.signUp({ email, password });
      } else {
        response = await supabase.auth.signInWithPassword({ email, password });
      }
      const { data, error } = response;
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        setShowAuthModal(false);
      } else if (authMode === 'signup') {
        alert("Veuillez vérifier vos emails pour confirmer l'inscription.");
      }
    } catch (e: any) {
      setAuthError(e.message === "Invalid login credentials" ? "Identifiants incorrects." : e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    alert("Déconnecté avec succès.");
  };

  // --- LOGIQUE DE GÉNÉRATION ---
  const handleGenerateClick = () => {
    if (!formData.topic.trim()) return alert("Il faut écrire un sujet pour continuer !");
    
    if (session) {
      executeGeneration(session.user.id);
    } else {
      setShowAuthModal(true);
    }
  };

  const executeGeneration = async (userId: string | undefined) => {
    setIsLoading(true);
    setGeneratedPost("");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId }),
      });
      const data = await response.json();
      setGeneratedPost(data.output);
    } catch (e) {
      alert("Erreur de génération");
    } finally {
      setIsLoading(false);
    }
  };

  // --- NAVIGATION DU WORKFLOW ---
  const nextStep = () => {
    // Validation du sujet si on est à l'étape 3 et qu'on veut avancer
    if (step === 3 && !formData.topic.trim()) return alert("Il faut écrire un sujet pour continuer !");
    if (step < totalSteps) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Gestion spécifique pour le curseur (Range Slider)
  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    update('length', LENGTH_OPTIONS[value]);
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
      
      {/* HEADER AVEC CONNEXION/PROFIL */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Postry.ai</h1>
        <p className="text-gray-600 text-sm font-medium">L'Assistant LinkedIn Pro</p>
        
        {session ? (
          <div className="mt-4 flex flex-col items-center gap-2 animate-in fade-in">
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-xs text-green-800 font-bold">
              Connecté : {session.user.email}
            </div>
            
            <div className="flex gap-4 text-sm font-medium">
              <a href="/profile" className="text-blue-600 hover:underline hover:text-blue-800">
                ⚙️ Mon Profil
              </a>
              <span className="text-gray-300">|</span>
              <a href="/history" className="text-blue-600 hover:underline hover:text-blue-800">
                📂 Mon Historique
              </a>
              <span className="text-gray-300">|</span>
              <button 
                onClick={handleLogout}
                className="text-red-500 hover:underline hover:text-red-700"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-white border-2 border-gray-300 text-gray-800 font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Se connecter / S'inscrire
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-300 min-h-[500px] flex flex-col relative">
        
        {/* MODALE D'AUTHENTIFICATION */}
        {showAuthModal && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white p-2 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{authMode === 'signup' ? 'Inscription gratuite' : 'Connexion'}</h3>
              {authError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">{authError}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-gray-700">Mot de passe</label>
                    {authMode === 'signup' && <span className="text-xs text-gray-400">Min. 6 caractères</span>}
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
                  </div>
                </div>
                <button onClick={handleAuth} disabled={authLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-70">{authLoading ? 'Chargement...' : (authMode === 'signup' ? 'Créer un compte' : 'Se connecter')}</button>
                <div className="flex items-center gap-4 my-2"><div className="h-px bg-gray-200 flex-1"></div><div className="w-10 h-1 bg-gray-200 rounded-full"></div><div className="h-px bg-gray-200 flex-1"></div></div>
                <button onClick={handleGoogleAuth} className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {authMode === 'signup' ? "Google" : "Google"}
                </button>
              </div>
              <div className="mt-8 text-center text-sm">{authMode === 'signup' ? (<>Déjà inscrit(e) ? <button onClick={() => setAuthMode('signin')} className="text-blue-600 font-bold hover:underline">Connexion</button></>) : (<>Pas de compte ? <button onClick={() => setAuthMode('signup')} className="text-blue-600 font-bold hover:underline">Inscription gratuite</button></>)}</div>
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            </div>
          </div>
        )}

        {!generatedPost ? (
          <>
            <ProgressBar />
            <div className="flex-grow">
              
              {/* ÉTAPE 1 : CONTEXTE (Langue, Objectif) */}
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
                    {GOALS.map(goal => <option key={goal.value} value={goal.value}>{goal.label}</option>)}
                  </select>
                </div>
              )}

              {/* ÉTAPE 2 : IDENTITÉ (Speaker, Genre, Audience) */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Qui parle à qui ? 🗣️</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Je parle en tant que...</label>
                    <div className="flex gap-2">
                      {SPEAKERS.map((s) => (
                         <button 
                           key={s.value}
                           onClick={() => update("speaker", s.value)} 
                           className={`flex-1 py-3 border-2 rounded-xl font-bold capitalize
                             ${formData.speaker === s.value ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-900 border-gray-300'}`}
                         >
                           {s.label}
                         </button>
                      ))}
                    </div>
                  </div>

                  {formData.speaker === "je" && (
                     <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                     <label className="block text-sm font-bold text-gray-800 mb-2">Mon genre (pour les accords)</label>
                     <div className="flex gap-2">
                       {GENDERS.map(g => (
                         <button 
                           key={g.value} 
                           onClick={() => update("gender", g.value)} 
                           className={`flex-1 py-2 border-2 rounded-xl font-bold 
                             ${formData.gender === g.value 
                               ? (g.value === 'femme' ? 'bg-pink-100 text-pink-900 border-pink-400' : 'bg-blue-100 text-blue-900 border-blue-400') 
                               : 'text-gray-700 border-gray-300'}`}
                         >
                           {g.label}
                         </button>
                       ))}
                     </div>
                   </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Je m'adresse au lecteur via...</label>
                    <div className="flex gap-2">
                      {AUDIENCES.map((a) => (
                        <button 
                          key={a.value} 
                          onClick={() => update("audience", a.value)} 
                          className={`flex-1 py-3 border-2 rounded-xl font-bold 
                            ${formData.audience === a.value ? 'bg-blue-900 text-white border-blue-900' : 'text-gray-900 border-gray-300'}`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : SUJET & LONGUEUR (NOUVELLE ÉTAPE FUSIONNÉE) */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Le Contenu 🖊️</h2>
                  
                  {/* STYLE (Anciennement étape 3) - On l'intègre ici ou on le laisse avant ? 
                      Le user voulait "Sujet sur le même écran que la longueur".
                      Le style (TON) était à l'étape 3. 
                      Je vais garder le Ton ici aussi pour regrouper "Contenu".
                  */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Ton du post</label>
                    <select 
                      value={formData.tone}
                      onChange={(e) => update("tone", e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 font-medium mb-6 outline-none focus:border-blue-500"
                    >
                      {TONES.map(tone => <option key={tone.value} value={tone.value}>{tone.label}</option>)}
                    </select>
                  </div>

                  {/* SUJET */}
                  <div className="relative mb-8">
                    <label className="block text-sm font-bold text-gray-800 mb-2">De quoi parle-t-on ?</label>
                    <div className="relative">
                        <PenTool className="absolute top-4 left-4 w-5 h-5 text-gray-400" />
                        <textarea
                        className="w-full p-4 pl-12 rounded-2xl border-2 border-gray-300 focus:border-blue-600 outline-none text-lg text-gray-900 font-medium resize-none shadow-inner h-32"
                        placeholder="Ex: Les défis de la logistique en Afrique..."
                        value={formData.topic}
                        onChange={(e) => update("topic", e.target.value)}
                        autoFocus
                        />
                    </div>
                  </div>

                  {/* CURSEUR DE LONGUEUR */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-4">Longueur souhaitée</label>
                    <div className="relative px-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="1"
                        value={LENGTH_OPTIONS.indexOf(formData.length)}
                        onChange={handleLengthChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Court</span>
                        <span>Moyen</span>
                        <span>Long</span>
                      </div>
                      <div className="text-center mt-3 font-bold text-blue-800 bg-blue-50 p-2 rounded-lg text-sm border border-blue-100">
                        {formData.length.split('(')[0]} <span className="text-blue-400 font-normal text-xs">{formData.length.match(/\(([^)]+)\)/)?.[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

               {/* ÉTAPE 4 : RÉCAP & ACTION (FINALE) */}
               {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center flex flex-col items-center justify-center h-full">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <Sparkles className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-gray-900">Prêt à décoller ?</h2>
                  <p className="text-gray-600 mb-8 max-w-sm">
                    Génération d'un post <strong className="text-blue-700">{formData.length.split('(')[0].toLowerCase()}</strong> sur le sujet : <br/>
                    <span className="text-blue-700 font-bold">"{formData.topic}"</span>
                  </p>
                  
                  <button
                    onClick={handleGenerateClick}
                    disabled={isLoading}
                    className="w-full py-5 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl font-bold text-xl shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isLoading ? "L'IA réfléchit..." : "Générer mon Post 🚀"}
                  </button>

                   {/* Petit texte discret pour prévenir */}
                  {!session && (
                    <p className="text-xs text-gray-400 mt-4 flex items-center gap-1 justify-center">
                      <Lock className="w-3 h-3"/> Compte gratuit requis pour voir le résultat
                    </p>
                  )}
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