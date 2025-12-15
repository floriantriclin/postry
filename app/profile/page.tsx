"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
// On importe nos listes centralisées !
import { LANGUAGES, GOALS, TONES, SPEAKERS, GENDERS, AUDIENCES } from "@/lib/config";

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    default_language: 'fr',
    default_goal: 'visibilité',
    default_speaker: 'je',
    default_gender: 'homme',
    default_audience: 'vous',
    default_tone: 'pédagogue'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileField = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);

    const updates = {
      id: session.user.id,
      ...profile,
    };
    
    const { error } = await supabase.from('profiles').upsert(updates);
    
    if (error) {
      alert("Erreur lors de la sauvegarde.");
      console.error(error);
    } else {
      alert("Préférences sauvegardées !");
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-600 hover:text-blue-900">
            <ArrowLeft className="w-5 h-5" /> Retour
          </Link>
          <h1 className="text-xl font-extrabold text-blue-900 flex items-center gap-2">
            <User className="w-5 h-5" /> Mon Profil de Rédaction
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-1 text-gray-900">Préférences par défaut</h2>
            <p className="text-sm text-gray-500 mb-8">
              Réglez votre style une bonne fois pour toutes. Ces paramètres seront utilisés à chaque nouvelle génération.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Langue */}
              <div>
                <label className="label-style">Langue</label>
                <select value={profile.default_language} onChange={e => updateProfileField('default_language', e.target.value)} className="select-style">
                  {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
                </select>
              </div>

              {/* Objectif */}
              <div>
                <label className="label-style">Objectif</label>
                <select value={profile.default_goal} onChange={e => updateProfileField('default_goal', e.target.value)} className="select-style">
                  {GOALS.map(goal => <option key={goal.value} value={goal.value}>{goal.label}</option>)}
                </select>
              </div>
              
              {/* Ton */}
              <div>
                <label className="label-style">Ton</label>
                <select value={profile.default_tone} onChange={e => updateProfileField('default_tone', e.target.value)} className="select-style">
                  {TONES.map(tone => <option key={tone.value} value={tone.value}>{tone.label}</option>)}
                </select>
              </div>

              {/* Speaker */}
              <div>
                <label className="label-style">Je parle en tant que...</label>
                <select value={profile.default_speaker} onChange={e => updateProfileField('default_speaker', e.target.value)} className="select-style">
                  {SPEAKERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Genre */}
              <div>
                <label className="label-style">Mon genre (accords)</label>
                <select value={profile.default_gender} onChange={e => updateProfileField('default_gender', e.target.value)} className="select-style">
                  {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>

              {/* Audience */}
              <div>
                <label className="label-style">Je m'adresse au lecteur</label>
                <select value={profile.default_audience} onChange={e => updateProfileField('default_audience', e.target.value)} className="select-style">
                  {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>

            </div>

            <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-blue-900 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 hover:bg-blue-800 transition shadow-lg"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
                Sauvegarder mes préférences
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .label-style { @apply block text-sm font-bold text-gray-800 mb-2; }
        .select-style { @apply w-full p-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 font-medium outline-none focus:border-blue-600; }
      `}</style>
    </main>
  );
}