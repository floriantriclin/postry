"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Calendar, Trash2, Loader2, Target, Mic } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function History() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // 1. Charger la session et les posts au démarrage
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchPosts(session.user.id);
    });
  }, []);

  // 2. Fonction pour récupérer les posts depuis Supabase
  const fetchPosts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fonction pour supprimer un post
  const handleDelete = async (postId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce post ?")) return;
    setPosts(posts.filter(p => p.id !== postId));
    await supabase.from('posts').delete().eq('id', postId);
  };

  if (!session && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
        <Link href="/" className="text-blue-600 hover:underline">Retourner à l'accueil</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* HEADER SIMPLE */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-900 transition font-bold">
            <ArrowLeft className="w-5 h-5" /> Retour au Générateur
          </Link>
          <h1 className="text-xl font-extrabold text-blue-900">Mes Posts ({posts.length})</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 py-8">
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 inline-block">
              <h2 className="text-xl font-bold text-gray-900 mb-2">C'est vide ici ! 🌵</h2>
              <p className="text-gray-500 mb-6">Vous n'avez pas encore généré de contenu.</p>
              <Link href="/" className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition">
                Créer mon premier post
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition group">
                
                {/* En-tête de la carte */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-grow pr-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{post.topic}</h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {/* Date */}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>

                      {/* Badges des paramètres */}
                      {post.parameters && (
                        <div className="flex gap-2">
                          {/* TON */}
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 capitalize font-medium">
                            <Mic className="w-3 h-3" />
                            {post.parameters.tone}
                          </span>
                          {/* OBJECTIF (Ajouté) */}
                          <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 capitalize font-medium">
                            <Target className="w-3 h-3" />
                            {post.parameters.goal}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contenu du post (SCROLLABLE) */}
                {/* Changements ici : h-64 pour fixer la hauteur, overflow-y-auto pour scroller */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap mb-4 font-medium h-64 overflow-y-auto custom-scrollbar">
                  {post.content}
                </div>

                {/* Actions */}
                <div className="flex justify-end border-t border-gray-100 pt-3">
                    <button 
                    onClick={() => {
                        navigator.clipboard.writeText(post.content);
                        alert("Copié dans le presse-papier !");
                    }}
                    className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:bg-blue-50 px-4 py-2 rounded-lg transition"
                    >
                    <Copy className="w-4 h-4" /> Copier le texte complet
                    </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Petit CSS pour rendre la scrollbar plus jolie (optionnel) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 8px;
          border: 2px solid #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </main>
  );
}